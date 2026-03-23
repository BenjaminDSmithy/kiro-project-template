# Requirements: Authentication Setup

## Introduction

Configure Supabase Auth with email/password and OAuth providers for the application. This is a foundational feature required by all user-facing features.

## Glossary

- **Session**: A time-limited authentication token pair (access + refresh) issued after successful login
- **Provider**: An external OAuth service (Google, GitHub) used for social login

## Requirements

### R1: Email/Password Authentication

**As a** user
**I want** to sign up and log in with my email and password
**So that** I can access my account without relying on third-party services

**Acceptance Criteria:**

1. WHEN a user submits a valid email and password, THE system SHALL create an account and send a confirmation email
2. WHEN a user confirms their email, THE system SHALL activate the account and allow login
3. IF a user submits an invalid email format, THEN THE system SHALL display a validation error without submitting the form
4. IF a user submits a password shorter than 8 characters, THEN THE system SHALL display a password strength error

### R2: OAuth Social Login

**As a** user
**I want** to log in with Google or GitHub
**So that** I can access my account quickly without creating a new password

**Acceptance Criteria:**

1. WHEN a user clicks "Sign in with Google", THE system SHALL redirect to Google OAuth and return to the app on success
2. WHEN a user clicks "Sign in with GitHub", THE system SHALL redirect to GitHub OAuth and return to the app on success
3. WHEN a new OAuth user logs in for the first time, THE system SHALL create a user profile automatically

### R3: Session Management

**As a** user
**I want** my session to persist across page refreshes
**So that** I don't have to log in every time I visit the app

**Acceptance Criteria:**

1. THE system SHALL store session tokens in secure HTTP-only cookies
2. WHEN a session token expires, THE system SHALL attempt a silent refresh using the refresh token
3. IF the refresh token is also expired, THEN THE system SHALL redirect to the login page

## Non-Functional Requirements

### NFR1: Security

- Passwords SHALL be hashed using bcrypt with a minimum cost factor of 10
- All auth endpoints SHALL be rate-limited to 10 requests per minute per IP
- Session tokens SHALL expire after 1 hour with a 7-day refresh window

### NFR2: Performance

- Login flow SHALL complete in under 2 seconds
- OAuth redirect SHALL complete in under 3 seconds

## Dependencies

### Upstream

- Supabase project configured with Auth enabled

### Downstream

- All user-facing features depend on this spec
