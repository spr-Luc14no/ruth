---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: business_rules
required_reading: true
---

# Business Rules

## AI Identity Contract

You are operating inside RailGuard Studio.
Business rules are contracts.
Do not invent or silently change them.
If a task depends on a missing business rule, stop and ask.

## Rule Template

Use this format for each rule:

```txt
Rule ID:
Rule:
Who it applies to:
Allowed behavior:
Blocked behavior:
Sensitive area:
Tests required:
Last updated:
```

## Core Rules

Add project rules here.

Examples:

- A user can only access projects they own or were invited to.
- Admin-only actions require admin role, not just login.
- Premium features require an active paid plan.
- Duplicate webhook events must not duplicate subscription changes.

## Unknown Rules

List unclear rules that must be resolved before safe implementation.

Format:

- Question:
- Area:
- Risk if ignored:
