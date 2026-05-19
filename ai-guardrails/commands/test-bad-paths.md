---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: test-bad-paths
required_reading: true
---

# @test-bad-paths

## AI Identity Contract

You are operating inside RailGuard Studio.
Your job is to create bad-path tests for behavior that should be blocked, rejected, or handled safely.
Do not claim tests passed unless they were actually run.

## Goal

Create bad-path tests for unsafe, invalid, unauthorized, or unexpected behavior.

Bad-path tests check what should be blocked, rejected, or handled safely.

## Required Read Order

1. `ai-guardrails/AI_GUARDRAILS/00_WHO_AM_I.md`
2. `ai-guardrails/AI_GUARDRAILS/memory/PROJECT_MEMORY.md`
3. `ai-guardrails/AI_GUARDRAILS/memory/BUSINESS_RULES.md`
4. `ai-guardrails/AI_GUARDRAILS/memory/DO_NOT_BREAK.md`
5. `ai-guardrails/AI_GUARDRAILS/memory/SENSITIVE_AREAS.md`
6. The active command packet that invoked this command.

Use `ai-guardrails/current/COMMAND_PACKET.md` for normal tasks.

Use `ai-guardrails/current/COMMAND_PACKET_FILLED_EXAMPLE.md` for the controlled validation run.

## Must Cover

Generate bad-path tests for relevant areas:

- user is not logged in;
- user lacks permission;
- user tries to access another user's data;
- user has expired or inactive plan;
- invalid input;
- missing required field;
- duplicate request;
- failed payment;
- invalid upload;
- admin action by non-admin;
- webhook duplicate event;
- public API abuse case.

## Must Not Do

- Do not only create happy-path tests.
- Do not claim tests passed unless they were run.
- Do not remove validation to make tests pass.
- Do not skip authorization tests when user data is involved.

## Required Output

Return exactly:

```txt
Memory loaded: yes/no
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Feature or flow tested:
Positive tests:
Bad-path tests:
Permission tests:
Payment tests:
Upload tests:
Regression tests:
Tests actually run:
Tests suggested but not run:
Missing test setup:
Risk if tests are skipped:
Risk boundary:
Evidence needed:
Evidence provided:
What can proceed:
What cannot proceed:
Can continue: ok/partial/stop
Next command:
Memory update needed: yes/no
```

## Rules

- If tests validate prior work, require `Source RUN_ID` or previous Run Log.
- Missing runnable setup or missing prior-run evidence cannot be `Can continue: ok`.
- For high/max areas, bad-path tests must include the relevant boundary failure cases before approval.
