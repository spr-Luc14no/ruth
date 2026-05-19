---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: work-report
required_reading: true
---

# @work-report

## Goal

Summarize what happened in the current run.

## Required Reading

1. `ai-guardrails/current/RUN_LOG.md`
2. `ai-guardrails/current/EVIDENCE_PACK.md`
3. `ai-guardrails/current/WORK_REPORT.md`

## Required Output

```txt
Request RUN_ID:
RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Status: completed/partial/blocked
Task summary:
What was done:
What was not done:
Files changed:
Files analyzed:
Tests actually run:
Tests not run:
Evidence:
Risks or pending decisions:
Governance Closure:
- Risk level: low/mid/high/max
- Risk boundary:
- Sensitive boundary touched: yes/no
- Sensitive boundary reason:
- Security switch touched: yes/no
- Security switch reason:
- What can proceed:
- What cannot proceed:
- Can continue: ok/partial/stop
- Continuation reason:
- Independent/adversarial review needed: yes/no
- Independent/adversarial review reason:
Memory update needed:
Handoff ready:
Next action:
```

## Rules

- `Request RUN_ID` is the user/task request identifier when available; `RUN_ID` is the current run being reported.
- If the report summarizes current work, `Source RUN_ID status` can be `not-needed`.
- If the report summarizes prior work, `Source RUN_ID` is required.
- If the required current/source `RUN_ID` is missing, return `Can continue: stop`.
- If the required current/source `RUN_ID` is missing, ask for the current/source `RUN_ID` or tell the user to start a new task with `@safe [tarefa]`.
- Do not invent evidence, file reads, command output, test output, logs, screenshots, files analyzed, files changed, or user-provided context.
- If required reading was not actually read, say so and return `Status: blocked` and `Can continue: stop`.
- Do not mark completed if evidence is missing.
- Do not claim tests passed unless they were run.
- Do not claim files changed unless files were actually edited.
- If high/max, auth, payment, admin, database, production, permissions, external calls, public API, tenant isolation, release, or a Security Switch is involved, do not omit Governance Closure.
