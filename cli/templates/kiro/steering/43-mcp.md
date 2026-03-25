---
inclusion: always
---

# MCP (Model Context Protocol) Standards

## Configuration Locations

| Level     | Path                        | Precedence |
| --------- | --------------------------- | ---------- |
| User      | `~/.kiro/settings/mcp.json` | Lowest     |
| Workspace | `.kiro/settings/mcp.json`   | Highest    |

Workspace config overrides user config for server name conflicts.

## Server Configuration

```json
{
  "mcpServers": {
    "server-name": {
      "command": "uvx",
      "args": ["package-name@latest"],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Rules

| Rule                          | Implementation                                    |
| ----------------------------- | ------------------------------------------------- |
| Use `autoApprove` sparingly   | Only for trusted, low-risk read operations        |
| Pin versions in production    | Use `@latest` only in development                 |
| Set log level to ERROR        | Reduces noise in agent context                    |
| Test immediately after adding | Don't wait for issues — verify with a sample call |
| Disable unused servers        | Set `disabled: true` to improve startup time      |

## Verification Workflow

After adding or changing an MCP server:

1. confirm the command and args are correct
2. reload or reconnect the server if needed
3. make one sample call immediately
4. record any auth or environment requirements in project docs

If the server provides documentation or compatibility lookup, use it before adding unfamiliar dependencies or integrations.

## Preferred MCP Servers

| Domain   | Server   | Use Case                    |
| -------- | -------- | --------------------------- |
| Database | supabase | Schema management, queries  |
| Git      | git      | Commits, diffs, history     |
| Browser  | chrome   | Visual testing, screenshots |
| Docker   | docker   | Container management        |

Documentation servers such as Context7 are recommended when available for:

- dependency compatibility checks
- framework API verification
- reducing reliance on stale memory

## Troubleshooting

- Check server status in Kiro's MCP Server view panel
- Servers reconnect automatically on config changes — no restart needed
- Use command palette → "MCP" for server management commands
- Verify `uv`/`uvx` installation if Python-based servers fail
