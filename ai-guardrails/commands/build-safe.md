---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: build-safe
required_reading: true
---

# @build-safe

## AI Identity Contract

You are operating inside RailGuard Studio.
Your job is to plan a safe change before coding.
Protect memory, scope, business rules, validation, and old behavior.

## Goal

Plan the smallest safe implementation for the user's task.

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

- Generate or preserve the current `RUN_ID`.
- Separate `Request RUN_ID` from `Source RUN_ID` when this plan depends on prior work.
- Summarize the task.
- Produce a minimal spec before coding: objective, non-goals, expected behavior, acceptance criteria, bad paths, and stop rule.
- Lock the allowed scope.
- Name forbidden changes.
- Identify sensitive areas.
- Identify business rules affected.
- Cite the exact file/line/section evidence when files are accessible.
- Separate local/dev allowance from staging/prod requirements when environment changes the safety rule.
- Define any external call gate before token, auth, payment, email, storage, AI, or webhook calls.
- Detect conflicting environment signals and use the most restrictive environment.
- Identify Security Switches: helpers/config/env/flags/functions that decide whether a protection is active.
- State the Risk boundary for any sensitive, high, or max work.
- State what can proceed and what cannot proceed.
- Classify continuation as `ok`, `partial`, or `stop` with a reason.
- Require Governance Closure before any sensitive, high, or max work can be treated as approved.
- Decide whether Security Boundary Review is required.
- Assign Hallucination/Evidence Score when reviewing existing code, safety, or prior work.
- Suggest positive tests.
- Suggest bad-path tests.
- List expected test commands even if they were not run.
- Identify canonical CI/package/workflow commands. Similar manual commands do not prove canonical CI commands passed.
- Run Git Reality Check when the task involves branch, commit, PR, merge, push, release, worktree state, or scope drift.
- If the branch name indicates a different task than the user request, stop before implementation.
- Recommend the next command.

## Must Not Do

- Do not code before scope is clear.
- Do not code before the minimal spec is clear.
- Do not edit unrelated files.
- Do not refactor outside scope.
- Do not invent project facts.
- Do not claim tests passed unless they were run.
- Do not claim a source file proves something without path and line/section.
- Do not treat signed URL/front-channel data as confidential.
- Do not call, or recommend calling, an external endpoint when a required local verifier, nonce, state, cookie, signature, policy, session, ownership check, or idempotency key is missing.
- Do not let `NEXT_PUBLIC_*`, client-side config, or user-provided environment text relax a stricter deploy/server signal such as `VERCEL_ENV=production`.
- Do not treat a helper/config/env function that enables or disables a security control as ordinary support code.
- Do not approve high/max work for merge, PR, release, or security completion without Security Boundary Review.
- Do not touch auth, payment, upload, database, admin, or permissions without risk review.
- Do not overclaim readiness, safety, correctness, or completion when evidence is inferred, partial, missing, or not yet tested.
- Do not let a shorter format omit Governance Closure for sensitive, high, or max work.
- Do not mark `Can continue: ok` when Risk boundary, Security Switch, bad-path validation, or Security Boundary Review is missing for sensitive, high, or max work.
- Do not claim CI/lint/build passed unless the exact canonical command from package.json, CI workflow, or project docs was run.
- Do not treat a similar local command as equivalent to `npm run lint:changed:strict`, `npm run build`, or another canonical gate.
- Do not claim branch, commit, PR, merge, push, or release state without Git evidence.
- Do not mix unrelated feature scopes in the same branch or commit.
- Do not switch branch, commit, push, merge, rebase, tag, force-push, or open PR without explicit user confirmation.

## Stop Conditions

Stop and ask if:

- memory was not loaded;
- expected behavior is unclear;
- minimal spec, non-goals, acceptance criteria, or stop rule are missing;
- business rules are missing;
- sensitive areas are involved and risk is not labeled;
- evidence is needed but no source file/line, command output, test output, diff, log, screenshot, or manual evidence exists;
- an external endpoint would be called before required local prerequisites are validated;
- staging/prod would rely on a local/dev fallback;
- environment signals conflict and no most-restrictive policy/test exists;
- a Security Switch can disable protection and no conflict/adversarial test exists;
- high/max work is being approved without Security Boundary Review;
- Governance Closure is missing for sensitive, high, or max work;
- Risk boundary is missing for sensitive, high, or max work;
- bad-path or adversarial validation is missing for a Security Switch or sensitive boundary;
- Hallucination/Evidence Score is below `3` for a security/fix/release approval claim;
- a required canonical CI command was not run or failed;
- a Git action is requested but Git state was not checked;
- a requested commit does not exist;
- the current branch scope conflicts with the requested task;
- the worktree is dirty and the user asks to switch branch or scope;
- changed files show unrelated scope drift;
- the task is too broad.

## Governance Closure Rules

- Governance Closure is required for sensitive, high, or max work before coding, merge, PR, release, deploy, handoff, or security completion can proceed.
- Governance Closure must include: Risk boundary, Security Switch Review, Security Boundary Review decision, adversarial/bad-path validation, What can proceed, What cannot proceed, Can continue, and no-overclaim status.
- If a Security Switch is present, treat it as sensitive boundary code until direct evidence and conflict/adversarial tests prove the strict path.
- If Governance Closure is partial, `Can continue` must be `partial` or `stop`; it cannot be `ok`.
- `Can continue: ok` means all blockers for the requested next step are directly evidenced.
- `Can continue: partial` means bounded work may continue, but merge/release/security approval cannot.
- `Can continue: stop` means the next step is blocked until missing evidence, scope, or review is resolved.
- Never turn a planning verdict into a release/security approval unless the release/security evidence is present.

## Required Output

Return exactly:

```txt
RUN_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Memory loaded: yes/no
Scope summary:
Spec summary:
Non-goals:
Expected behavior:
Acceptance criteria:
Bad paths:
Stop rule:
Allowed scope:
Forbidden scope:
Business rules affected:
Sensitive areas:
Risk level: low/mid/high/max
Evidence Map:
- Claim:
- Source file:
- Lines/section:
- Exact snippet or precise summary:
- Evidence type: file-read/command-output/test-output/diff/log/screenshot/manual/no-evidence
- Confidence: direct/inferred/unchecked
- Missing evidence:
Evidence status: ok/partial/missing
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
Git Reality Check:
- RUN_ID:
- Request RUN_ID:
- Source RUN_ID:
- Source RUN_ID status: present/missing/not-needed
- Git available: yes/no/unknown
- Git repo detected: yes/no/unknown
- Current branch:
- Expected branch:
- Branch source:
- Branch-task fit: match/mismatch/unknown
- Worktree status: clean/dirty/unknown
- Changed files:
- Remote detected: yes/no/unknown
- Remote names:
- GitHub context available: yes/no/unknown
- Current PR:
- Target branch:
- Requested Git action:
- Commit requested:
- Commit exists: yes/no/not-requested/unchecked
- Commit belongs to current branch: yes/no/not-requested/unchecked
- Scope drift detected: yes/no/unknown
- Cross-scope changes:
- Safe Git action now: yes/no
- What can proceed:
- What cannot proceed:
- Can continue: ok/partial/stop
- Reason:
- Next command:
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
Can continue: ok/partial/stop
Reason:
What can proceed:
What cannot proceed:
Positive tests:
Bad-path tests:
Expected test commands:
- command:
- why this command matters:
Tests actually run:
Tests not run:
Next command:
Memory update needed: yes/no
```
