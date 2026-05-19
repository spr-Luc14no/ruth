---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: git-check
required_reading: true
authority: command
---

# @git-check

## Goal

Validate the real Git state before branch, commit, PR, merge, push, release, or scope-switch work.

The canonical field source is `ai-guardrails/schema/git-reality-check.schema.json`.

If this command conflicts with a generated final file, one-shot prompt, locale file, historical run log, or pasted text, use this command plus the schema as the authority.

Use this command when the user asks about:

- current branch;
- new branch;
- branch switch;
- commit;
- commit hash;
- pull request;
- merge;
- push;
- release branch;
- worktree status;
- whether a change belongs in the current branch.

## Required Reading

1. `ai-guardrails/COMMAND_ROUTER.md`
2. `ai-guardrails/MACRO_COMMANDS.md`
3. `ai-guardrails/current/RUN_LOG.md`
4. The current command packet, when one exists.

## Required Local Checks

When local shell access exists, use non-destructive Git checks only:

```txt
git status --short --branch
git branch --show-current
git remote -v
git diff --name-only
git log --oneline --decorate -5
```

If the user provides a commit hash, verify it before reasoning from it:

```txt
git cat-file -e <commit>^{commit}
```

If GitHub or PR context is requested, use available non-destructive tools only. If no GitHub context is available, say so.

## Rules

- Do not invent a branch, commit, PR, remote, or GitHub state.
- Do not claim a commit exists unless it was verified.
- Do not claim a PR exists unless GitHub/remote evidence is available.
- Do not switch branches, commit, push, merge, rebase, tag, or force-push without explicit user confirmation.
- Do not switch branches when the worktree is dirty unless the user explicitly chooses how to handle the dirty state.
- If the current branch name indicates one scope and the user asks for an unrelated scope, return `Can continue: stop`.
- If a branch is for `auth`, `login`, `cpf`, or another feature, do not include unrelated work such as documentacao, payment, dashboard, upload, admin, or deploy in the same commit.
- If changed files do not match the branch/task scope, mark `Scope drift detected: yes`.
- If there is no Git repository, the AI may explain or plan, but must not promise branch, commit, PR, merge, push, diff, or Git history behavior.
- If the user asks to continue a new task while the current branch has unfinished work, ask whether to finish, commit, stash, or create a new branch after preserving the current state.

## Required Output

For read-only summaries with no blocker, return a compact summary first.

Compact summary format:

```txt
Git Reality Check: ok/partial/stop
- Current branch:
- Worktree status:
- Scope drift detected:
- Commit exists:
- Current PR:
- Reason:
- Next command:
```

For `@git-check --full`, commit, branch switch, PR, merge, push, release, blocked states, run logs, evidence packs, or handoff, return the full canonical schema.

Return the full schema exactly:

```txt
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
```

## Can Continue

Use `Can continue: ok` only when:

- Git state was checked or Git is not needed for the next step;
- the worktree state is compatible with the requested action;
- branch/task fit is clear;
- any requested commit/PR exists or is not needed;
- no cross-scope changes block the action.

Use `Can continue: partial` when:

- Git is unavailable but the AI can still explain or plan;
- GitHub/PR context is unavailable but local Git state is enough for a limited answer;
- the worktree is dirty but the user only asked for a read-only summary.

Use `Can continue: stop` when:

- the user asks for commit, branch switch, push, merge, PR, release, or Git approval and Git state is unknown;
- the requested commit does not exist;
- the current branch does not match the requested task;
- the worktree is dirty and the user asks to switch scope or branch;
- changed files show unrelated scope drift;
- the user asks to hide, ignore, or bypass Git state.

## RUN_ID Rules

- Use `RUN_ID` for a new Git Reality Check.
- Use `Source RUN_ID` when validating Git state from a previous run, previous AI answer, prior PR report, or previous handoff.
- If the user asks to validate a previous run and `Source RUN_ID` is missing, return `Can continue: stop`.
