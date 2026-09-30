#!/bin/bash
# Weekly GSC audit + submit. Runs from launchd every Sunday at 07:00.
# - Saves the previous audit (gsc-audit.ts handles this)
# - Runs the audit, retrying from its checkpoint if it fails
# - Submits any Unknown/Discovered URLs
# - Appends results to scripts/gsc-output/weekly.log
# - Posts a macOS notification with the summary
#
# To run manually: ~/aicanvas/scripts/gsc-weekly.sh

set -uo pipefail  # not -e — we want partial failures to still notify

REPO=$HOME/aicanvas
LOG="$REPO/scripts/gsc-output/weekly.log"
PROGRESS="$REPO/scripts/gsc-output/audit-progress.json"
AUDIT_JSON="$REPO/scripts/gsc-output/audit.json"
TS=$(date "+%Y-%m-%d %H:%M:%S %Z")

# launchd inherits a minimal PATH. Add common bin dirs.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# A full audit is one live URL Inspection call per URL — around 25 minutes at
# 215 URLs, and it grows with the sitemap. Idle sleep killed the 2026-09-20 run
# at 112/212 and the 2026-09-27 run at 45/215: the process died outright, so
# neither left a result OR a failure line. caffeinate holds the machine awake
# for as long as this script runs. It cannot survive a lid close or a shutdown.
if [ -z "${GSC_CAFFEINATED:-}" ] && command -v caffeinate >/dev/null 2>&1; then
  export GSC_CAFFEINATED=1
  exec caffeinate -i "$0" "$@"
fi

cd "$REPO" || { echo "[$TS] FAILED to cd $REPO" >> "$LOG"; exit 1; }

{
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$TS] Weekly GSC run"
  echo "════════════════════════════════════════════════════════════"
} >> "$LOG"

# A leftover checkpoint means the run before this one was killed mid-audit.
# Say so in the log: without this, a dead run is invisible until someone
# notices the audit is a week old. gsc-resume.ts only reuses a checkpoint
# under 24h old, so a weekly gap starts over rather than reporting stale data.
if [ -f "$PROGRESS" ]; then
  LEFTOVER=$(node -e '
    try {
      const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      console.log(`${(j.entries || []).length} URLs, started ${j.startedAt}`);
    } catch { console.log("unreadable"); }
  ' "$PROGRESS" 2>/dev/null || echo "unreadable")
  echo "[$TS] previous run never finished — checkpoint holds $LEFTOVER" >> "$LOG"
fi

# 1. Audit — up to 3 attempts. The audit checkpoints after every URL, so a
# second attempt resumes instead of re-inspecting what the first already did.
# This is what covers a transient network drop mid-run (the 2026-09-27 run hit
# ENOTFOUND oauth2.googleapis.com at URL 41).
RUN_STARTED=$(date +%s)
AUDIT_OK=false
ATTEMPTS=0
for attempt in 1 2 3; do
  ATTEMPTS=$attempt
  if [ "$attempt" -gt 1 ]; then
    echo "[$TS] audit attempt $attempt, resuming from the checkpoint" >> "$LOG"
    sleep 60
  fi
  if npm run gsc:audit >> "$LOG" 2>&1; then
    AUDIT_OK=true
    break
  fi
done

# A zero exit is not proof of a fresh file. If audit.json was not rewritten by
# this run, its numbers are last week's and reporting them reads as a fresh
# result while hiding the breakage (exactly how the 2026-07-20 run logged
# "DONE" with week-old counts).
if $AUDIT_OK; then
  AUDIT_MTIME=$(stat -f %m "$AUDIT_JSON" 2>/dev/null || echo 0)
  if [ "$AUDIT_MTIME" -lt "$RUN_STARTED" ]; then
    AUDIT_OK=false
    echo "[$TS] audit exited 0 but audit.json was not rewritten — treating as failed" >> "$LOG"
  fi
fi

# Pull summary counts from the new audit.json — ONLY if the audit succeeded.
if $AUDIT_OK; then
  COUNTS=$(node -e '
    const j = JSON.parse(require("fs").readFileSync("scripts/gsc-output/audit.json","utf8"));
    const t = j.totalUrls;
    const i = j.counts["Indexed"] || 0;
    const u = j.counts["Unknown to Google"] || 0;
    const d = j.counts["Discovered, awaiting crawl"] || 0;
    const c = j.counts["Crawled, not indexed"] || 0;
    console.log(`${i}/${t} indexed; ${u} unknown; ${d} discovered; ${c} crawled-not-indexed`);
  ' 2>/dev/null) || COUNTS="audit ran but audit.json is unreadable"
else
  COUNTS="audit FAILED after $ATTEMPTS of 3 attempts, no fresh data"
fi

# 2. Submit (only if audit succeeded)
SUBMIT_SUMMARY=""
if $AUDIT_OK; then
  npm run gsc:submit >> "$LOG" 2>&1
  # Extract last "Done. X ok, Y errors." line for the notification.
  SUBMIT_SUMMARY=$(grep -E "^Done\." "$LOG" | tail -1)
fi

# 3. Notification
if $AUDIT_OK; then
  TITLE="GSC weekly: $COUNTS"
  BODY="${SUBMIT_SUMMARY:-Run complete}. See scripts/gsc-output/audit-report.md"
  [ "$ATTEMPTS" -gt 1 ] && BODY="$BODY (took $ATTEMPTS attempts)"
else
  TITLE="GSC weekly FAILED"
  BODY="$ATTEMPTS of 3 attempts, no fresh audit. See $LOG"
fi

osascript -e "display notification \"$BODY\" with title \"$TITLE\"" 2>>"$LOG" || true

{
  if $AUDIT_OK; then
    echo "[$TS] DONE — $COUNTS — ${SUBMIT_SUMMARY:-no submit} — attempts: $ATTEMPTS"
  else
    echo "[$TS] FAILED — $COUNTS"
  fi
} >> "$LOG"

# Bing runs straight after, whatever GSC's outcome: the two are independent.
# Chaining keeps it to one launchd job, and a long GSC pass can never overlap it.
"$REPO/scripts/bing-weekly.sh"
