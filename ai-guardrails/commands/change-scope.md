---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
command: change-scope
required_reading: true
---

# @change-scope

## Goal

Change scope deliberately without mixing tasks.

## Required Output

```txt
Request RUN_ID:
Source RUN_ID:
Source RUN_ID status: present/missing
Old scope:
New requested scope:
Why the scope changed:
Risk level: low/mid/high/max
Risk boundary:
Sensitive areas:
Evidence needed:
Evidence provided:
Requires new RUN_ID: yes
Human approval required: yes/no
What can proceed:
What cannot proceed:
Can continue: ok/partial/stop
Continuation reason:
Next action:
```

## Rules

- If `Source RUN_ID` is missing, return `Can continue: stop` and ask which run is being changed.
- Do not silently change scope.
- Treat an unrelated request during an active run as scope drift, not as a normal continuation.
- If the current scope is `auth` and the user asks for documentation/export, payment, deploy, database, admin, webhook, or unrelated UI, return `Can continue: stop` until `@change-scope` is completed.
- If the current scope is documentation/export and the user asks for auth, payment, deploy, database, admin, webhook, or unrelated UI, return `Can continue: stop` until `@change-scope` is completed.
- Keep the old `RUN_ID` as source.
- Create a new `Request RUN_ID` for the change request.
- Require a separate implementation `RUN_ID` before implementing the new scope.
- High/max scope changes require confirmation.
- Payment, checkout, paid access, payment secrets, production data, admin privilege, destructive migrations, and multi-tenant boundaries are `max` unless trusted scope says otherwise.
- Do not treat a short `@change-scope` as approval to continue.
- Do not claim the new scope is approved without evidence or explicit trusted confirmation.
