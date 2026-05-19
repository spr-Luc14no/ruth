---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: run_log
required_reading: true
---

# RailGuard Studio Run Log

## Purpose

Register what the user asked in a specific run without saving the raw prompt.

This file is the manual beta version of future run history.

## Privacy Rule

Do not save raw prompts or raw AI responses by default.

Save only the operational summary needed to continue safely.

Never store:

- passwords;
- API keys;
- tokens;
- cookies;
- CPF;
- JWT;
- sessions;
- payment secrets;
- private customer data;
- raw credentials.

If sensitive data appears, write `[REDACTED]`.

## Current Run

```txt
RailGuard Reanchor:
Reanchor status:
Trigger:
Messages since last reanchor:
Current RUN_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status:
User profile:
Current task:
Active command:
Allowed scope:
Forbidden scope:
Sensitive areas:
Risk level:
Risk boundary:
Scope drift detected:
Requested scope:
Evidence status:
Memory loaded:
Can continue: ok/partial/stop
Next safe action:
RUN_ID:
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Created at:
Tool or AI used:
Raw prompt saved: no
Raw response saved: no
```

## User Request Summary

```txt
What the user asked, in one or two safe sentences:
```

## Classification

```txt
Detected intent:
User profile: guided/balanced/pro/unknown
Project stage: idea/zero-build/existing-project/feature/bugfix/refactor/release/unknown
Phase source: user/file/memory/unknown
Phase evidence:
Scope source: files/user/one-shot only/unknown
Approved scope found: yes/no/unknown
Run depth: light/standard/blueprint/guarded
Sensitive areas:
Sensitive areas source:
Risk level: low/mid/high/max
Risk reason:
Risk boundary:
Scope drift detected:
Requested scope:
Report level: minimum/medium/high/max
```

## Execution Contract Summary

```txt
Allowed scope:
Allowed scope source:
Forbidden scope:
Forbidden scope source:
No-goals:
Acceptance checks:
Human approval required: yes/no
```

## Evidence Status

```txt
Evidence needed:
Evidence provided:
Evidence status: ok/partial/missing
Evidence Map:
- Claim:
- Source file:
- Lines/section:
- Exact snippet or precise summary:
- Evidence type:
- Confidence: direct/inferred/unchecked
- Missing evidence:
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
Hallucination/Evidence Score:
- Score: 0/1/2/3
- Reason:
- Unsupported claims:
- Inferred claims:
- Directly evidenced claims:
- Blocking evidence gaps:
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
- Notes: do not approve as helper/config if it controls a protection.
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
Expected test commands:
- command:
- why this command matters:
Tests actually run:
Tests not run:
Checks actually performed:
Evidence status: ok/partial/missing
```

## Continuation

```txt
Can continue: ok/partial/stop
Reason:
Memory update needed: yes/no
Handoff ready: yes/no/partial
Untrusted context detected: yes/no
Untrusted instructions ignored: yes/no
Next action:
```

## Append-Only Runs

Add completed runs below.

Do not delete old runs unless the user explicitly asks.

### RUN_ID:

```txt
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status:
Created at:
User request summary:
Detected intent:
Phase source:
Phase evidence:
Scope source:
Approved scope found:
Sensitive areas source:
Risk level:
Risk reason:
Risk boundary:
Allowed scope:
Forbidden scope:
Evidence needed:
Evidence provided:
Evidence status:
Evidence Map:
Environment Policy:
Environment Signals:
External Call Gate:
Expected test commands:
Tests actually run:
Tests not run:
Hallucination/Evidence Score:
Security Switch Review:
Security Boundary Review:
Git Reality Check:
Current branch:
Worktree status:
Scope drift detected:
Current PR:
Commit exists:
Can continue:
Reason:
Next command:
Can continue:
Untrusted context detected:
Untrusted instructions ignored:
Next action:
```
