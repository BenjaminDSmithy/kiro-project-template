# Security Audit Workflow

## Modes

| Mode            | Use When                              | Depth                                |
| --------------- | ------------------------------------- | ------------------------------------ |
| `Daily`         | Routine review on active work         | Focus on high-confidence issues only |
| `Comprehensive` | Release, milestone, or periodic audit | Include design and systemic risks    |

## Audit Areas

### 1. Secrets and Sensitive Data

- Hardcoded secrets
- Accidental credential exposure in logs, tests, fixtures, or docs
- Weak secret rotation or storage patterns

### 2. Authentication and Authorisation

- Missing server-side authz checks
- Insecure direct object references
- Over-trusting client state
- Missing or weak RLS where applicable

### 3. Input, Output, and Injection

- Validation gaps at boundaries
- SQL, HTML, or command injection paths
- Unsafe deserialisation or parsing

### 4. Dependency and Supply Chain

- Vulnerable or abandoned dependencies
- Risky post-install or build scripts
- Weak provenance around critical tooling

### 5. Application Security

- OWASP Top 10 style issues
- Session management problems
- Missing security headers
- Unsafe file upload or download flows

### 6. Infrastructure and CI/CD

- Secrets in pipeline config
- Over-privileged deployment credentials
- Missing audit or rollback visibility

### 7. AI and Tooling Trust Boundaries

- Prompt injection exposure
- Unvalidated model output written to stateful systems
- Unsafe autonomous tool use around production systems

## Threat Modelling

For important features, include a lightweight STRIDE pass:

| Area                   | Main threat | Existing control | Gap |
| ---------------------- | ----------- | ---------------- | --- |
| Spoofing               |             |                  |     |
| Tampering              |             |                  |     |
| Repudiation            |             |                  |     |
| Information Disclosure |             |                  |     |
| Denial of Service      |             |                  |     |
| Elevation of Privilege |             |                  |     |

## Severity

| Severity | Meaning                                      |
| -------- | -------------------------------------------- |
| Critical | Immediate exploitable risk or major exposure |
| High     | Serious weakness with realistic abuse path   |
| Medium   | Important weakness with narrower impact      |
| Low      | Defence-in-depth or hygiene issue            |

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
