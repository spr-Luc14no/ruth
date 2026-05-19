---
guardrail_file: true
kit: ai-guardrails
version: 0.9.12
file_role: validation_card
required_reading: true
---

# RailGuard Studio Validation Card

## AI Identity Contract

You are operating inside RailGuard Studio.
This card checks whether the AI followed the operational contract.
Do not mark an item complete without evidence.

## Before Coding

- [ ] Activation Gate returned
- [ ] Scope Read Gate returned before plan/code/approval/block
- [ ] Scope Read Report returned
- [ ] Scope source declared
- [ ] Files read listed
- [ ] Files not accessible listed
- [ ] Approved scope found stated as yes/no/unknown
- [ ] Phase/block has source or is `unknown`
- [ ] RUN_ID created for real task
- [ ] Raw prompt saved: no
- [ ] Raw response saved: no
- [ ] Memory loaded
- [ ] Loaded context summary included
- [ ] Task summarized
- [ ] Allowed scope listed
- [ ] Forbidden scope listed
- [ ] Sensitive areas identified
- [ ] Risk level assigned
- [ ] Stop conditions checked
- [ ] `Can continue` answered
- [ ] Run Log generated

## Required Output Fields

- [ ] `Activation Gate`
- [ ] `Scope Read Gate`
- [ ] `Scope Read Report`
- [ ] `Scope source`
- [ ] `Files read`
- [ ] `Files not accessible`
- [ ] `Approved scope found`
- [ ] `Current phase/block`
- [ ] `Memory loaded`
- [ ] `Memory files read`
- [ ] `Memory files missing`
- [ ] `Loaded context summary`
- [ ] `Scope summary`
- [ ] `Allowed scope`
- [ ] `Allowed scope source`
- [ ] `Forbidden scope`
- [ ] `Forbidden scope source`
- [ ] `Sensitive areas`
- [ ] `Sensitive areas source`
- [ ] `Risk level`
- [ ] `Risk reason`
- [ ] `Risk source`
- [ ] `Can continue`
- [ ] `Reason`
- [ ] `Assumptions`
- [ ] `Missing context`
- [ ] `Positive tests`
- [ ] `Bad-path tests`
- [ ] `Canonical CI Command Gate`
- [ ] `Tests actually run`
- [ ] `Checks actually performed`
- [ ] `Next command`
- [ ] `Memory update needed`
- [ ] `RailGuard Studio Run Log`

## Security And Risk

- [ ] Auth risk checked, if relevant
- [ ] Authorization/ownership risk checked, if relevant
- [ ] Payment/subscription risk checked, if relevant
- [ ] Upload/storage risk checked, if relevant
- [ ] Database/data access risk checked, if relevant
- [ ] Public API risk checked, if relevant
- [ ] AI/private-context risk checked, if relevant
- [ ] Admin risk checked, if relevant
- [ ] Data/logging risk checked, if relevant
- [ ] Environment signals conflict checked
- [ ] Most restrictive environment wins
- [ ] Security Switches classified as security boundary, not helper/config only
- [ ] Security Switch conflict/adversarial tests listed
- [ ] External Call Gate checked before token/payment/email/storage/auth/webhook/AI calls
- [ ] Hallucination/Evidence Score assigned
- [ ] Security Boundary Review required for high/max before merge/PR/release
- [ ] Bad-path tests suggested

## Verification

- [ ] Positive tests listed
- [ ] Bad-path tests listed
- [ ] Regression checks listed
- [ ] Canonical CI/package/workflow commands listed
- [ ] Similar commands not treated as CI proof
- [ ] Commands actually run are separated from commands suggested
- [ ] Unknown or unchecked items are stated
- [ ] Session report updated or explicitly marked not updated
- [ ] Run Log updated or generated for copy/paste

## Release Readiness

- [ ] Release status is GREEN/YELLOW/RED, if release is involved
- [ ] Blocking risks are listed
- [ ] Non-blocking risks are listed
- [ ] Rollback need is considered
- [ ] Environment risk is considered
- [ ] Environment conflict uses most restrictive signal
- [ ] Database/migration risk is considered
- [ ] Security Boundary Review completed for high/max changes

## Memory

- [ ] Business rule changes recorded or proposed
- [ ] Do-not-break changes recorded or proposed
- [ ] Sensitive area changes recorded or proposed
- [ ] Risks recorded or proposed
- [ ] Next action listed

## Result

Choose one:

- GREEN: safe to continue based on checked items.
- YELLOW: can continue with known risk.
- RED: stop before coding, release, or merge.

## Required Summary

```txt
RUN_ID:
Validation result: GREEN/YELLOW/RED
Evidence:
Missing items:
Blocking risks:
Next command:
Memory update needed: yes/no
```
