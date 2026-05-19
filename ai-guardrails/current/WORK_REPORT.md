---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: work_report
required_reading: true
---

# RailGuard Studio Work Report

## Purpose

Summarize what happened in a run so the user knows what was done, not done, tested, and still risky.

## Work Report Template

```txt
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Status: completed/partial/blocked
Task summary:

What was done:
-

What was not done:
-

Files changed:
-

Files analyzed:
-

Tests actually run:
-

Tests not run:
-

Evidence:
-

Risks or pending decisions:
-

Memory update needed: yes/no
Handoff ready: yes/no/partial
Next action:
```

## Rules

- Do not mark `completed` if evidence is missing.
- Do not claim files changed if no files were edited.
- Separate suggested tests from tests actually run.
- If the AI cannot access files, say so.
- If this report is generated in a browser chat, tell the user it is a copyable report, not a saved file.
- If the report summarizes prior work and `Source RUN_ID` is missing, return `Can continue: stop` and ask for the source run.
