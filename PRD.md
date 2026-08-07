# Taksim — Product Requirements Document (PRD)

**Document owner:** Product & Engineering
**Status:** v1.0 — MVP scope
**Platform order:** Android (Google Play Store) first → iOS (App Store) second
**Last updated:** 2026-08-07

---

## 1. Summary

Taksim ("division/split" in Arabic/Turkish) is a bilingual (English/Arabic) mobile app for splitting bills and contributions. It serves two distinct use cases in one app:

1. **Family Gatherings** — a contribution-reconciliation tool where multiple families each contribute money toward a shared event/expense, and the app calculates a fair per-person share and tells each family whether they should receive money back or pay more, and to/from whom.
2. **Friends** — a conventional expense-splitting tool (Splitwise-style) for groups of friends who share day-to-day expenses.

The app must support English and Arabic (including right-to-left layout), and allow users to start using it instantly via **Guest Login**, or create a persistent account via **Email authentication**.

---

## 2. Goals

- Let a group of families reconcile uneven contributions to a shared event fairly and transparently.
- Let friend groups split everyday shared expenses the way any modern bill-splitting app does.
- Support Arabic and English from day one, with correct RTL mirroring for Arabic.
- Zero-friction entry: no mandatory sign-up (guest mode), but persistent accounts available via email.
- Ship Android first; architect the app so iOS requires no rewrite (only build/release configuration).

## 3. Non-Goals (v1)

- No real money movement / payment gateway integration (the app calculates and displays who owes whom; it does not transfer funds).
- No multi-currency conversion (a single currency is selected per session; default SAR).
- No social login (Google/Apple/Facebook) in v1 — email + guest only.
- No push notifications in v1.
- No server-side multi-device sync in v1 for guest users (guest data is device-local). Email accounts may sync in a later version.

---

## 4. Target Users

- Families who pool money for gatherings (weddings, Eid, reunions, trips) where each family unit contributes an uneven amount and has an uneven number of members who should share the cost.
- Friend groups splitting shared expenses (trips, dinners, shared rent/utilities, outings).

## 5. Platforms & Tech

| Layer | Choice | Notes |
|---|---|---|
| App framework | React Native (Expo, managed workflow) | Chosen because the target build machine has Node.js and Android SDK/Android Studio already installed, but no Flutter/Dart SDK. Expo allows a single codebase to ship to Android now and iOS later via EAS Build with no rewrite. |
| Navigation | React Navigation (native-stack) | |
| State management | Zustand + AsyncStorage persistence | Local-first; works fully offline for guests. |
| Auth | Firebase Authentication (Email/Password + Anonymous) | Anonymous auth = "Guest login". Requires the developer to attach their own Firebase project config before shipping (see SETUP). |
| Localization | i18n-js + expo-localization, manual RTL toggle via `I18nManager` | English + Arabic string catalogs. |
| Target store (v1) | Google Play Store | iOS App Store planned as v1.1 using the same codebase. |

---

## 6. Functional Requirements

### 6.1 Localization
- FR-1: The app supports English and Arabic. Users can switch language from Settings at any time.
- FR-2: When Arabic is active, layout mirrors to RTL (text alignment, icon direction, navigation direction).
- FR-3: Default language follows the device locale on first launch; falls back to English if unsupported.

### 6.2 Authentication
- FR-4: Users can continue as a **Guest** with one tap. No credentials required. A local anonymous identity is created (Firebase anonymous auth) and data is stored on-device.
- FR-5: Users can **Sign Up** / **Sign In** with email + password (Firebase Email/Password auth).
- FR-6: Auth session persists across app restarts until the user explicitly logs out.
- FR-7: Users can log out from Settings, returning to the Login screen.

### 6.3 Home / Mode Selection
- FR-8: After login, the Home screen presents exactly two primary options: **Family Gathering** and **Friends**.
- FR-9: Home screen exposes language switcher and access to Settings/Logout.

### 6.4 Family Gathering Mode
- FR-10: A user can add up to **10 families** total per event/session.
- FR-11: Each family entry captures exactly three fields:
  1. Family name (text, required, unique within the list)
  2. Total contribution / amount spent (numeric, ≥ 0)
  3. Number of family members eligible for division of the total expense (integer, ≥ 1)
- FR-12: Users can edit or remove a family entry before calculating.
- FR-13: A **"Calculate Each Share"** action computes results once at least 2 families are present.
- FR-14: Calculation logic:
  - `grandTotal = Σ(family.contribution)`
  - `totalEligibleMembers = Σ(family.eligibleMembers)`
  - `perPersonShare = grandTotal / totalEligibleMembers`
  - For each family: `fairShare = perPersonShare × family.eligibleMembers`
  - `balance = family.contribution − fairShare`
    - `balance > 0` → family **overpaid**; should **receive** `balance` (credit)
    - `balance < 0` → family **underpaid**; should **pay** `|balance|` (debit)
- FR-15: The app presents a **settlement plan**: a minimal list of transactions ("Family B pays Family A 50 SAR") derived from the credit/debit balances via a debt-simplification algorithm (greedy largest-creditor/largest-debtor matching), not merely a raw balance list — this avoids families needing to figure out netting manually.
- FR-16: Worked example (used as an acceptance test):
  - Family A: contribution 200, eligible members 3
  - Family B: contribution 300, eligible members 7
  - grandTotal = 500, totalEligibleMembers = 10, perPersonShare = 50
  - Family A fair share = 150 → balance = +50 (receives 50)
  - Family B fair share = 350 → balance = −50 (pays 50)
  - Settlement output: **"Family A receives 50 SAR from Family B"**

### 6.5 Friends Mode (standard bill-splitting)
- FR-17: Users can create/manage a list of friends/participants (name-based, local to the session/group).
- FR-18: Users can add an expense with: description, amount, who paid, and how it's split:
  - Equally among selected participants (default), or
  - Custom exact amounts per participant.
- FR-19: Users can edit or delete an existing expense.
- FR-20: The app maintains a running net balance per participant (what they are owed / what they owe).
- FR-21: The app produces a simplified settlement plan ("X pays Y amount") using the same debt-simplification algorithm as Family Gathering mode.
- FR-22: Users can view expense history for the group.

### 6.6 Data & Persistence
- FR-23: All group/expense/family data persists locally on-device (AsyncStorage) across app restarts.
- FR-24: Guest data is scoped to the device; signing in with email does not currently migrate guest data (documented limitation for v1).

---

## 7. Non-Functional Requirements

- NFR-1: App must run on Android 8.0 (API 26)+ devices.
- NFR-2: Cold start under 3s on a mid-range Android device.
- NFR-3: All user-facing strings are externalized to translation files (no hard-coded UI text).
- NFR-4: Numeric inputs must be validated (no negative amounts, no zero eligible-members divisor).
- NFR-5: Codebase must remain platform-agnostic (no Android-only native modules) so iOS can be built from the same source in v1.1.

---

## 8. Information Architecture / Screen List

1. Splash / Auth check
2. Login (Guest / Email sign-in / Sign-up)
3. Home (Family Gathering | Friends)
4. Family Gathering — list & add/edit family (max 10)
5. Family Gathering — results & settlement plan
6. Friends — manage participants
7. Friends — add/edit expense
8. Friends — balances & settlement plan
9. Settings — language switch, currency, logout

---

## 9. Success Metrics (post-launch)

- % of sessions that reach a completed calculation (Family) or a settlement view (Friends).
- Guest-to-email conversion rate.
- Arabic vs English usage split (validates localization investment).
- Crash-free session rate ≥ 99.5%.

---

## 10. Milestones

| Phase | Scope |
|---|---|
| M1 (this build) | Android MVP: guest+email auth, EN/AR, Family Gathering flow, Friends flow, local persistence |
| M2 | Play Store closed testing, bug fixes, polish |
| M3 | Play Store public release |
| M4 | iOS build via EAS Build, App Store submission (same codebase) |
| M5 (future) | Cloud sync of guest→email data, push notifications, multi-currency conversion, payment integration |

---

## 11. Open Questions / Assumptions

- Default currency assumed **SAR**; a currency selector is included for extensibility but conversion between currencies is out of scope.
- "Eligible members" for Family Gathering is entered manually per family (not derived from a member roster), per the original requirement.
- Firebase project credentials are not included in the repo; they must be supplied by whoever deploys the app (see `README.md`).
