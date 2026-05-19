---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: do_not_break
required_reading: true
---

# Do Not Break

## AI Identity Contract

You are operating inside RailGuard Studio.
This file defines protected behavior.
Do not change protected behavior unless the user explicitly approves it.

## Protected Behavior Template

```txt
Protected behavior:
Why it matters:
Files or areas:
How to verify:
Last checked:
```

## Protected Behaviors

Add critical behavior here.

Examples:

- Existing users can log in.
- Existing checkout still grants the correct plan.
- Users cannot see data from another user or organization.
- Admin pages are not available to regular users.
- Public URLs do not change unless approved.

## Default Protection Rules

You must not:

- edit unrelated files;
- refactor outside scope;
- rename public routes without approval;
- change environment variable names without approval;
- remove validation without approval;
- remove tests without approval;
- claim protected behavior still works without checking or listing a verification gap.
