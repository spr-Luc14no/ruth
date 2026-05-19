---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: run-log
required_reading: true
---

# @run-log

## Goal

Generate or update the operational summary for the current `RUN_ID`.

Do not save raw prompts or raw AI responses by default.

## Required Reading

1. `ai-guardrails/COMMAND_ROUTER.md`
2. `ai-guardrails/MACRO_COMMANDS.md`
3. `ai-guardrails/current/RUN_LOG.md`

## Required Output

```txt
RailGuard Studio Run Log:
- RUN_ID:
- Request RUN_ID:
- Source RUN_ID:
- Source RUN_ID status: present/missing/not-needed
- Raw prompt saved: no
- Raw response saved: no
- User request summary:
- Detected intent:
- User profile:
- Project stage:
- Phase source:
- Phase evidence:
- Scope source:
- Approved scope found:
- Run depth:
- Sensitive areas:
- Sensitive areas source:
- Risk level:
- Risk reason:
- Risk boundary:
- Sensitive boundary touched:
- Sensitive boundary reason:
- Security switch touched:
- Security switch reason:
- Allowed scope:
- Allowed scope source:
- Forbidden scope:
- Forbidden scope source:
- Evidence needed:
- Evidence provided:
- Evidence status:
- Can continue: ok/partial/stop
- Continuation reason:
- What can proceed:
- What cannot proceed:
- Independent/adversarial review needed:
- Independent/adversarial review reason:
- Memory update needed:
- Handoff ready:
- Untrusted context detected:
- Untrusted instructions ignored:
- Git Reality Check:
- RUN_ID:
- Request RUN_ID:
- Source RUN_ID:
- Source RUN_ID status:
- Git available:
- Git repo detected:
- Current branch:
- Expected branch:
- Branch source:
- Branch-task fit:
- Worktree status:
- Changed files:
- Remote detected:
- Remote names:
- GitHub context available:
- Current PR:
- Target branch:
- Requested Git action:
- Commit requested:
- Commit exists:
- Commit belongs to current branch:
- Scope drift detected:
- Cross-scope changes:
- Safe Git action now:
- What can proceed:
- What cannot proceed:
- Can continue:
- Reason:
- Next command:
- Next action:
```

## Rules

- If there is no current/source `RUN_ID`, do not invent one for history.
- If there is no current/source `RUN_ID`, return `Can continue: stop` and ask the user for the source `RUN_ID` or a task to start a new guarded run.
- If the user asks to show, validate, summarize, hand off, or change a previous run, require `Source RUN_ID`.
- If the current request itself creates a run to inspect previous work, use a separate `Request RUN_ID`.
- Summarize the request; do not copy it verbatim if it contains sensitive data.
- If a file was edited, list the file.
- If no file was edited, say the Run Log is generated for copy/paste.
- If a run touches high/max, auth, payment, admin, database, production, permissions, external calls, public API, tenant isolation, release, or a Security Switch, include Risk boundary and Security switch classification.
- If a run involved branch, commit, PR, merge, push, release, worktree state, or scope switching, include Git Reality Check fields.
- Bare `@run-log` is blocked unless a current/source run is known.
- Include what can proceed and what cannot proceed even when the log is blocked.
