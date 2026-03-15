---
inclusion: manual
---

# Agent Hooks

Hooks automate workflows by triggering actions on IDE events. Location: `.kiro/hooks/`.

## Hook Schema

```json
{
  "name": "string (required)",
  "version": "string (required, semver)",
  "description": "string (optional)",
  "when": {
    "type": "fileEdited | fileCreated | fileDeleted | userTriggered | agentStop | promptSubmit | preToolUse | postToolUse | preTaskExecution | postTaskExecution",
    "patterns": ["file globs (required for file events)"],
    "toolTypes": [
      "tool categories or regex (required for preToolUse/postToolUse)"
    ]
  },
  "then": {
    "type": "askAgent | runCommand",
    "prompt": "string (required for askAgent)",
    "command": "string (required for runCommand)"
  }
}
```

## Trigger Types

| Type                | Config                 | Use Case                        |
| ------------------- | ---------------------- | ------------------------------- |
| `fileEdited`        | `patterns: ["glob"]`   | React to file saves             |
| `fileCreated`       | `patterns: ["glob"]`   | React to new files              |
| `fileDeleted`       | `patterns: ["glob"]`   | React to removed files          |
| `userTriggered`     | —                      | On-demand manual tasks          |
| `agentStop`         | —                      | Post-task validation            |
| `promptSubmit`      | —                      | Inject context on message send  |
| `preToolUse`        | `toolTypes: ["write"]` | Intercept before tool execution |
| `postToolUse`       | `toolTypes: ["write"]` | React after tool execution      |
| `preTaskExecution`  | —                      | Before spec task starts         |
| `postTaskExecution` | —                      | After spec task completes       |

### Tool Type Categories (for preToolUse/postToolUse)

| Category | Tools Matched                  |
| -------- | ------------------------------ |
| `read`   | File read operations           |
| `write`  | File write/edit operations     |
| `shell`  | Bash/command execution         |
| `web`    | Web search, fetch              |
| `spec`   | Spec-related operations        |
| `*`      | All tools                      |
| Regex    | Custom pattern, e.g. `.*sql.*` |

## Action Types

| Type         | Config           | Behaviour                          |
| ------------ | ---------------- | ---------------------------------- |
| `askAgent`   | `prompt: "..."`  | Send prompt to agent for reasoning |
| `runCommand` | `command: "..."` | Execute shell command directly     |

## Naming Convention

| Prefix | Category                                                   |
| ------ | ---------------------------------------------------------- |
| `0X-`  | File-triggered quality checks                              |
| `1X-`  | User-triggered manual tasks                                |
| `2X-`  | Automation (lifecycle, tool intercept, file create/delete) |
