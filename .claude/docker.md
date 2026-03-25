# Docker Standards

## Image Building

| Rule                   | Implementation                                     |
| ---------------------- | -------------------------------------------------- |
| Use multi-stage builds | Separate build and runtime stages                  |
| Pin base image digests | `node:22-alpine@sha256:...` not `node:latest`      |
| Minimise layers        | Combine related `RUN` commands with `&&`           |
| Use `.dockerignore`    | Exclude `node_modules`, `.git`, `.env*`, `dist`    |
| Run as non-root        | `USER node` or create dedicated user               |
| Use `COPY` not `ADD`   | `ADD` has implicit tar extraction and URL fetching |

## Layer Ordering (Cache Optimisation)

```dockerfile
# 1. Base image
FROM node:22-alpine AS base

# 2. Dependencies (changes least often)
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# 3. Source code (changes most often)
COPY . .

# 4. Build
RUN pnpm build
```

## Security

- Scan images with `docker scout` or equivalent before deployment
- Never store secrets in images — use runtime environment variables or secret mounts
- Use minimal base images (`alpine`, `distroless`) to reduce attack surface
- Set `HEALTHCHECK` instructions for production containers
- Drop all capabilities and add back only what's needed

## Compose Best Practices

- Use named volumes for persistent data
- Set resource limits (`mem_limit`, `cpus`)
- Use `depends_on` with health checks for service ordering
- Keep environment variables in `.env` files excluded from version control
