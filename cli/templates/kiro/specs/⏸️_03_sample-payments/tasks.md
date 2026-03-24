# Implementation Plan: Payment Processing

## Overview

Integrate Stripe for subscriptions, billing management, and invoice history. This spec is on hold pending completion of the dashboard spec.

> **⏸️ ON HOLD**: Blocked by `🚧_02_sample-dashboard` — billing widget requires the dashboard layout to be complete.

## Tasks

- [ ] 1. Stripe Infrastructure (Week 1)
  - [ ] 1.1 Create `src/lib/payments/stripe.ts` — Stripe client initialisation
    - Server-side Stripe SDK instance
    - Type-safe wrapper for common operations
    - _Requirements: R1, R2_ | _Effort: 30min_
    - Note: Blocked by `🚧_02_sample-dashboard` — see `⏸️` status

  - [ ] 1.2 Create `src/lib/db/schema/subscriptions.ts` — Subscription schema
    - Fields: user_id, stripe_customer_id, stripe_subscription_id, plan, status
    - RLS policies for user-only access
    - _Requirements: R2_ | _Effort: 1h_

  - [ ] 1.3 Create `src/app/api/webhooks/stripe/route.ts` — Webhook handler
    - Verify Stripe signature, process subscription events
    - Idempotent processing with event ID deduplication
    - _Requirements: R2, NFR1, NFR2_ | _Effort: 2h_

- [ ] 2. Checkpoint — Verify Stripe infrastructure
  - Stripe client connects with test keys
  - Webhook endpoint receives and verifies test events
  - Subscription schema migrated successfully

- [ ] 3. Payment UI (Week 2)
  - [ ] 3.1 Create `src/app/pricing/page.tsx` — Pricing page
    - Display plans with features and pricing
    - Redirect to Stripe Checkout on plan selection
    - _Requirements: R1_ | _Effort: 1h_

  - [ ] 3.2 Create `src/app/settings/billing/page.tsx` — Billing settings
    - Current plan display, Stripe Customer Portal link
    - _Requirements: R2_ | _Effort: 1h_

  - [ ] 3.3 Create `src/components/billing/invoice-list.tsx` — Invoice history
    - Reverse chronological list with PDF download links
    - Empty state when no invoices
    - _Requirements: R3_ | _Effort: 1h_

- [ ] 4. Checkpoint — Verify payment UI
  - Pricing page renders plans correctly
  - Checkout flow completes in Stripe test mode
  - Billing history displays test invoices

- [ ] 5. Dashboard Integration (Week 2)
  - [ ] 5.1 Create `src/components/dashboard/billing-widget.tsx` — Billing KPI widget
    - Current plan, next billing date, monthly spend
    - _Requirements: R2_ | _Effort: 30min_

- [ ] 6. Final Checkpoint — Verify all payment features
  - End-to-end subscription flow works in test mode
  - Webhook processes events idempotently
  - Billing widget displays on dashboard

## Progress Tracking

| Phase          | Status  | Completion Date | Notes                                  |
| -------------- | ------- | --------------- | -------------------------------------- |
| Infrastructure | On Hold | —               | Blocked by dashboard spec              |
| Payment UI     | On Hold | —               | Blocked by infrastructure              |
| Integration    | On Hold | —               | Blocked by dashboard layout completion |
