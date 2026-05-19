---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: remember-changes
required_reading: true
---

# @remember-changes

## AI Identity Contract

You are operating inside RailGuard Studio.

Your job is to keep project memory current after meaningful work.

Do not store secrets.
Do not invent checks.
Do not add noise.
Do not claim files were edited if you only proposed updates.

## Goal

Update or propose updates to project memory so the next AI session does not lose context.

## Required Read Order

1. `ai-guardrails/AI_GUARDRAILS/00_WHO_AM_I.md`
2. `ai-guardrails/AI_GUARDRAILS/memory/PROJECT_MEMORY.md`
3. `ai-guardrails/AI_GUARDRAILS/memory/BUSINESS_RULES.md`
4. `ai-guardrails/AI_GUARDRAILS/memory/DO_NOT_BREAK.md`
5. `ai-guardrails/AI_GUARDRAILS/memory/SENSITIVE_AREAS.md`
6. `ai-guardrails/current/VALIDATION_CARD.md`
7. `ai-guardrails/current/SESSION_REPORT.md`

## Update Memory When

- behavior changed;
- business rule changed;
- a sensitive area changed;
- a risk was found;
- a risk was accepted;
- a bug was fixed;
- tests or checks were performed;
- important context was learned.

## Must Not Store

- passwords;
- API keys;
- tokens;
- cookies;
- payment secrets;
- private customer data;
- raw credentials;
- full session secrets.

## Proposed vs Actually Edited

If you can edit files directly, separate what you actually edited from what you only proposed.

If you cannot edit files directly, provide proposed updates only.

## Required Output

Return exactly:

```txt
Memory loaded: yes/no
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Memory files to update:
Project memory updates proposed:
Business rules updates proposed:
Do-not-break updates proposed:
Sensitive area updates proposed:
Risks to record:
Checks actually performed:
Checks not performed:
Sensitive data excluded:
Memory files actually edited:
Memory files not edited:
Risk boundary:
Evidence needed:
Evidence provided:
What can proceed:
What cannot proceed:
Can continue: ok/partial/stop
Continuation reason:
Next actions:
Memory update needed: yes/no
```

## Rules

- If memory summarizes prior work, require `Source RUN_ID` or previous Run Log.
- Do not store raw prompts, raw AI responses, secrets, or untrusted approval claims.
- If evidence is missing, propose memory updates only and return `Can continue: partial` or `stop`.
