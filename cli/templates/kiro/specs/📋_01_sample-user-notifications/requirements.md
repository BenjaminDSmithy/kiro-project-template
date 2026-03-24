# Requirements: User Notifications

## Introduction

A notification system that allows users to receive and manage in-app notifications for key events such as mentions, task assignments, and system alerts.

## Glossary

- **Notification**: A message delivered to a user about an event relevant to them
- **Toast**: A brief, auto-dismissing notification displayed in the UI
- **Notification Centre**: A panel listing all past notifications with read/unread state

## Requirements

### R1: Display In-App Notifications

**As a** user
**I want** to see notifications when events occur
**So that** I stay informed about activity relevant to me

**Acceptance Criteria:**

1. WHEN a new notification is received, THE system SHALL display a toast in the top-right corner
2. WHEN the toast is displayed, THE system SHALL auto-dismiss it after 5 seconds
3. WHEN the user clicks the toast, THE system SHALL navigate to the relevant resource

### R2: Notification Centre

**As a** user
**I want** to view all my notifications in one place
**So that** I can review past activity I may have missed

**Acceptance Criteria:**

1. WHEN the user opens the Notification Centre, THE system SHALL display notifications in reverse chronological order
2. WHEN a notification is unread, THE system SHALL visually distinguish it from read notifications
3. WHEN the user clicks a notification, THE system SHALL mark it as read and navigate to the relevant resource

### R3: Mark Notifications as Read

**As a** user
**I want** to mark notifications as read individually or in bulk
**So that** I can manage my notification inbox

**Acceptance Criteria:**

1. WHEN the user clicks "Mark as read" on a notification, THE system SHALL update its status to read
2. WHEN the user clicks "Mark all as read", THE system SHALL update all unread notifications to read
3. IF the update fails, THEN THE system SHALL display an error message and retain the previous state

### R4: Unread Badge Count

**As a** user
**I want** to see how many unread notifications I have
**So that** I know at a glance if there is new activity

**Acceptance Criteria:**

1. WHILE unread notifications exist, THE system SHALL display a badge with the unread count on the notification icon
2. WHEN the unread count exceeds 99, THE system SHALL display "99+"
3. WHEN all notifications are read, THE system SHALL hide the badge

## Non-Functional Requirements

### NFR1: Performance

- Toast notifications SHALL render within 200ms of event receipt
- Notification Centre SHALL load within 500ms

### NFR2: Reliability

- Notifications SHALL be persisted and survive page refreshes
- Failed deliveries SHALL be retried up to 3 times

### NFR3: Security

- Users SHALL only see their own notifications
- Notification endpoints SHALL require authentication

### NFR4: Usability

- Toast notifications SHALL be keyboard-dismissible via Escape
- Notification Centre SHALL be navigable via keyboard

## Dependencies

### Upstream (Required by this spec)

- `✅_00_sample-auth-setup` — User identity for notification targeting

### Downstream (Requires this spec)

- None

## Constraints

- Must use existing Supabase infrastructure for persistence
- Must integrate with existing UI layout (header navigation)

## Assumptions

- Users are authenticated before receiving notifications
- Real-time delivery via Supabase Realtime subscriptions is acceptable

## Notes

- Future iterations may add email/push notification channels

---

## Requirement Numbering Convention

- **R1-R99**: Functional requirements
- **NFR1-NFR9**: Non-functional requirements

Tasks reference requirements using: `_Requirements: R1, R2, NFR1_`
