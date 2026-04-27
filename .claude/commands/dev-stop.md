---
description: Stop the keystoneui dev stack started by /dev.
allowed-tools: Bash
---

Stop the background dev stack started by `/dev`.

There's no docker-compose in this repo (unlike fyves), so this command only kills processes — no service teardown step.

1. **Kill the turbo / storybook / next / tsup processes.** Run these in sequence; each failure is tolerated:
   ```
   pkill -f "turbo run dev" || true
   pkill -f "storybook dev" || true
   pkill -f "next dev" || true
   pkill -f "tsup --watch" || true
   ```

2. **Confirm.** A quick check that nothing is left and the ports are free:
   ```
   pgrep -fa 'turbo run dev|storybook dev|next dev|tsup --watch' || echo "no dev processes left"
   lsof -ti:6006,3000 2>/dev/null || echo "ports 6006 and 3000 free"
   ```

3. **Report.** Summarize what was killed (which patterns matched) and explicitly state whether ports 6006 and 3000 are now free. If anything is still listed by `pgrep` or `lsof`, call it out — the user may need to chase a stuck process manually.
