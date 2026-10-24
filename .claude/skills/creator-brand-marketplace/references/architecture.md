# Architecture and conventions (as implemented)

Inspected 12 Oct 2026. Verify against the code before relying on this.

## Stack

Next.js **16.3.8** (App Router; `next build --webpack`; dev uses Turbopack), React 19, TypeScript 6 strict, Zustand 5 (persist), React Hook Form + Zod 4 (`z.email()`, `z.url()` top-level APIs), Radix Dialog/Tabs, cmdk, dnd-kit, Recharts 3, motion 14, sonner, next-themes. Path alias `@/*`. **Read `node_modules/next/dist/docs/` before using Next APIs.** `params` is a `Promise` in pages and `generateMetadata`.

## Routing: one catch-all

- `app/[[...path]]/page.tsx` is the only page. It owns `generateStaticParams` (the `staticRoutes` list plus every campaign/creator/poster slug), `generateMetadata`, the `known` first-segment allowlist (anything else → `notFound()`), and JSON-LD on `/`.
- `components/router.tsx` (`"use client"`) maps `path[]` to components. Most are `next/dynamic` imports, all inside `<Suspense>` with a `.skeleton-card` fallback. Unknown sub-routes render `<Empty>`.
- **Adding a page** means: (1) add the component, (2) add a branch in `PageRouter`, (3) add the first segment to `known` if it's new, (4) add the path to `staticRoutes` for static generation, (5) add it to `app/sitemap.ts` if it's public.
- Workspace chrome is decided in `components/shell.tsx`: paths starting `/c/` or `/a/`, plus `/messages`, `/notifications`, `/settings`, and `/admin`, get the sidebar + bottom nav. Creator nav and brand nav arrays live there.

## Route map

Public: `/`, `/campaigns`, `/campaigns/[slug]`, `/creator/[username]`, `/agency/[slug]`, `/creators`, `/brands`, `/agencies`, `/pricing`, `/about`, `/contact`, `/blog(/a-better-creator-pitch)`, `/terms`, `/privacy`, `/tools/{engagement,rate-estimator,brief-template}`.
Auth (mock): `/login`, `/signup`, `/role-select`, `/otp` (code `123456`), `/forgot-password`, `/onboarding`, `/a/onboarding`.
Creator: `/c/dashboard`, `/c/applications`, `/c/saved`, `/c/work(/[campaignId])`, `/c/profile`.
Brand: `/a/dashboard`, `/a/payments`, `/a/campaigns`, `/a/campaigns/new(?edit=id)`, `/a/campaigns/[id]/applicants` (kanban), `/a/discover`, `/a/lists`, `/a/settings`.
Shared: `/messages(?thread=id)`, `/notifications`, `/settings`, `/admin` (Admin role only).

## Data and state

- `types/index.ts` defines the domain: `Role` (`Guest | Creator | Brand-Agency | Admin`), application `Status` (`Applied → Viewed → Shortlisted → Hired | Rejected | Withdrawn`), `Creator`, `Poster` (brand/agency, with `verified`, `onTime`, `response`, `rating`), `Campaign` (`type: Paid | Barter | Affiliate`, `min/max`, `deliverables[]`, `usage`, `status: Live | Draft | Paused | Closed`), `Application`, `Conversation`, `Message`, `Notice`.
- `data/index.ts` holds deterministic fictional seeds: 36 creators, 14 posters, 40 campaigns, 4 applications, 2 conversations, and 3 notices. `verified` is false for some records (creators where `i%4===3`; posters Roam Local and LearnLoop), so **UI must honour the flag**.
- `lib/api.ts` is the **data-access boundary**. UI imports data from here, not from `@/data`. Its async `api.*` functions are meant to become authenticated fetches. `mergeCampaigns(local)` overlays store-created campaigns on the seeds. Always use it when listing campaigns, so that user-posted ones appear.
- `lib/store.ts` is a Zustand store persisted to localStorage key **`collabkaro-demo-v1`**. It holds `role`, `saved`, `shortlist`, `applications`, `campaigns` (user-created only), `conversations`, `notifications`, `profile` (string map), and `plan`. Mutations: `apply` (dedupes non-withdrawn), `setStatus` (also notifies), `post`, `campaignStatus`, `send`, `startChat`, `markRead`, `updateProfile`, `setPlan`, `notify`.
  - Changing the shape of persisted fields can break returning users. Add `version` + `migrate` to `persist`, or bump the key, and say so in the report.
- Campaigns may carry `platforms[]` (with `platform` = first, used by filters/older data), structured `deliverables[]` (`platform`/`format`/`duration`, `type` always set as the human label), and `usageRights[]` (kind, days, who pays). `usage` stays a one-line summary. Catalogues and label helpers live in `lib/campaign-options.ts`; the builder's step 2 is `components/campaign-deliverables.tsx`. All fields are optional, so older persisted campaigns still load.
- Budgets & deals: paid campaigns carry `totalBudget` + `tiers[]` (fee range per follower tier); `min/max` are derived from tiers. Hiring opens a deal (`store.deals`: fee, usage fees, milestones, brand/creator typed signatures). Helpers in `lib/budget.ts`, contract text in `lib/contract.ts` (draft template, needs legal review), UI in `components/deals.tsx` (DealDialog, ContractDialog, PaymentDialog, BudgetPanel on the applicant board, `/a/payments`, CreatorDeal on `/c/work/[id]`). Payments are records only.
- Chat: messages may carry `voice` (MediaRecorder data URL) or `call` (scheduled invite with status); UI in `components/chat-extras.tsx`. Simulated partner auto-accepts call invites.
- Media kit: `Creator.platforms[]` carry per-platform stats (engagement, avgViews, growth, audience, ages, gender, india); `ContentItem` has platform/format/duration/url; `PastCollab` has results/quote/`viaCollabKaro`. Helpers in `lib/creator-insights.ts` (insights, embedUrl for YouTube/Instagram, completedCollabs from signed + fully paid deals). The demo creator's own work and collabs live in `store.portfolio` / `store.pastCollabs` (editors in `components/profile-editors.tsx`).
- `lib/format.ts`: `formatINR` (en-IN, no decimals), `formatCount` (K / L / Cr), `timeAgo`, `maskContact(text, hired)` (masks emails and Indian mobiles until hired).

## Identity and backend mode (updated 2026-10-24)

- Two modes, switched by `NEXT_PUBLIC_API_URL` (`lib/backend.ts` → `backendEnabled`). **Demo mode** (unset): seeds + localStorage, the "Viewing as" bar, simulated chat replies; the Playwright suite runs here. **Backend mode**: the NestJS API in `../socialMediaNaukriBackend` (Postgres + Redis + Socket.IO), phone-OTP auth, server-enforced ownership/roles, nothing persisted locally.
- The current user's ids are `store.me.creatorId` / `store.me.posterId` (demo defaults `cr-1` / `po-1`). Use them and `creatorFor(store.me.creatorId)` from `lib/api.ts` — **never hard-code `cr-1`, `po-1` or `creators[0]` for "me"**.
- Every store mutation is mirrored to the API via `push()` in `lib/store.ts` (queued, in order; failure → toast + resync). A new mutation needs a matching `remote.*` call in `lib/backend.ts` and an endpoint in the backend. `notify()` is a no-op in backend mode (the server creates notifications).
- In backend mode `PageRouter` shows the skeleton until the live catalogue loads (keeps hydration consistent); `loadCatalog()` refills the shared arrays in place and bumps `store.catalogVersion`.
- `setRole` is ignored in backend mode; the role comes from the account.

## Patterns to follow

- Every component file is `"use client"`. Forms use RHF + `zodResolver` with human-readable error messages, and errors render as `<small className="error">`.
- Lists filter in render. Catalogue URLs sync their filters to the query string with `router.replace(..., { scroll: false })`.
- Mutations give feedback with a `toast` and, where meaningful, `s.notify(title, body, href)`.
- Destructive or irreversible actions (withdraw application) go through a `Dialog` confirmation.
- Fake latency: `Campaigns` shows skeletons for 450 ms. Don't add more artificial delays.

## What is mocked / not built (do not imply otherwise)

In backend mode, these are real: phone-OTP login (SMS delivery still dev-only), multi-user chat, persistence, uploads (local disk), server-side authorization and notifications. Everything below is still mocked in both modes unless noted.

Social account connection and verified metrics, payments, escrow, invoices (the sample invoice is a text file), file uploads (campaign cover/logo are resized in-browser to data URLs via `api.uploadImage` and kept in localStorage; other uploads keep only file names), email/SMS, multi-user chat (replies are simulated), moderation and reports (session-only), team invitations, admin actions (session-only), analytics (all charts are sample data), and video playback. Campaign timelines ("due 7 days after product delivery", "review within 3 business days") are **hard-coded copy, not campaign fields**.

## Tooling

`npm run typecheck`, `npm run lint` (zero warnings allowed), `npm run build`, and `npm test` (Playwright, Chromium). Tests expect a server on `:3000` that you start yourself. Prettier formats the code; run it on files you touch. The test "mobile routes fit the viewport and dark theme persists" **overwrites `docs/home-dark.png`**, so exclude it with `--grep-invert "dark theme persists"` unless you mean to refresh screenshots.
