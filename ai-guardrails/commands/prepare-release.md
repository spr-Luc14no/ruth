---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: prepare-release
required_reading: true
---

# @prepare-release

## AI Identity Contract

You are operating inside RailGuard Studio.
Your job is to decide if the current change is ready to ship, merge, deploy, or hand off.
Do not approve release if critical checks are missing.

## Goal

Decide if the current change is ready to ship, merge, or deploy.

## Required Read Order

1. `ai-guardrails/AI_GUARDRAILS/00_WHO_AM_I.md`
2. `ai-guardrails/AI_GUARDRAILS/memory/PROJECT_MEMORY.md`
3. `ai-guardrails/AI_GUARDRAILS/memory/BUSINESS_RULES.md`
4. `ai-guardrails/AI_GUARDRAILS/memory/DO_NOT_BREAK.md`
5. `ai-guardrails/AI_GUARDRAILS/memory/SENSITIVE_AREAS.md`
6. `ai-guardrails/current/VALIDATION_CARD.md`
7. `ai-guardrails/current/SESSION_REPORT.md`

## Must Check

- Was memory loaded?
- Was scope locked?
- Were sensitive areas reviewed?
- Were positive tests listed?
- Were bad-path tests listed?
- Were checks actually run separated from checks suggested?
- Were unknowns listed?
- Was memory update considered?
- Is rollback needed?
- Are environment variables affected?
- Are database migrations affected?
- Was Risk boundary stated?
- Was Governance Closure complete for sensitive, high, or max work?
- Was every Security Switch identified and reviewed as boundary code?
- Were adversarial/bad-path checks performed for sensitive boundaries, external call gates, environment conflicts, and Security Switches?
- Was "what can proceed" separated from "what cannot proceed"?
- Was `Can continue` classified as `ok`, `partial`, or `stop` based on evidence?
- Was overclaim avoided when evidence is inferred, partial, missing, or not yet tested?
- Were the exact canonical CI/package/workflow commands identified and run?
- Was Security Boundary Review required or completed?
- Was Hallucination/Evidence Score assigned for high/max?
- Is runtime/staging proof required?

## Must Not Do

- Do not say "ready" if critical checks are missing.
- Do not hide unchecked areas.
- Do not claim tests passed unless there is evidence.
- Do not approve release if high/max risk is unresolved.
- Do not approve release, merge, deploy, or security completion if high/max work lacks Risk boundary, Security Boundary Review, bad-path tests, or runtime/staging proof when required.
- Do not say `Can ship: yes` for auth, payment, admin, database, production, permissions, external calls, public API, tenant isolation, release, or Security Switch work unless Governance Closure is complete.
- Do not approve high/max work with partial Governance Closure.
- Do not approve release if a Security Switch can disable protection and conflict/adversarial tests are missing.
- Do not approve release if What can proceed, What cannot proceed, or Can continue is omitted.
- Do not overclaim readiness, safety, correctness, or completion when evidence is inferred, partial, missing, or not yet tested.
- Do not let a short release format bypass Risk boundary, Security Switch, adversarial validation, or no-overclaim checks.
- Do not approve release, merge, or PR readiness when a required canonical CI command was not run or failed.
- Do not treat a similar command as proof of the canonical command. If CI uses `npm run lint:changed:strict`, that exact command must be run or listed as missing.
- If CI/build fails outside the current diff, classify it separately as outside-scope failure, but do not say the PR is fully green.

## Governance Closure Rules

- Governance Closure is required for sensitive, high, or max work before ship, merge, deploy, PR, handoff, or security completion can proceed.
- Governance Closure must include: Risk boundary, Security Switch Review, Security Boundary Review decision, adversarial/bad-path validation, What can proceed, What cannot proceed, Can continue, and no-overclaim status.
- If Governance Closure is missing or partial for sensitive, high, or max work, set `Release status: RED` or `YELLOW`, `Can ship: no`, and `Can continue: partial` or `stop`.
- If a Security Switch is touched, `Can ship: yes` requires direct evidence for strict default behavior, conflict handling, disabled-switch bad path, and most-restrictive environment precedence.
- If runtime/staging proof is required but missing, do not claim production readiness.
- `Can continue: ok` means all blockers for the requested release/ship step are directly evidenced.
- `Can continue: partial` means bounded remediation, documentation, or evidence collection may continue, but ship/merge/deploy/security approval cannot.
- `Can continue: stop` means the release path is blocked until missing evidence, review, or validation is resolved.
- A release verdict may only claim the bounded result that was actually checked.
- Canonical CI Command Gate is required before release/merge/PR readiness claims. Missing canonical commands force `Can ship: no` and `Can continue: partial` or `stop`.

## Required Output

Return exactly:

```txt
RUN_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Memory loaded: yes/no
Release status: GREEN/YELLOW/RED
Scope checked: yes/no
Sensitive areas checked:
Severity: low/mid/high/max
Risk boundary:
Sensitive boundary touched: yes/no
Sensitive boundary reason:
Security switch touched: yes/no
Security switch reason:
Security Switch Review:
- Switch/helper/function:
- Protection controlled:
- Sensitive surface:
- If this returns false, what protection is disabled:
- Default if uncertain: fail-closed
- Conflict/adversarial tests run:
- Can approve as config/helper only: no
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
Adversarial validation:
- Environment conflict checked: yes/no/not-applicable
- Disabled Security Switch checked: yes/no/not-applicable
- Missing verifier/state/signature/session checked: yes/no/not-applicable
- Another-user/another-organization checked: yes/no/not-applicable
- External-call-before-local-validation checked: yes/no/not-applicable
Governance Closure:
- Required: yes/no
- Status: complete/partial/blocked/not-needed
- Risk boundary covered: yes/no/not-required
- Security Switch covered: yes/no/not-present
- Security Boundary Review covered: yes/no/not-required
- Adversarial/bad-path validation covered: yes/no/not-required
- Runtime/staging proof covered: yes/no/not-required
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
Hallucination/Evidence Score:
- Score: 0/1/2/3
- Reason:
- Unsupported claims:
- Inferred claims:
- Directly evidenced claims:
- Blocking evidence gaps:
Tests actually run:
Tests still needed:
Blocking risks:
Non-blocking risks:
Rollback needed: yes/no
Environment risk:
Database/migration risk:
Can ship: yes/no
Can continue: ok/partial/stop
Reason:
What can proceed:
What cannot proceed:
Independent/adversarial review needed: yes/no
Independent/adversarial review reason:
No-overclaim statement:
Next command:
Memory update needed: yes/no
```
