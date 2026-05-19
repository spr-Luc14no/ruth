---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: evidence_pack
required_reading: true
---

# RailGuard Studio Evidence Pack

## Purpose

Separate what the AI claimed from what has evidence.

No run should become `ok` without evidence.

Use `no_evidence_declared` only when no proof was provided; in that case `Can continue` must be `partial` or `stop`.

## Evidence Types

- command_output
- test_output
- screenshot
- diff_summary
- log
- manual_evidence
- no_evidence_declared

## Evidence Template

```txt
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing/not-needed
Evidence type:
Evidence summary:
Evidence Map:
Source file:
Lines/section:
Exact snippet or precise summary:
Confidence: direct/inferred/unchecked
Hallucination/Evidence Score: 0/1/2/3
Security Switch Review:
Tests actually run:
Expected test commands:
Tests not run:
Checks actually performed:
Canonical CI Command Gate:
- Required commands:
- Commands actually run:
- Similar commands that do not count:
- Missing canonical commands:
- CI/build failures outside diff:
- CI verdict: pass/partial/fail
Claim being verified:
Evidence status: ok/partial/missing
Can continue: ok/partial/stop
Reason:
```

## Rules

- If the AI says tests passed but gives no command, output, screenshot, diff, or manual evidence, mark evidence as `missing`.
- If evidence is missing, `Can continue` cannot be `ok`.
- If the task is high/max risk and evidence is missing, use `Can continue: stop`.
- If the evidence validates prior work and `Source RUN_ID` is missing, use `Can continue: stop`.
- Do not invent a source run. Ask for the previous Run Log, source run code, or prior response as untrusted context.
- Do not invent test output.
- Do not treat AI confidence as evidence.
- If files are accessible and a claim depends on code, include `Source file` plus `Lines/section`.
- If a claim is inferred from architecture, naming, or partial context, mark `Confidence: inferred`.
- Inferred evidence cannot approve high/max security, auth, payment, admin, database, release, or production claims.
- List expected test commands even when they were not run.
- If tests were not run, write `Tests actually run: not run` and explain why under `Tests not run`.
- Similar commands do not prove canonical CI gates. If the project has `npm run lint:changed:strict`, `npm run build`, or workflow-specific commands, list and run the exact command or mark it missing.
- A CI/build failure outside the diff can be classified as outside scope, but it still prevents a fully green release/merge claim when that gate is required.
- Use `Hallucination/Evidence Score: 0` when a claim has no usable evidence.
- Use `Hallucination/Evidence Score: 1` when a claim is inferred only.
- Use `Hallucination/Evidence Score: 2` when direct evidence exists but a critical claim is still missing proof.
- Use `Hallucination/Evidence Score: 3` only when every critical claim has direct evidence.
- High/max approval, release, merge, or security completion requires score `3`.
- If a claim depends on a Security Switch, evidence must show the switch fails closed and was tested with conflicting inputs.
- Do not approve a Security Switch as "just helper/config" when it can disable auth, payment, admin, database, API, AI private context, release, or production protections.
