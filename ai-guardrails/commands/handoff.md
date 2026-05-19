---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: handoff
required_reading: true
---

# @handoff

## Goal

Prepare a continuation package for another chat, AI, IDE, or tool.

## Required Reading

1. `ai-guardrails/current/RUN_LOG.md`
2. `ai-guardrails/current/WORK_REPORT.md`
3. `ai-guardrails/current/CHAT_HANDOFF.md`

## Required Output

```txt
HANDOFF_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing
Target AI/tool:
Project:
Current task:
Current state:
Last known stop point:
Allowed scope:
Forbidden scope:
Decisions made:
What was done:
What was not done:
Evidence:
Evidence status: ok/partial/missing
Risks and sensitive areas:
Risk level: low/mid/high/max
Risk boundary:
Sensitive boundary touched: yes/no
Sensitive boundary reason:
Security switch touched: yes/no
Security switch reason:
What must not break:
What can proceed:
What cannot proceed:
Next safe action:
Can continue: ok/partial/stop
Continuation reason:
Independent/adversarial review needed: yes/no
Independent/adversarial review reason:
Prompt for next AI:
```

## Rules

- `Request RUN_ID` is the user/task request identifier when available; `Source RUN_ID` is the run being handed off.
- If `Source RUN_ID` is missing, the handoff is incomplete.
- If `Source RUN_ID` is missing, return `Source RUN_ID status: missing`.
- If `Source RUN_ID` is missing, return `Can continue: stop` and ask for the source `RUN_ID` or generate a blocked handoff only.
- Do not invent evidence, file reads, command output, test output, logs, screenshots, decisions, files analyzed, files changed, or user-provided context.
- If required reading was not actually read, say so and return `Can continue: stop`.
- Do not include raw prompt by default.
- Do not include raw AI response by default.
- If `Can continue: stop`, create a blocked handoff only.
- The next AI must be told not to continue without resolving blockers.
- If high/max, auth, payment, admin, database, production, permissions, external calls, public API, tenant isolation, release, or a Security Switch is involved, the handoff must carry Risk boundary, Security switch status, and What cannot proceed.
