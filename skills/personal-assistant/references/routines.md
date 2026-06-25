# Daily Routine Scripts

Fuller scripts for each routine the personal-assistant skill runs. Keep output tight in practice.

## Morning briefing

**Goal:** in 30 seconds of reading, the user knows what today looks like and what needs them.

1. Read `.agents/personal-context.md` and `.agents/assistant-memory.md`.
2. `list_events` for today (and tomorrow's first event for the preview).
3. Gmail `search_threads` for `is:unread newer_than:1d` plus anything from people named in personal-context.
4. Cross-check **Open commitments** for items due today or overdue.
5. Output:
   ```
   Good morning. Here's today:

   📅 Meetings
   - 10:00 Standup
   - 14:00 Dana — contract review (you owe her the redline; draft ready?)

   ⏰ Due / overdue
   - [overdue 2d] Send Q2 deck to Sam
   - [today] Confirm venue

   📨 Needs a reply
   - Dana — "contract redline?" (3 days)
   - Recruiter — interview times

   What are your top 1-3 priorities today?
   ```
6. Log priorities to memory. Push: one line headline.

## Midday nudge

1. Re-read **Today's priorities**.
2. Ask/check what's done. Look for new urgent items.
3. Offer ONE concrete move tied to a real calendar gap or deadline. Push only if time-sensitive.

## End-of-day wrap

1. Compare day vs. morning priorities.
2. "What got done? What rolls to tomorrow?"
3. Update **Done** and **Open commitments**.
4. Preview tomorrow's first meeting + any prep needed tonight.

## Commitment capture (any time)

Trigger phrases: "remind me", "don't forget", "I need to", "I told … I'd", "by <day>".
→ Append to **Open commitments** with date captured + due date. Confirm in one line.

## Weekly (optional, Monday morning)

- Ask the user to refresh **What matters right now** in personal-context.
- Prune **Done**. Surface anything in **Waiting on** that's gone stale.
- Re-create the cron jobs (they expire after 7 days).
