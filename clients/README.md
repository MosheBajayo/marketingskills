# Client Workspaces

Each client gets an isolated workspace. Never mix client data across directories, and never commit raw exports containing PII or credentials.

## Creating a New Client Workspace

```bash
CLIENT=acme
mkdir -p clients/$CLIENT/{raw,parsed,audits,tests,reports}
cp templates/diagnostic_audit_template.md clients/$CLIENT/audits/
touch clients/$CLIENT/hypothesis_log.md clients/$CLIENT/CONTEXT.md
```

## Standard Workspace Structure

```
clients/{client}/
├── CONTEXT.md            # Brand, offer, stack, constraints, key contacts
├── hypothesis_log.md     # Living ICE-scored backlog (see sops/agency_workflow_cycle.md, Phase 2)
├── raw/                  # Raw exports (GA4, Mixpanel, Triple Whale) — gitignored, PII-safe handling
├── parsed/               # Agent-readable summaries from automations/data_parser.js
├── audits/               # Completed diagnostic audits
├── tests/                # Test briefs, QA checklists, readouts
└── reports/              # Client-facing sprint reports & dashboard snapshots
```

## CONTEXT.md Minimum Contents

- Product line, price points, AOV/LTV baselines, margins
- Tech stack: platform, theme, testing tool, analytics, ESP
- Brand voice constraints and legal/compliance notes
- Traffic profile: monthly sessions, channel mix, mobile share
- What has already been tested (avoid re-running settled questions)

## Data Handling Rules

- Raw exports stay in `raw/` and out of version control — add `clients/*/raw/` to `.gitignore`.
- Strip customer PII (emails, names, addresses) before parsing; agents only need aggregates.
- Access credentials live in the password manager, never in these files.
