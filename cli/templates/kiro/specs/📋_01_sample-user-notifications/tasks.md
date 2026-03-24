# Implementation Plan: User Notifications

## Overview

Build an in-app notification system with toast alerts, a Notification Centre, read/unread management, and real-time delivery via Supabase Realtime. Depends on `✅_00_sample-auth-setup`.

## Tasks

- [ ] 1. Notification Infrastructure (Week 1)
  - [ ] 1.1 Create `src/lib/db/schema/notifications.ts` — Notification schema
    - Fields: id, user_id, type, title, message, resource_url, read, created_at
    - RLS policies for user-only access
    - _Requirements: R1, NFR3_ | _Effort: 1h_

  - [ ] 1.2 Create `src/lib/notifications/queries.ts` — Notification data access
    - Fetch notifications for user (paginated, reverse chronological)
    - Mark single notification as read, mark all as read
    - Get unread count
    - _Requirements: R2, R3, R4_ | _Effort: 1h_

  - [ ] 1.3 Create `src/lib/notifications/realtime.ts` — Supabase Realtime subscription
    - Subscribe to new notifications for authenticated user
    - Handle connection errors with retry logic (up to 3 retries)
    - _Requirements: R1, NFR2_ | _Effort: 1h_

- [ ] 2. Checkpoint — Verify notification infrastructure
  - Schema migrated and RLS policies active
  - Queries return correct data for authenticated user
  - Realtime subscription receives test notifications

- [ ] 3. Notification UI Components (Week 1-2)
  - [ ] 3.1 Create `src/components/notifications/toast-notification.tsx` — Toast component
    - Render in top-right corner, auto-dismiss after 5 seconds
    - Click navigates to resource, Escape key dismisses
    - _Requirements: R1, NFR1, NFR4_ | _Effort: 1h_

  - [ ] 3.2 Create `src/components/notifications/notification-centre.tsx` — Notification panel
    - List all notifications in reverse chronological order
    - Visual distinction for unread vs read notifications
    - Click marks as read and navigates to resource
    - _Requirements: R2_ | _Effort: 1h_

  - [ ] 3.3 Create `src/components/notifications/notification-icon.tsx` — Header icon with badge
    - Unread count badge, display "99+" when count exceeds 99
    - Hide badge when all notifications are read
    - Toggle Notification Centre on click
    - _Requirements: R4_ | _Effort: 30min_

  - [ ] 3.4 Create `src/components/notifications/mark-read-actions.tsx` — Read management controls
    - "Mark as read" button per notification
    - "Mark all as read" bulk action
    - Error handling with state rollback on failure
    - _Requirements: R3_ | _Effort: 30min_

- [ ] 4. Checkpoint — Verify notification UI
  - Toast renders and auto-dismisses correctly
  - Notification Centre displays items with read/unread styling
  - Badge count updates in real time
  - Mark as read works individually and in bulk

- [ ] 5. Integration and Polish (Week 2)
  - [ ] 5.1 Integrate notification icon into header navigation
    - Add to existing layout header component
    - _Requirements: R4_ | _Effort: 30min_

  - [ ] 5.2 Connect Realtime subscription to toast and badge
    - New notifications trigger toast and increment badge count
    - _Requirements: R1, R4, NFR1_ | _Effort: 1h_

  - [ ] 5.3 Add keyboard navigation to Notification Centre
    - Arrow keys to navigate, Enter to open, Escape to close panel
    - _Requirements: NFR4_ | _Effort: 30min_

- [ ] 6. Final Checkpoint — Verify all notification features
  - Toast renders within 200ms of event receipt
  - Notification Centre loads within 500ms
  - Real-time updates work across browser tabs
  - Keyboard navigation fully functional
  - Users can only see their own notifications

## Progress Tracking

| Phase          | Status      | Completion Date | Notes                              |
| -------------- | ----------- | --------------- | ---------------------------------- |
| Infrastructure | Not Started | —               | Schema, queries, realtime          |
| UI Components  | Not Started | —               | Toast, centre, badge, read actions |
| Integration    | Not Started | —               | Header integration, polish         |
