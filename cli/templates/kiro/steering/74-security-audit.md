---
inclusion: manual
---

# Security Audit Workflow

Reference with `#security-audit` when performing a deliberate security review, threat model, or pre-release audit.

## Modes

| Mode            | Use When                          | Depth |
| --------------- | --------------------------------- | ----- |
| `Daily`         | Routine review on active work     | Focus on high-confidence issues only |
| `Comprehensive` | Release, milestone, or periodic audit | Include design and systemic risks |

## Audit Areas

### 1. Secrets and Sensitive Data

- hardcoded secrets
- accidental credential exposure in logs, tests, fixtures, or docs
- weak secret rotation or storage patterns

### 2. Authentication and Authorisation

- missing server-side authz checks
- insecure direct object references
- over-trusting client state
- missing or weak RLS where applicable

### 3. Input, Output, and Injection

- validation gaps at boundaries
- SQL, HTML, or command injection paths
- unsafe deserialisation or parsing

### 4. Dependency and Supply Chain

- vulnerable or abandoned dependencies
- risky post-install or build scripts
- weak provenance around critical tooling

### 5. Application Security

- OWASP Top 10 style issues
- session management problems
- missing security headers
- unsafe file upload or download flows

### 6. Infrastructure and CI/CD

- secrets in pipeline config
- over-privileged deployment credentials
- missing audit or rollback visibility

### 7. AI and Tooling Trust Boundaries

- prompt injection exposure
- unvalidated model output written to stateful systems
- unsafe autonomous tool use around production systems

## Threat Modelling

For important features, include a lightweight STRIDE pass:

| Area | Main threat | Existing control | Gap |
| ---- | ----------- | ---------------- | --- |
| Spoofing | | | |
| Tampering | | | |
| Repudiation | | | |
| Information Disclosure | | | |
| Denial of Service | | | |
| Elevation of Privilege | | | |

## Severity

| Severity   | Meaning                                      |
| ---------- | -------------------------------------------- |
| Critical   | Immediate exploitable risk or major exposure |
| High       | Serious weakness with realistic abuse path   |
| Medium     | Important weakness with narrower impact      |
| Low        | Defence-in-depth or hygiene issue            |

## Output Format

```markdown
## Security Audit

### Findings
1. [Severity] Title
   - Area:
   - Evidence:
   - Risk:
   - Recommended fix:

### Clean Areas
- ...
```

## Rules

- Prefer evidence-backed findings over speculative noise
- Flag high-risk issues even if they are outside the active diff
- Distinguish between code standards violations and realistic attack paths
- If a fix is security-sensitive and confidence is low, escalate instead of guessing
