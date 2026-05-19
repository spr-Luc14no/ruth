---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: chat_handoff
required_reading: true
---

# RailGuard Studio Chat Handoff

## Purpose

Continue in another chat, AI, IDE, or tool without explaining the project from zero.

The handoff must be linked to a source `RUN_ID`.

## Handoff Template

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
-

What was done:
-

What was not done:
-

Evidence:
-
Evidence status: ok/partial/missing

Risks and sensitive areas:
-
Risk level: low/mid/high/max
Risk boundary:

What must not break:
-

What can proceed:

What cannot proceed:

Next safe action:

Can continue: ok/partial/stop
```

## Prompt For Next AI

```txt
@safe continue from this RailGuard Studio handoff.

Use the source RUN_ID as the continuity anchor.
Respect the Hard Rule Pack.
Do not assume tests were run without evidence.
Do not change scope without confirmation.
If Can continue is stop, do not implement until the blocker is resolved.
```

## Rules

- If `Source RUN_ID` is missing, return `Can continue: stop`.
- Do not include raw prompts by default.
- Do not include raw AI responses by default.
- Do not include secrets or private data.
- If `Can continue: stop`, generate a blocked handoff only.
- If the handoff lacks a source `RUN_ID`, mark it incomplete.
- If allowed scope, forbidden scope, Risk boundary, or Evidence status is missing for a continuation task, mark the handoff incomplete.
- Do not let another AI continue implementation from a handoff that lacks scope, risk, and evidence state.
