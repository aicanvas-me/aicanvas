#!/bin/bash
# Weekly Bing Webmaster audit + submit. gsc-weekly.sh calls it when the GSC run
# ends, so it has no launchd job of its own. The Bing twin of gsc-weekly.sh:
# - Runs the audit (bing-audit.ts keeps the previous audit for diffing)
# - Submits the URLs Bing has not crawled, within the daily quota
# - Appends results to scripts/bing-output/weekly.log
# - Posts a macOS notification with the summary
#
# To run manually: ~/aicanvas/scripts/bing-weekly.sh

set -uo pipefail  # not -e — we want partial failures to still notify

REPO=$HOME/aicanvas
LOG="$REPO/scripts/bing-output/weekly.log"
PROGRESS="$REPO/scripts/bing-output/audit-progress.json"
AUDIT_JSON="$REPO/scripts/bing-output/audit.json"
TS=$(date "+%Y-%m-%d %H:%M:%S %Z")

# launchd inherits a minimal PATH. Add common bin dirs.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# This audit is one live call per URL, same as the GSC one, so it is long enough
# for idle sleep to kill it (a manual 2026-09-24 run died at 100 URLs). When
# gsc-weekly.sh called us it already holds a caffeinate assertion and exported
# GSC_CAFFEINATED, so this only re-execs for a standalone run.
if [ -z "${GSC_CAFFEINATED:-}" ] && command -v caffeinate >/dev/null 2>&1; then
  export GSC_CAFFEINATED=1
  exec caffeinate -i "$0" "$@"
fi

cd "$REPO" || { echo "[$TS] FAILED to cd $REPO" >> "$LOG"; exit 1; }
mkdir -p "$(dirname "$LOG")"

{
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$TS] Weekly Bing run"
  echo "════════════════════════════════════════════════════════════"
} >> "$LOG"

# A leftover checkpoint means the run before this one was killed mid-audit.
# gsc-resume.ts only reuses one under 24h old, so a weekly gap starts over.
if [ -f "$PROGRESS" ]; then
  LEFTOVER=$(node -e '
    try {
      const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
      console.log(`${(j.entries || []).length} URLs, started ${j.startedAt}`);
    } catch { console.log("unreadable"); }
  ' "$PROGRESS" 2>/dev/null || echo "unreadable")
  echo "[$TS] previous run never finished — checkpoint holds $LEFTOVER" >> "$LOG"
fi

# 1. Audit — up to 3 attempts. bing-audit.ts checkpoints after every URL, so a
# second attempt resumes instead of re-inspecting what the first already did.
RUN_STARTED=$(date +%s)
AUDIT_OK=false
ATTEMPTS=0
for attempt in 1 2 3; do
  ATTEMPTS=$attempt
  if [ "$attempt" -gt 1 ]; then
    echo "[$TS] audit attempt $attempt, resuming from the checkpoint" >> "$LOG"
    sleep 60
  fi
  if npm run bing:audit >> "$LOG" 2>&1; then
    AUDIT_OK=true
    break
  fi
done

# A zero exit is not proof of a fresh file: if audit.json was not rewritten by
# this run, its numbers are last week's and reporting them hides the breakage.
if $AUDIT_OK; then
  AUDIT_MTIME=$(stat -f %m "$AUDIT_JSON" 2>/dev/null || echo 0)
  if [ "$AUDIT_MTIME" -lt "$RUN_STARTED" ]; then
    AUDIT_OK=false
    echo "[$TS] audit exited 0 but audit.json was not rewritten — treating as failed" >> "$LOG"
  fi
fi

# Counts come from the new audit.json only when the audit succeeded; on failure
# the file is last week's, and reporting it would hide the breakage.
if $AUDIT_OK; then
  COUNTS=$(node -e '
    const j = JSON.parse(require("fs").readFileSync("scripts/bing-output/audit.json","utf8"));
    const c = j.counts;
    const idx = j.site.inIndex ?? "n/a";
    console.log(`${c["Crawled"] || 0}/${j.totalUrls} crawled; ${idx} in index; ${c["Unknown to Bing"] || 0} unknown; ${c["Discovered, not crawled"] || 0} discovered`);
  ' 2>/dev/null) || COUNTS="audit ran but audit.json is unreadable"
else
  COUNTS="audit FAILED after $ATTEMPTS of 3 attempts, no fresh data"
fi

# 2. Submit (only if audit succeeded)
SUBMIT_SUMMARY=""
if $AUDIT_OK; then
  # The summary comes from THIS run's output, never the shared log: a crash
  # before submit's own "Done." line must not borrow last week's.
  SUBMIT_OUT=$(npm run bing:submit 2>&1)
  echo "$SUBMIT_OUT" >> "$LOG"
  SUBMIT_SUMMARY=$(echo "$SUBMIT_OUT" | grep -E "^Done\. [0-9]+ ok" | tail -1)
  SUBMIT_SUMMARY=${SUBMIT_SUMMARY:-submit FAILED, see weekly.log}
fi

# 3. Notification
if $AUDIT_OK; then
  TITLE="Bing weekly: $COUNTS"
  BODY="${SUBMIT_SUMMARY:-Run complete}. See scripts/bing-output/audit-report.md"
  [ "$ATTEMPTS" -gt 1 ] && BODY="$BODY (took $ATTEMPTS attempts)"
else
  TITLE="Bing weekly FAILED"
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
