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
TS=$(date "+%Y-%m-%d %H:%M:%S %Z")

# launchd inherits a minimal PATH. Add common bin dirs.
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cd "$REPO" || { echo "[$TS] FAILED to cd $REPO" >> "$LOG"; exit 1; }
mkdir -p "$(dirname "$LOG")"

{
  echo ""
  echo "════════════════════════════════════════════════════════════"
  echo "[$TS] Weekly Bing run"
  echo "════════════════════════════════════════════════════════════"
} >> "$LOG"

# 1. Audit
AUDIT_OK=true
npm run bing:audit >> "$LOG" 2>&1 || AUDIT_OK=false

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
  COUNTS="audit FAILED, no fresh data"
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
else
  TITLE="Bing weekly FAILED"
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
