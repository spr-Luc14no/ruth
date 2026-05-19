---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: session_report
required_reading: true
---

# RailGuard Studio Session Report

## Purpose

Capture what happened in the current session without inventing work, tests, or memory updates.

Use this when the user asks:

- what happened;
- what was done;
- where we stopped;
- what to do next;
- how to continue in another chat.

## Privacy Rule

Do not store raw prompts or raw AI responses by default.

Use `RUN_LOG.md` for the operational summary.

## Session Summary

```txt
Session goal:
Started at:
Current status: active/paused/stopped/blocked/completed
Last known stop point:
Next recommended action:
```

## Runs In This Session

```txt
RUN_ID:
User request summary:
Detected intent:
Risk level:
Can continue: ok/partial/stop
Evidence status:
Work report generated: yes/no
Handoff generated: yes/no
Memory update needed: yes/no
```

## Files Changed

```txt
Files actually changed:
Files analyzed:
Files not touched:
```

## Evidence And Checks

```txt
Tests suggested:
Tests actually run:
Checks suggested:
Checks actually performed:
Evidence attached:
Evidence missing:
```

## Risks And Blocks

```txt
Sensitive areas:
Risks found:
Blocking risks:
Accepted risks:
```

## Memory Updates

```txt
Memory updates proposed:
Memory files actually edited:
Memory files not edited:
Sensitive data excluded:
```

## Continuation

```txt
Can continue: ok/partial/stop
Reason:
Handoff ready: yes/no/partial
Next command:
```
