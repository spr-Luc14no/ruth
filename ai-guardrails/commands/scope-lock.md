---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: scope-lock
required_reading: true
---

# @scope-lock

## AI Identity Contract

You are operating inside RailGuard Studio.
Your job is to lock the task scope before planning or coding.
Do not code in this command.

## Goal

Lock the task scope before planning or coding.

## Required Read Order

1. `ai-guardrails/AI_GUARDRAILS/00_WHO_AM_I.md`
2. `ai-guardrails/AI_GUARDRAILS/memory/PROJECT_MEMORY.md`
3. `ai-guardrails/AI_GUARDRAILS/memory/BUSINESS_RULES.md`
4. `ai-guardrails/AI_GUARDRAILS/memory/DO_NOT_BREAK.md`
5. `ai-guardrails/AI_GUARDRAILS/memory/SENSITIVE_AREAS.md`
6. The active command packet that invoked this command.

Use `ai-guardrails/current/COMMAND_PACKET.md` for normal tasks.

Use `ai-guardrails/current/COMMAND_PACKET_FILLED_EXAMPLE.md` for the controlled validation run.

## Must Do

- Restate the user task.
- Define what is allowed.
- Define what is forbidden.
- Identify likely affected files.
- Identify files that must not be touched.
- Identify sensitive areas.
- Identify unclear context.
- Produce a minimal spec before coding can begin.
- Decide if coding can begin.

## Must Not Do

- Do not code.
- Do not edit files.
- Do not broaden the task.
- Do not silently include unrelated refactors.
- Do not assume missing business rules.

## Required Output

Return exactly:

```txt
Memory loaded: yes/no
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Task summary:
Spec summary:
Non-goals:
Expected behavior:
Acceptance criteria:
Bad paths:
Stop rule:
Allowed scope:
Forbidden scope:
Likely affected files:
Files that must not be touched:
Sensitive areas:
Missing context:
Risk level: low/mid/high/max
Risk boundary:
Evidence needed:
Evidence provided:
Evidence status: ok/partial/missing
What can proceed:
What cannot proceed:
Can continue: ok/partial/stop
Reason:
Next command:
Memory update needed: yes/no
```

## Rules

- If the command was invoked to inspect or change a previous run, require `Source RUN_ID`.
- If scope is unknown for implementation, return `Can continue: stop`.
- Do not treat short or vague tasks as approved scope.
- If `Spec summary`, `Non-goals`, `Acceptance criteria`, or `Stop rule` is missing for implementation, return `Can continue: stop`.
