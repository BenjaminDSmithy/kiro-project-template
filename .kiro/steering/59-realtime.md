---
inclusion: fileMatch
fileMatchPattern:
  - "**/realtime/**/*"
  - "**/hooks/use-realtime*"
  - "**/hooks/use-presence*"
  - "**/lib/supabase/**/*"
---

# Supabase Realtime Standards

Patterns for channels, presence, broadcast, and postgres changes.

## Decision Tree: Which Realtime Feature?

```text
1. Need to sync database row changes?     → Postgres Changes (subscribe to table)
2. Need ephemeral messaging between users? → Broadcast (no persistence)
3. Need to track who's online/active?      → Presence (join/leave/sync)
4. Need all three on one channel?          → Combine on a single channel
```

## Channel Naming Convention

| Pattern                        | Example                          | Use case                |
| ------------------------------ | -------------------------------- | ----------------------- |
| `{resource}:{id}`              | `order:abc-123`                  | Single resource updates |
| `{resource}:{id}:{sub}`        | `order:abc-123:comments`         | Nested resource updates |
| `room:{id}`                    | `room:lobby`                     | Chat/collaboration      |
| `user:{id}`                    | `user:abc-123`                   | User-specific events    |

## Postgres Changes

```typescript
const channel = supabase
  .channel('orders-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${userId}` },
    (payload) => {
      // Handle INSERT, UPDATE, DELETE
    },
  )
  .subscribe();
```

| Rule                                | Rationale                              |
| ----------------------------------- | -------------------------------------- |
| Always filter by user/tenant        | Never broadcast all rows to all users  |
| Use specific events over `*`        | Reduce unnecessary processing          |
| Enable RLS on subscribed tables     | Realtime respects RLS policies         |

## Presence

```typescript
const channel = supabase.channel('room:lobby');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    // Update UI with current participants
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ userId, displayName });
    }
  });
```

## Cleanup Pattern

Always unsubscribe when the component unmounts:

```typescript
useEffect(() => {
  const channel = supabase.channel('my-channel')
    .on('postgres_changes', { /* config */ }, handler)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

## Reconnection Handling

| Scenario              | Behaviour                                    |
| --------------------- | -------------------------------------------- |
| Network disconnect    | Supabase client auto-reconnects              |
| Token expiry          | Refresh token before subscribing             |
| Channel error         | Log error, attempt resubscribe with backoff  |

## Rules

| Rule                                    | Rationale                                |
| --------------------------------------- | ---------------------------------------- |
| Always clean up channels on unmount     | Prevents memory leaks and ghost listeners|
| Filter subscriptions server-side        | Don't send data the client doesn't need  |
| Use Realtime only for genuinely live data| Polling or Server Components for the rest|
| Keep channel count minimal              | Each channel is a WebSocket connection   |
| Handle reconnection gracefully          | Users shouldn't see broken state         |
| Test with network throttling            | Verify behaviour under poor connectivity |
