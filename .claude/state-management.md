# State Management Standards

Choose the right state tool for the job. Over-using any single approach leads to complexity.

## Decision Tree

```text
1. Is it server data (DB, API)?          -> Server state (fetch in Server Component)
2. Is it URL-representable (filters)?    -> URL state (searchParams)
3. Is it form input?                     -> Local state (useState)
4. Is it shared across distant siblings? -> Context (if small) or URL state
5. Is it real-time / frequently updated? -> Client state (SWR / React Query)
6. Is it component-local UI state?       -> Local state (useState)
```

## State Types

| Type         | Tool                         | Example                         |
| ------------ | ---------------------------- | ------------------------------- |
| Server state | Server Components            | User profile, order list        |
| URL state    | `useSearchParams`, `nuqs`    | Filters, pagination, sort order |
| Form state   | `useState`, `useActionState` | Input values, validation errors |
| Shared UI    | React Context                | Theme, sidebar open/closed      |
| Real-time    | SWR / Supabase Realtime      | Notifications, live updates     |
| Optimistic   | `useOptimistic`              | Like button, form submission    |

## Rules

| Rule                                    | Rationale                                  |
| --------------------------------------- | ------------------------------------------ |
| Server Components for server data       | No client bundle, no loading states needed |
| URL for anything bookmarkable/shareable | Users can share links, back button works   |
| Context only for truly global UI state  | Theme, locale — not data fetching          |
| Never put server data in Context        | Stale data, unnecessary re-renders         |
| Never use `useEffect` to sync state     | Derive state or lift it up instead         |
| Prefer `useOptimistic` for mutations    | Instant feedback, better UX                |

## Anti-Patterns

| Avoid                                 | Instead                          |
| ------------------------------------- | -------------------------------- |
| Global state for everything           | Use the decision tree above      |
| Context for server data               | Fetch in Server Components       |
| `useEffect` + `useState` for fetching | Server Components or SWR         |
| Prop drilling through 5+ levels       | Context or component composition |
| Storing derived values in state       | Compute during render            |
