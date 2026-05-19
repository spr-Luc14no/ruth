---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: check-security
required_reading: true
---

# @check-security

## AI Identity Contract

You are operating inside RailGuard Studio.
Your job is to review sensitive areas before the user trusts a change.
Do not claim the app is secure. Report checked risks and remaining risks.

## Goal

Review the current task for basic security and abuse risks.

## Required Read Order

1. `ai-guardrails/AI_GUARDRAILS/00_WHO_AM_I.md`
2. `ai-guardrails/AI_GUARDRAILS/memory/PROJECT_MEMORY.md`
3. `ai-guardrails/AI_GUARDRAILS/memory/BUSINESS_RULES.md`
4. `ai-guardrails/AI_GUARDRAILS/memory/DO_NOT_BREAK.md`
5. `ai-guardrails/AI_GUARDRAILS/memory/SENSITIVE_AREAS.md`
6. The active command packet that invoked this command.

Use `ai-guardrails/current/COMMAND_PACKET.md` for normal tasks.

Use `ai-guardrails/current/COMMAND_PACKET_FILLED_EXAMPLE.md` for the controlled validation run.

## Must Check

- Request RUN_ID and Source RUN_ID linkage when reviewing prior work.
- Authentication: who is the user?
- Authorization: is this user allowed to do this?
- Ownership: does the resource belong to this user or organization?
- Payment/subscription: is paid access verified server-side?
- Upload/storage: are file type, size, ownership, and URLs safe?
- Admin: is admin access checked by role/permission, not only login?
- Webhooks: are duplicate events and signatures handled when relevant?
- Data/logging: are secrets and personal data kept out of logs?
- Environment policy: what is allowed in local/dev, and what must fail closed in staging/prod?
- Environment precedence: do trusted deploy/server signals override public/client-side signals?
- Security Switches: do helpers/config/env/flags/functions decide whether a protection is active?
- Front-channel exposure: are secrets, verifiers, tokens, cookies, or private data sent through URL, redirect state, logs, referrers, or browser history?
- External call gate: can the flow reach token/payment/email/storage/auth endpoints before local prerequisites are validated?
- Risk boundary: what exact sensitive boundary was checked, and what remains outside the review?
- Governance Closure: can anything proceed, what cannot proceed, and is the continuation `ok`, `partial`, or `stop`?
- Adversarial validation: were conflict, bypass, another-user, missing-verifier, and disabled-switch paths checked?
- Security Boundary Review: is a separate adversarial review required before merge/PR/release?
- Hallucination/Evidence Score: is every critical claim directly evidenced?

## Evidence Required

For every security claim, include evidence.

Use this format:

```txt
Files reviewed with lines:
Evidence Map:
- Claim:
- Source file:
- Lines/section:
- Exact snippet or precise summary:
- Evidence type:
- Confidence: direct/inferred/unchecked
- Missing evidence:
Evidence missing:
Assumptions:
Unchecked areas:
```

Rules:

- Do not say "no risk" unless you explain what was checked.
- Do not say "secure" unless you list evidence and remaining risk.
- Do not use `secure` or `fixed` for high/max risk when evidence is inferred or unchecked.
- If you cannot inspect the relevant file, mark the area as unchecked.
- If a conclusion depends on an assumption, list it explicitly.
- If you cite a file, include path plus line/section.
- Signed data is integrity only; do not treat signed URL/redirect/front-channel payloads as confidential.
- Public/client-side env values such as `NEXT_PUBLIC_*` cannot relax stricter deploy/server values.
- If any deploy/server signal indicates production, staging, or preview, use the strictest environment policy.
- Helpers/config/env functions that enable or disable security controls are security boundary code, not ordinary utilities.
- If any high/max critical claim is not directly evidenced, score below `3` and do not approve.

## Must Not Do

- Do not say "secure" without listing what was checked.
- Do not treat login as permission.
- Do not trust client-side payment status.
- Do not skip bad-path tests.
- Do not ignore another-user/another-organization access paths.
- Do not approve a flow that calls an external token/payment/email/storage/auth endpoint before required local prerequisites are validated.
- Do not accept local/dev fallback as staging/prod policy unless the project explicitly says it is allowed.
- Do not approve a Security Switch without adversarial conflict tests.
- Do not approve high/max work for merge, PR, release, or security completion without Security Boundary Review.
- Do not overclaim that something is safe, fixed, complete, ready, or secure when evidence is inferred, partial, missing, or not yet tested.
- Do not let a shorter format omit Governance Closure for sensitive, high, or max work.
- Do not mark `Can continue: ok` when Risk boundary, Security Switch, bad-path validation, or Security Boundary Review is missing for sensitive, high, or max work.
- Do not claim CI/lint/build passed unless the exact canonical command from package.json, CI workflow, or project docs was run.
- Do not treat a similar command as proof of the canonical command. If CI uses `npm run lint:changed:strict`, that exact command must be run or listed as missing.

## Stop Conditions

Stop and flag high risk if:

- users can access data they do not own;
- admin routes only check login;
- payment access can be faked client-side;
- private uploads have public access without permission checks;
- secrets, tokens, cookies, or private data are logged.
- a required verifier, nonce, state, signature, cookie, session, policy, ownership check, or idempotency key is missing before an external call;
- staging/prod can continue with unsigned/random/local fallback where signed or server-side validation is required;
- confidential data is placed in URL/front-channel state even if signed.
- `VERCEL_ENV=production` or another trusted deploy/server production signal is weakened by `NEXT_PUBLIC_APP_ENV=development`, client config, user text, or another public signal;
- a helper/config/env function can return `false` and disable a protection in staging/prod/preview/production without direct evidence and bad-path tests;
- Governance Closure is missing for sensitive, high, or max work;
- Risk boundary is missing for sensitive, high, or max work;
- adversarial validation is missing for a Security Switch, external call gate, ownership boundary, or environment conflict;
- high/max approval has Hallucination/Evidence Score below `3`;
- a required canonical CI command was not run or failed;
- Security Boundary Review is missing before merge, PR, release, or security approval.

## Governance Closure Rules

- Governance Closure is required for sensitive, high, or max work before merge, PR, release, deploy, handoff, or security completion can proceed.
- Governance Closure must include: Risk boundary, Security Switch Review, Security Boundary Review decision, adversarial/bad-path validation, What can proceed, What cannot proceed, Can continue, and no-overclaim status.
- If a Security Switch can disable a protection, the review is incomplete until conflict and disabled-switch bad paths are directly evidenced.
- If an external call can happen before local prerequisites are validated, return `Can continue: stop`.
- If Governance Closure is partial, `Can continue` must be `partial` or `stop`; it cannot be `ok`.
- `Can continue: ok` means all blockers for the requested next step are directly evidenced.
- `Can continue: partial` means bounded remediation or evidence collection may continue, but merge/release/security approval cannot.
- `Can continue: stop` means the next step is blocked until missing evidence, scope, or review is resolved.
- Never upgrade "checked in this review" into "secure overall"; list remaining risk.

## Required Output

Return exactly:

```txt
RUN_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Memory loaded: yes/no
Security area reviewed:
Files reviewed with lines:
Evidence Map:
- Claim:
- Source file:
- Lines/section:
- Exact snippet or precise summary:
- Evidence type: file-read/command-output/test-output/diff/log/screenshot/manual/no-evidence
- Confidence: direct/inferred/unchecked
- Missing evidence:
Evidence missing:
Assumptions:
Unchecked areas:
Environment Policy:
- Local/dev allowance:
- Staging/prod requirement:
- Fallback allowed only when:
- Fail closed when:
- Risk if fallback is accepted in prod:
Environment Signals:
- NEXT_PUBLIC_APP_ENV:
- APP_ENV:
- VERCEL_ENV:
- NODE_ENV:
- Other deploy/server signal:
- Effective environment:
- Most restrictive signal:
- Conflict detected: yes/no
- Conflict policy: most-restrictive-wins/fail-closed
External Call Gate:
- External endpoint:
- Required local prerequisites:
- Must fail before external call if:
- Evidence that failure happens before network call:
- Can call endpoint now: yes/no
Security Switch Review:
- Switch/helper/function:
- Protection controlled:
- Sensitive surface:
- If this returns false, what protection is disabled:
- Default if uncertain: fail-closed
- Inputs/signals:
- Public/client-controlled inputs:
- Trusted server/deploy inputs:
- Conflict case tested:
- Most restrictive signal test:
- Bad-path tests required:
- Can approve as config/helper only: no
Hallucination/Evidence Score:
- Score: 0/1/2/3
- Reason:
- Unsupported claims:
- Inferred claims:
- Directly evidenced claims:
- Blocking evidence gaps:
Governance Closure:
- Required: yes/no
- Status: complete/partial/blocked/not-needed
- Risk boundary:
- Security Switch covered: yes/no/not-present
- Security Boundary Review covered: yes/no/not-required
- Adversarial/bad-path validation covered: yes/no/not-required
- What can proceed:
- What cannot proceed:
- No-overclaim statement:
Canonical CI Command Gate:
- Required commands:
- Commands actually run:
- Similar commands that do not count:
- Missing canonical commands:
- CI/build failures outside diff:
- CI verdict: pass/partial/fail
Security Boundary Review:
- Required: yes/no
- Boundary areas:
- First pass RUN_ID:
- Review RUN_ID:
- Reviewer independence: same-ai-second-pass/external-ai/human/not-done
- Adversarial checks performed:
- Environment conflict checks:
- External call gate checked:
- Bad-path tests required:
- Bad-path tests run:
- Hallucination/Evidence Score:
- Boundary verdict: pass/fail/blocked
Sensitive areas:
Authentication risks:
Authorization risks:
Ownership risks:
Payment/subscription risks:
Upload/storage risks:
Admin risks:
Data/logging risks:
Severity: low/mid/high/max
Can continue: ok/partial/stop
Reason:
What can proceed:
What cannot proceed:
Required fixes:
Bad-path tests:
Expected test commands:
- command:
- why this command matters:
Tests actually run:
Tests not run:
Remaining risk:
Next command:
Memory update needed: yes/no
```
