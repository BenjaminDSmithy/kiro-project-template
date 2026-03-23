# Implementation Plan: Dashboard

## Overview

Build the main dashboard page with KPI widgets, activity feed, and quick actions. Depends on `✅_00_sample-auth-setup`.

## Tasks

- [x] 1. Dashboard Layout and KPI Widgets (Week 1)
  - [x] 1.1 Create `src/app/dashboard/page.tsx` — Dashboard page with grid layout
    - Responsive grid: 1 col mobile, 2 col tablet, 4 col desktop
    - Wrap each widget in `<Suspense>` with skeleton fallback
    - _Requirements: R1_ | _Effort: 1h_

  - [x] 1.2 Create `src/components/dashboard/kpi-widget.tsx` — Reusable KPI card
    - Props: title, value, change percentage, icon
    - Colour-coded change indicator (green up, red down)
    - _Requirements: R1_ | _Effort: 30min_

  - [x] 1.3 Create `src/lib/dashboard/queries.ts` — Dashboard data fetching
    - Server-side queries for KPI metrics
    - Return typed `DashboardMetrics` object
    - _Requirements: R1, NFR1_ | _Effort: 1h_

- [x] 2. Checkpoint — Verify dashboard layout
  - Dashboard renders with 4 KPI widgets
  - Skeleton placeholders show during loading
  - Responsive grid works across breakpoints

- [ ] 3. Activity Feed and Quick Actions (Week 2)
  - [x] 3.1 Create `src/components/dashboard/activity-feed.tsx` — Recent activity list
    - Display 10 most recent items in reverse chronological order
    - Empty state with helpful message when no activity
    - _Requirements: R2_ | _Effort: 1h_

  - [ ] 3.2 Create `src/lib/dashboard/activity.ts` — Real-time activity subscription
    - Supabase Realtime subscription for new activity
    - Prepend new items without full page refresh
    - _Requirements: R2, NFR1_ | _Effort: 1h_

  - [ ] 3.3 Create `src/components/dashboard/quick-actions.tsx` — Quick action buttons
    - Buttons: Create Order, View Reports, Manage Users
    - Navigate to relevant pages on click
    - _Requirements: R3_ | _Effort: 30min_

- [ ] 4. Checkpoint — Verify activity and actions
  - Activity feed displays items correctly
  - Real-time updates prepend new items
  - Quick action buttons navigate correctly

- [ ] 5. Polish and Performance (Week 2)
  - [ ] 5.1 Add loading states and error boundaries
    - `loading.tsx` and `error.tsx` for dashboard route
    - _Requirements: NFR1_ | _Effort: 30min_

  - [ ] 5.2 Optimise dashboard queries for performance
    - Parallel data fetching with `Promise.all`
    - Cache KPI queries with `unstable_cache`
    - _Requirements: NFR1_ | _Effort: 1h_

  - [ ] 5.3 Add responsive design polish
    - Test all breakpoints, adjust spacing
    - Ensure touch targets meet 44px minimum
    - _Requirements: NFR2_ | _Effort: 30min_

- [ ] 6. Final Checkpoint — Verify all dashboard features
  - Dashboard loads within 2 seconds on 4G
  - All widgets stream independently via Suspense
  - Layout adapts correctly across breakpoints

## Progress Tracking

| Phase              | Status      | Completion Date | Notes                            |
| ------------------ | ----------- | --------------- | -------------------------------- |
| Layout & KPIs      | Complete    | 2026-03-16      | Grid + 4 widgets working         |
| Activity & Actions | In Progress | —               | Activity feed done, 2 tasks left |
| Polish             | Not Started | —               | Blocked by Phase 2               |
