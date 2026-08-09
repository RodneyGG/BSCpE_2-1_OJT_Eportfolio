# Project Handoff and Session Logs

## 1. Project Overview
A Next.js frontend application for a BSCpE OJT e-portfolio. The application features student profiles, company dashboards, and document submission tracking.

## 2. Current State (Replace entirely on update)
**Status**: The application has undergone a full security and production-readiness audit, profile UI polish, and bug fixes on the notification system.
- The student profile page (`frontend/app/profile/page.tsx`) features a polished avatar upload UI (instant upload with loading states, centered object-fit cropping, explicit remove button) and cleanly merged profile/hours metrics.
- The global `AppNavbar.tsx` features a robust auto-delete notification system (read notifications fade and delete after 5s), properly wrapped error catches to avoid client-side leakage, and cleanly spaced drop-downs.
- All sensitive API routes (`/login`, `/setup-account`, `/forgot-password`, `/reset-password`) are protected by Laravel `throttle` rate-limiting middleware to prevent brute-forcing.
- Nginx configuration (`nginx/default.conf`) is fortified with strict security headers including a baseline `Content-Security-Policy`.
- `fetchApi` securely handles `FormData` bridging seamlessly between environments.
- The Admin Checklist page (`frontend/app/admin/checklist/page.tsx`) has robust print support scaling out perfectly for a landscape view.
- Document and Notification controllers enforce strict IDOR (Insecure Direct Object Reference) checks ensuring users can only delete their own resources (or admins).
- The frontend Next.js application cleanly builds as a static export without any high-severity npm vulnerabilities.
- All modifications are currently on the `feature/profile-pic-and-readme` branch.

## 3. Session Logs
### 2026-08-09 - Security & Production Readiness Audit
- **Agent:** Antigravity
- **Summary of Changes:**
  - Performed a deep grep audit across the codebase confirming no leaked secrets or `.env` files in git history.
  - Ran `npm audit fix` to resolve 3 high severity vulnerabilities in Next.js frontend dependencies.
  - Hardened backend routes (`api.php`) by adding `throttle:10,1` and `throttle:5,1` rate-limiting middlewares to auth endpoints (`/login`, `/setup-account`, `/forgot-password`, `/reset-password`).
  - Added a baseline `Content-Security-Policy` header to `nginx/default.conf`.
  - Replaced a hardcoded `localhost:8000` string in the profile avatar upload with a dynamic `fetchApi` endpoint to prevent production failures.
  - Standardized client-side error handling to avoid leaking backend stack traces via `console.error` in the browser console.
- **Branch:** `feature/profile-pic-and-readme`

### 2026-08-09 - Profile Avatar UI Redesign
- **Agent:** Antigravity
- **Summary of Changes:**
  - Refactored the avatar picture upload UI in `profile/page.tsx` for a more polished aesthetic.
  - Locked avatar sizing to `88px` on desktop (`64px` mobile) using `object-fit: cover` and `object-position: center`. Added a double-ring shadow border.
  - Restyled "Upload Photo" and "Remove Photo" buttons and converted the avatar upload flow to an instant upload (separated from "Save Profile") with proper disable/loading states.
- **Branch:** `feature/profile-pic-and-readme`

### 2026-08-09 - Notification Auto-Delete
- **Agent:** Antigravity
- **Summary of Changes:**
  - **Database Migration:** Added a `read_at` timestamp to the `notifications` table to track when a notification was opened.
  - **API Adjustments:**
    - Modified `markAsRead` and `markAllAsRead` to immediately record `read_at = now()`.
    - Implemented a durable auto-cleanup process in the `index` method, automatically deleting any read notifications older than 5 seconds when fetched.
    - Added a `DELETE /api/notifications/{notification}` endpoint.
  - **UI/Frontend:** Updated `AppNavbar.tsx` so that marking a notification as read triggers a 5-second `setTimeout`. Upon timeout, an `is_deleting` flag is set to smoothly fade and collapse the notification over 500ms before removing it from the state and firing the `DELETE` API call.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-09 - AppNavbar Bug Fix
- **Agent:** Antigravity
- **Summary of Changes:**
  - **AppNavbar Bug Fix:** Updated the `loadNotifications` catch block to extract and log explicit error properties instead of silently swallowing the thrown API object. Added a `notifError` state to display an orange exclamation badge on the bell icon if the notifications fetch fails, preventing silent failures.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-08 - Checklist Print Readability Improvements
- **Agent:** Antigravity
- **Summary of Changes:**
  - Updated all document `shortTitle`s in `frontend/app/data/documentTypes.ts` to use clearer, non-truncated abbreviations (e.g., "EVAL. HTE", "L.O.I.", "WAIVER", "PHOTO DOC.").
  - Removed CSS rules `text-overflow: ellipsis` and `overflow: hidden` from the table header in both screen and print CSS to ensure every column header is completely visible without truncation.
  - Added an "Abbreviations Legend" section below the checklist table (specifically scoped for print styling context but visible normally) that maps each short abbreviation back to its full `title`.
  - Added distinct, strong vertical borders (`2px solid #94a3b8`) between document phases (Before/During/After/Other) to make tracing rows easier across the landscape page.
  - Increased the vertical padding on table cells from `4px` to `6px` in `@media print` to provide more breathing room while still comfortably fitting on one landscape sheet.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-08 - Document Viewer in Student Panel & Checklist Refactor
- **Agent:** Antigravity
- **Summary of Changes:**
  - **AdminStudentPanel Refactor:** Converted the student detail panel from a right-aligned slide-out into a centered floating modal window. Features a max-width of 560px, 85vh max-height with internal scrolling, and a fade/scale entrance animation (`modalFadeScale`). Added keyboard support (Escape key to close) and preserved click-outside-to-close behavior, while ensuring inner modals (like the document preview) don't trigger outer closure. Fixed grammatical pluralization for the document accordion badge ("1 Doc" vs "2 Docs").
  - **Submitted Documents Viewer:** Added a "Submitted Documents" section to the `AdminStudentPanel` modal (used by prof/admin users) showing all uploaded documents.
  - Reorganized the "Submitted Documents" section into a Before/During/After/Other OJT accordion structure, matching the styling and logic used on the student profile page.
  - Integrated the `DocumentViewerModal` used in `DocumentReviewList` to allow inline previewing of these submitted documents (modal pop-up instead of new tab).
  - Verified and confirmed that the underlying API endpoint (`GET /api/admin/users/{user}`) natively loads all related documents and is strictly role-protected by Laravel middleware `->middleware('role:admin,prof')`, ensuring proper server-side access control.
  - **Checklist Row Removal:** Removed the leftmost `#` column (row number) from the OJT Submission Checklist (`frontend/app/admin/checklist/page.tsx`).
  - Adjusted the print layout CSS (`width: 16%` for `cl-th-name`) to compensate for the removed column.
  - **Checklist Readability (Screen):**
    - Removed `maxWidth` clipping on table headers and utilized existing abbreviations (`doc.shortTitle`) to prevent awkward truncation.
    - Added horizontal sticky-scrolling for the first three columns ("Student", "Company", "Progress"), ensuring identity remains visible while scrolling horizontally across the dense document columns.
    - Redesigned status dots to be larger and highly visible (`border-radius: 50%`, `28px` diameter) mimicking standard admin dashboard status pips, and increased base font size across the table.
    - Converted the "Abbreviations Legend" at the bottom of the screen to a card-based collapsible accordion (collapsed by default), reducing visual clutter.
  - **Checklist Print Layout Fix:**
    - Adjusted print CSS to shrink the new status dots down to 13px specifically for `@media print` (`.cl-dot`).
    - Tightened `th` and `td` padding to `4px 1px` and bumped font sizes down slightly (`6pt` for `th`) to ensure the full list of abbreviations perfectly fit horizontally without overlapping or getting clipped.
    - Replaced text-based status characters (`✓`, `✗`, `⏳`) with robust explicit SVG icons (`StatusIconSVG`) inside the `STATUS_CFG` to prevent them from rendering as generic fallback "info" icons in print output. Verified the page CSS only uses standard `@page { size: landscape; }` without forced manual rotation, so print logic dictates natural layout.
  - **Student Detail Modal Tweaks:** 
    - Increased `maxHeight` to `90vh` and stripped out the visible scrollbar using native CSS (`::-webkit-scrollbar { display: none; }` and `scrollbar-width: none;`) to make the UI look like a seamless unbroken panel even if slight scrolling is needed.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-08 - Profile Avatar Upload Feature
- **Agent:** Antigravity
- **Summary of Changes:**
  - Audited the entire codebase again to verify the "X DOCS" badges are truly gone. The `{count} DOCS` badges were scrubbed in a previous commit, and there is no duplicate component rendering them. If they appear, a hard refresh or server restart might be needed.
  - Implemented profile picture uploads:
    - Added a `profile_picture` column to the `users` table via a new backend migration and updated the `User` model's `$fillable` array.
    - Added `POST /api/profile/picture` and `DELETE /api/profile/picture` endpoints in `AuthController` to handle multipart/form-data image uploads with 5MB validation.
    - Created an interactive clickable avatar area in the "Edit Profile" state of `profile/page.tsx` that replaces the initials with a file picker overlay.
    - Updated `AppNavbar.tsx` and the `RoleContext` to globally distribute the `profile_picture` URL so the user's avatar reflects across the top navigation bar and dashboard.
    - Implemented a "Remove Photo" button for users to revert to their initials.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-08 - Optional Documents, Ongoing Status, & Print Scale Fix
- **Agent:** Antigravity
- **Summary of Changes:**
  - Audited the codebase to confirm "X DOCS" category badges were fully scrubbed.
  - Made the "Overtime Agreement" optional: updated `documentTypes.ts` with a `required: false` flag and updated the global `TOTAL_REQUIRED_DOCS` to 17. Modified Checklist logic to ignore optional documents when checking completeness and calculating the fraction (`submitted/17`).
  - Implemented an "Ongoing" (blue) overall status badge in `StatusBadge.tsx` and applied it to the overall Hours Rendered status in `profile/page.tsx` for students with `< 300` hours.
  - Improved the Admin Checklist print layout by enforcing `transform: scale(0.78)`, `width: 128%`, and `white-space: nowrap` within `@media print` to guarantee the 18 columns fit one landscape page perfectly without letter-stacking. Appended an italicized "(Optional)" modifier to the Overtime Agreement print header.
- **Branch:** `feature/profile-accordion-and-merge`
### 2026-08-08 - UI Fixes & Backend Route Debugging
- **Agent:** Antigravity
- **Summary of Changes:**
  - Removed the `[X] DOCS` pill badge from the Required Documents accordion headers in `profile/page.tsx`.
  - Added robust `@media print` CSS to `checklist/page.tsx` to force landscape printing, allow the 18-column table to fit and wrap gracefully, and hide non-essential UI chrome.
  - Synchronized the `profile/page.tsx` outer container margins and max-width directly with the Companies page (`page.tsx`) to eliminate jumpiness when navigating between pages.
  - Diagnosed alternating `500` and `404` errors on `/api/deployments/mine` as an artifact of Laravel Octane loading stale routes in memory; advised user to run `docker compose restart backend` and `php artisan migrate`.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-08 - Accordion UI & Grid Restrictions
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Improved error logging in `page.tsx` for the `/deployments/mine` endpoint to print full status, message, and error payloads instead of an empty `{}` object.
  - Replaced the `auto-fill` CSS grid on the Required Documents upload section with a strict `.upload-grid` class that maxes out at 3 columns and steps down to 2 and 1 on smaller breakpoints.
  - Restyled the `.accordion-header` and `.accordion-chevron` to exactly mimic the visual styling of `HeroCompanyRow` (padding, 180deg chevrons, number circles, gradient active state, and doc count pill).
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Mobile Responsiveness Audit
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Hid the `OJT E-Portfolio` text and student name/role labels in `AppNavbar` below 768px to resolve horizontal overflow on narrow screens (e.g. iPhone).
  - Updated the upload grid in `page.tsx` from a hard `380px` minimum to `min(100%, 350px)` to allow graceful 1-column wrapping on mobile.
  - Verified that the Profile Bar vertically stacks and Submission History scrolls horizontally as intended.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Tighten Upload Box Padding
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Reduced vertical padding on the empty `.pdf-upload-box` state to `16px 0`.
  - Tightened the top margin on the "Drag PDF" text to `0.5rem`.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Revert Submission History Accordion
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Reverted Submission History back to the original flat table layout.
  - Restored the "Category" column.
  - Removed unused accordion state variables while leaving the Required Documents accordions fully intact.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Relocate Edit Profile Button
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Moved the "Edit Profile" button out of the hours-rendered block and anchored it to the top-right of the student information block.
  - Kept the 65/35 flex layout and the "NOT SUBMITTED" badge completely intact on the hours side.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Profile Rebalance & History Accordion
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Adjusted Profile Bar layout from equal spacing to a strict `flex: 65` (Student Info) vs `flex: 35` (Hours) split.
  - Refactored the flat Submission History table into categorized accordion sections (Before OJT, During OJT, etc.) with record counts in the headers.
  - Set Submission History to default to collapsed, removed the redundant "Category" column, and applied the exact hover/accent states from the Required Documents accordion.
- **Branch:** `feature/profile-accordion-and-merge`
### 2026-08-07 - Strict Scaling Constraints & Bug Fix
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Fixed scrollbar bug on rejected document cards by replacing `height: 110px` with `padding: 16px`.
  - Hardcoded "0.00" hours number to exactly `28px` `fontWeight: 800`.
  - Hardcoded "Test Student" name to exactly `20px` `fontWeight: 700`.
  - Hardcoded global card padding to `16px` across Profile Bar, Required Docs, and Submission History (bypassing OJT Deployment).
  - Hardcoded "Required Documents" and "Submission History" headers to `16px` `fontWeight: 700`.
  - Tightened empty document upload inner height by using `padding: 20px 0`.
- **Branch:** `feature/profile-accordion-and-merge`
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Reduced oversized fonts: "0.00 / 300 hrs" down to `clamp(1.4rem, 3vw, 1.8rem)`, "Test Student" name down to `clamp(1.1rem, 2.5vw, 1.3rem)`.
  - Tightened card paddings globally to `20px` (avoiding OJT Deployment which relies on `.ui-card`'s default `24px`).
  - Reduced "Required Documents" and "Submission History" headers to `clamp(1.1rem, 2.5vw, 1.3rem)`.
  - Compacted document upload box heights from `140px` to `110px`.
  - Verified that accordion interactive states map properly to all OJT rows.
- **Branch:** `feature/profile-accordion-and-merge`
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Standardized 32px vertical rhythm between major sections and synced card padding to 24px.
  - Added hover/open states to accordion headers and smoothed chevron animation.
  - Refined styling of rejected-state document buttons and muted empty/fallback dash strings outside OJT Deployment card.
  - Preserved OJT Deployment card's internal layout and component usage perfectly.
- **Branch:** `feature/profile-accordion-and-merge`

### 2026-08-07 - Profile Accordion & Header Redesign
- **Agent:** Antigravity
- **Summary of Changes:** 
  - Converted the Required Documents category tabs to an accordion UI.
  - Re-structured the top of the profile layout by merging the Student Information and Hours Rendered cards into a single responsive top bar.
  - Removed the `responsive-grid-2` wrapper so the OJT Deployment card is now full width.
  - Adjusted margins for tighter vertical flow between main page sections.
- **Branch:** `feature/profile-accordion-and-merge`
