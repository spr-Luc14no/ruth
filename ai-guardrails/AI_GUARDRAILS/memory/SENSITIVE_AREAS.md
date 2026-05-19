---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: sensitive_areas
required_reading: true
---

# Sensitive Areas

## AI Identity Contract

You are operating inside RailGuard Studio.
Sensitive areas require extra caution.
If a task touches a sensitive area, label risk before coding.

## Risk Map

Use this table to mark the project.

| Area | Exists | Risk | Required Command | Notes |
|---|---|---|---|---|
| Auth/Login | unknown | high | `@check-security` | Sessions, login, signup, password reset |
| Authorization/Permissions | unknown | high | `@check-security` | Ownership, roles, org access |
| Payment/Subscriptions | unknown | max | `@check-security` | Checkout, plans, paid access, payment secrets |
| Webhooks | unknown | high | `@check-security` | Signature, duplicate events |
| Uploads/Storage | unknown | high | `@check-security` | File type, size, ownership, public URLs |
| Database | unknown | high | `@build-safe` + `@check-security` | Schema, migrations, data access |
| Admin | unknown | high | `@check-security` | Admin routes/actions |
| Personal Data | unknown | high | `@check-security` | Private data, logs, exports |
| Public API | unknown | high | `@check-security` | Auth, validation, abuse |
| AI Integration | unknown | high | `@check-security` | Prompt data, logs, cost, private context |
| Multi-tenant/Orgs | unknown | max | `@check-security` | Tenant boundaries |
| Security Switches | unknown | high | `@build-safe` + `@check-security` | Helpers/config/env/flags/functions that decide whether a protection is active |

## Default Sensitive Rule

If a task touches any area marked high or max:

1. Do not code immediately.
2. Run `@build-safe`.
3. Run `@check-security`.
4. Require bad-path tests.
5. Require Security Boundary Review before merge, PR, release, or security approval.
6. End with `@remember-changes`.

## Security Boundary Rule

If a task touches auth, permissions, payment, webhooks, uploads, database, admin, personal data, public API, AI integration with private context, multi-tenant boundaries, secrets, deploy environment, or production data:

- do not approve merge, PR, release, or security completion after only one pass;
- require a separate Security Boundary Review with its own `RUN_ID`;
- require direct evidence for critical claims;
- require bad-path tests or mark them missing;
- use the most restrictive environment signal when environment values conflict;
- return `Can continue: stop` if the boundary review is missing for high/max approval.

## Security Switch Rule

If a helper, config, environment function, feature flag, middleware, route guard, or boolean check decides whether a protection is active, treat it as a sensitive security boundary.

Examples:

- signed OAuth state required or optional;
- PKCE verifier required or optional;
- CSRF/nonce/session/cookie/auth/policy/ownership/admin checks;
- payment signature, webhook signature, idempotency, rate limit, or tenant isolation;
- local/dev fallback versus staging/prod/preview strict mode.

Required behavior:

- fail closed when uncertain;
- test conflicting inputs, not only isolated happy-path values;
- public/client values cannot relax trusted deploy/server signals;
- `Can continue: stop` for approval if adversarial conflict tests are missing.
