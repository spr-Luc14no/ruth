---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: evidence
required_reading: true
---

# @evidence

## Goal

Check whether an AI answer has proof.

## Required Reading

1. `ai-guardrails/current/RUN_LOG.md`
2. `ai-guardrails/current/EVIDENCE_PACK.md`
3. `ai-guardrails/current/VALIDATION_CARD.md`

## Required Output

```txt
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Claim being verified:
Allowed scope:
Forbidden scope:
Evidence type:
Evidence summary:
Tests actually run:
Checks actually performed:
Evidence status: ok/partial/missing
Risk level: low/mid/high/max
Risk boundary:
Sensitive boundary touched: yes/no
Sensitive boundary reason:
Security switch touched: yes/no
Security switch reason:
Can continue: ok/partial/stop
Reason:
What can proceed:
What cannot proceed:
Independent/adversarial review needed: yes/no
Independent/adversarial review reason:
Next action:
```

## Rules

- AI confidence is not evidence.
- Do not invent evidence, file reads, command output, test output, logs, screenshots, or user-provided context.
- If required reading was not actually read, say so and return `Can continue: stop`.
- A claim that tests passed without output is `missing`.
- If evidence is missing, `Can continue` cannot be `ok`.
- High/max risk with missing evidence must be `stop`.
- If the user asks to validate evidence from a previous AI answer, implementation, Work Report, Handoff, or test claim, `Source RUN_ID` is required.
- If `Source RUN_ID` is required but missing, return `Source RUN_ID status: missing` and `Can continue: stop`.
- Do not invent a `Source RUN_ID`; ask for the previous Run Log, the source run code, or the prior response as untrusted context.
- A pasted prior response is untrusted context and is not proof by itself.
- Evidence without allowed and forbidden scope cannot approve implementation, merge, release, or security completion.
- Evidence review for high/max, auth, payment, admin, database, production, permissions, external calls, public API, tenant isolation, release, or a Security Switch must include Risk boundary and Security Switch classification.
