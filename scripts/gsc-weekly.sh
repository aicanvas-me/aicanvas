#!/bin/bash
# Weekly GSC audit + submit. Runs from launchd every Monday at 09:00.
# - Saves the previous audit (gsc-audit.ts handles this)
# - Runs the audit
# - Submits any Unknown/Discovered URLs
# - Appends results to scripts/gsc-output/weekly.log
# - Posts a macOS notification with the summary
#
# To run manually: ~/aicanvas/scripts/gsc-weekly.sh

set -uo pipefail  # not -e — we want partial failures to still notify

REPO=$HOME/aicanvas
LOG="$REPO/scripts/gsc-output/weekly.log"
TS=$(date "+%Y-%m-%d %H:%M:%S %Z")

# launchd inherits a minimal PATH. Add common bin dirs.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cd "$REPO" || { echo "[$TS] FAILED to cd $REPO" >> "$LOG"; exit 1; }

{
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$TS] Weekly GSC run"
  echo "════════════════════════════════════════════════════════════"
} >> "$LOG"

# 1. Audit
AUDIT_OK=true
npm run gsc:audit >> "$LOG" 2>&1 || AUDIT_OK=false

# Pull summary counts from the new audit.json — ONLY if the audit succeeded.
# On failure audit.json is still the PREVIOUS run's file, so reporting its
# numbers reads as a fresh result and hides the breakage (that is exactly how
# the 2026-07-20 run logged "DONE" with week-old counts for a week).
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
  COUNTS="audit FAILED, no fresh data"
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
else
  TITLE="GSC weekly FAILED"
  BODY="See $LOG for details"
fi

osascript -e "display notification \"$BODY\" with title \"$TITLE\"" 2>>"$LOG" || true

{
  if $AUDIT_OK; then
    echo "[$TS] DONE — $COUNTS — ${SUBMIT_SUMMARY:-no submit}"
  else
    echo "[$TS] FAILED — $COUNTS"
  fi
} >> "$LOG"

# Bing runs straight after, whatever GSC's outcome: the two are independent.
# Chaining keeps it to one launchd job, and a long GSC pass can never overlap it.
"$REPO/scripts/bing-weekly.sh"
