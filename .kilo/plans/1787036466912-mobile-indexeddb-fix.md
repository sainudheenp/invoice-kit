# Mobile IndexedDB Data Loss Fix

## Root Cause
In `src/store/AppContext.tsx` (lines 199-208), when `db.open()` throws a `VersionError`, the app **unconditionally deletes the entire `DocGenDB` database** and resets all React state. There is no warning, backup, or recovery.

Mobile-specific triggers:
- PWA auto-update via service worker upgrades the IndexedDB schema, then user rolls back to older app version
- Mobile browsers are more aggressive about storage pressure and SW cache mismatches
- `skipWaiting()` + `clients.claim()` in `public/sw.js` activates new SW immediately, serving a shell that may expect a newer schema

## Plan

### 1. Stop Destructive `VersionError` Recovery
**File:** `src/store/AppContext.tsx` (lines 199-208)

Replace the `VersionError` catch block. Do **not** call `db.delete()`.

Instead:
- Attempt to open with `lowerVersion` if Dexie supports it in this version, OR
- Show a persistent DB error screen: "Data version mismatch. Please update the app."
- Clear React state to a safe empty state, but **do not delete IndexedDB**
- Log the error for diagnostics

### 2. Add Migration Safety Net
**File:** `src/db/index.ts`

- Add a `dataVersion` key-value table (or use Dexie's built-in `_version` metadata)
- On app startup, if the stored data version is newer than the app expects, refuse to open and show the version mismatch error instead of deleting

### 3. Remove Destructive `resetAll()` Reload
**File:** `src/pages/Settings.tsx` (lines 357-363)

- Keep the manual reset (it is gated behind typing the company name), but **remove** `window.location.reload()`
- Use React state transitions to show the WelcomeOverlay instead
- This prevents reload-induced SW/network issues on mobile

### 4. Harden Service Worker
**File:** `public/sw.js`

- Remove `skipWaiting()` from `install` event
- Remove `clients.claim()` from `activate` event
- Let the new SW activate only when all clients are closed (default behavior)
- This prevents a new SW from activating while the user is actively using the app with an older schema

### 5. Add Persistent Onboarding Flag
**File:** `src/store/AppContext.tsx` and `src/App.tsx`

- Store a flag `onboardingComplete = true` in IndexedDB (e.g., in a `meta` table or as part of the companies table)
- When deciding to show `WelcomeOverlay`, check this flag first
- If the flag exists but `companies.length === 0`, show a "Data unavailable" recovery screen instead of the full welcome flow

### 6. Add DB Backup Prompt Before Destructive Actions
**File:** `src/pages/Settings.tsx`

- Before manual reset, prompt user to export backup
- Offer a recovery path if they have a backup

## Files to Modify
1. `src/store/AppContext.tsx` — safe version mismatch handling, onboarding flag
2. `src/db/index.ts` — data version tracking
3. `src/pages/Settings.tsx` — remove reload, add backup prompt
4. `public/sw.js` — remove aggressive SW activation
5. `src/App.tsx` — onboarding flag check

## Validation
- Simulate `VersionError` by manually bumping IndexedDB version in DevTools → verify app shows error screen without deleting data
- Install as PWA on mobile, update app, verify old data remains accessible
- Test manual reset flow → verify no page reload, stays in app
- Verify `resetAll()` still works when explicitly triggered from Settings
