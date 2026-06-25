# Running the Personal Assistant Locally (always-on)

The skill works anywhere, but for a real daily assistant that pings you every morning
you want it running in **Claude Code on your own machine**, where the session stays
alive and scheduled tasks persist. Web sessions are ephemeral and expire after 7 days.

## One-time setup

1. **Install Claude Code** (CLI or desktop app) if you haven't:
   https://code.claude.com/docs

2. **Get this repo on your machine:**
   ```bash
   git clone https://github.com/MosheBajayo/marketingskills.git
   cd marketingskills
   git checkout claude/personal-assistant-agent-f8smxj
   ```

3. **Connect your tools** in Claude Code (Settings → Connectors / MCP):
   Google Calendar, Gmail, and optionally Notion/Slack/Drive. These are the same
   connectors used here.

4. **Create your private files** (they're gitignored, so they stay on your machine):
   ```bash
   mkdir -p .agents
   cp skills/personal-assistant/references/personal-context-template.md .agents/personal-context.md
   cp skills/personal-assistant/references/assistant-memory-template.md .agents/assistant-memory.md
   ```
   Then fill in `.agents/personal-context.md`.

## Make the check-ins durable

In a local session, ask Claude:

> "Set up my personal-assistant check-ins as durable scheduled tasks."

It will create them with `durable: true`, which writes to `.claude/scheduled_tasks.json`
and **survives restarts**. Recurring cron still auto-expires after 7 days, so either:
- Keep a Claude Code session running (laptop awake), or
- Re-run "set up my check-ins" weekly (a Monday-morning routine the skill suggests anyway).

Suggested schedule (weekdays, off the :00 mark):
- Morning briefing: `57 7 * * 1-5`
- Midday nudge: `3 13 * * 1-5`
- End-of-day wrap: `2 18 * * 1-5`

## Push notifications to your phone

Connect **Remote Control** in Claude Code so `PushNotification` reaches your phone, not
just the terminal. Without it, nudges show as desktop notifications only.

## Daily use

Just open Claude Code and say "morning briefing" any time, or let the schedule fire.
Tell it things like "remind me to send the deck Friday" and it logs them automatically.
Once a week it'll prompt you to refresh your priorities and re-arm the schedule.
