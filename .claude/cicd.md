# CI/CD Pipeline Standards

Pipeline stages, deployment strategies, and rollback procedures.

## Pipeline Stages

| Stage      | Purpose                    | Must pass to proceed |
| ---------- | -------------------------- | -------------------- |
| Lint       | `trunk check --fix`        | Yes                  |
| Type check | `pnpm tsc --noEmit`        | Yes                  |
| Unit tests | `pnpm test -- --run`       | Yes                  |
| Build      | `pnpm build`               | Yes                  |
| E2E tests  | Playwright against preview | Yes (for main)       |
| Deploy     | Push to environment        | After all gates pass |

## Environment Promotion

```text
feature branch -> PR -> staging -> production
```

| Environment | Trigger            | Approval required |
| ----------- | ------------------ | ----------------- |
| Preview     | Every PR (auto)    | No                |
| Staging     | Merge to `develop` | No                |
| Production  | Merge to `main`    | Yes               |

## Deployment Strategy

| Strategy   | When to use                        |
| ---------- | ---------------------------------- |
| Blue-green | Zero-downtime production deploys   |
| Rolling    | Non-critical services              |
| Canary     | High-risk changes, gradual rollout |

## Rollback Procedures

| Step | Action                                          |
| ---- | ----------------------------------------------- |
| 1    | Identify the failing deployment                 |
| 2    | Revert to last known good deployment            |
| 3    | Verify rollback with health checks              |
| 4    | Investigate root cause on the failed version    |
| 5    | Fix, test, and redeploy through normal pipeline |

## Rules

| Rule                             | Rationale                               |
| -------------------------------- | --------------------------------------- |
| Never skip pipeline stages       | Every stage catches different issues    |
| Never deploy from local machines | All deploys go through CI/CD            |
| Pin action versions in workflows | `uses: actions/checkout@v4` not `@main` |
| Store secrets in GitHub Secrets  | Never in workflow files or code         |
| Cache dependencies               | Speed up pipeline runs                  |
| Set timeouts on all jobs         | Prevent hung pipelines                  |
