---
inclusion: manual
---

# Documentation Sync Workflow

Reference with `#document-release` after shipping a feature, merging a PR, or before cutting a release when documentation may have drifted from reality.

## Goal

Make documentation match what actually shipped without rewriting history or inventing release notes.

## Documents to Check

- `README.md`
- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DEPLOYMENT.md`
- `docs/CONTRIBUTING.md`
- `CHANGELOG.md`

## Workflow

1. Review the diff or recent shipped change
2. Identify user-visible, operational, or architectural changes
3. Check each document for drift
4. Update only the sections made stale by the change
5. Verify discoverability: important docs should be linked from `README.md` or `docs/README.md`

## Hard Rules

- Never clobber or regenerate existing changelog history
- Never bump a version silently
- Prefer precise edits over broad rewrites
- If a document is still accurate, say so explicitly and leave it alone

## Changelog Rules

- Follow Keep a Changelog format
- Preserve existing entries
- Additive edits only
- If the latest version entry no longer matches reality, update that entry carefully rather than replacing the whole file

## Output Format

```markdown
## Documentation Sync

- README.md: updated | unchanged | follow-up needed
- docs/ARCHITECTURE.md: ...
- docs/API.md: ...
- docs/DEPLOYMENT.md: ...
- docs/CONTRIBUTING.md: ...
- CHANGELOG.md: ...

### Notes
- ...
```

## Review Questions

Before concluding, verify:

- Can a new contributor still find the right setup path?
- Do architecture docs reflect current components and boundaries?
- Do API docs reflect current endpoints and shapes?
- Do deployment docs match the live release process?
