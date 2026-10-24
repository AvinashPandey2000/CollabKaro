# CollabKaro

An India-focused creator × brand marketplace frontend built from the client’s **CreatorHub PRD** and **CollabKaro build prompt**. This phase is a local, interactive demonstration with static fictional data, not a live marketplace.

## Run

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use the **Viewing as** selector to explore Guest, Creator, Brand-Agency, and Admin experiences. Mock login accepts a valid email and any password of at least eight characters. OTP demo code: `123456`. No credentials are sent to a server.

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

Fonts are bundled locally; no Google Fonts request is needed at build time. Images use Next.js image optimization with remote Unsplash samples. Internet access is needed on the first request for uncached images.

## Backend mode (real API)

The API lives in `../socialMediaNaukriBackend` (NestJS + PostgreSQL + Redis); see its README for setup. Point the frontend at it:

```bash
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

With the variable set:

- Login is phone + OTP (`/login`, `/signup`). Locally the code is printed in the API log, and `123456` also works. Demo numbers: `9000000001` (creator Aanya Sharma), `9000000002` (brand Kurta Kraft), `9000000003` (admin).
- The **Viewing as** switcher is hidden. The role comes from the account.
- Campaigns, creators and brands load from the API. Applications, campaigns, deals, chat, notifications, saved/shortlist, profile and portfolio are saved to the database, and nothing is kept in localStorage.
- Chat is real between two accounts, with live updates over Socket.IO (no simulated replies). Images and voice notes upload to the API.

Unset `NEXT_PUBLIC_API_URL` to get the self-contained demo below. The Playwright tests run against the demo, so start the dev server without the variable for `npm test` (for example `NEXT_PUBLIC_API_URL= npm run dev`).

## Client review paths

- `/`: two-sided landing, search, opportunities, creator community, trust, FAQs.
- `/campaigns`: URL-synced filtering, sorting, saved state, empty/loading states.
- `/campaigns/festive-fashion-edit`: eligibility, transparency stats, validated application modal.
- `/creator/aanya.sharma`: media kit, content gallery, follower chart, audience insights, rate card.
- `/agency/kurta-kraft`: public campaign and payment track record, activity, reviews.
- `/c/dashboard`, `/c/applications`, `/c/saved`, `/c/work`, `/c/profile`: creator workspace.
- `/a/dashboard`, `/a/campaigns/new`, `/a/campaigns`, `/a/campaigns/ca-1/applicants`, `/a/discover`, `/a/lists`, `/a/settings`: brand workspace and applicant board.
- `/messages`, `/notifications`, `/settings`: shared features.
- `/login`, `/signup`, `/role-select`, `/otp`, `/forgot-password`, `/onboarding`, `/a/onboarding`: mocked account setup.
- `/creators`, `/brands`, `/pricing`, `/about`, `/contact`, `/blog`, `/terms`, `/privacy`: marketing and informational pages.
- `/tools/engagement`, `/tools/rate-estimator`, `/tools/brief-template`: working calculators and downloadable brief.
- `/admin`: verification/moderation preview. Select Admin first.

## Demo flows

**Creator:** select Creator → browse a campaign → apply with a pitch and quote → see status in My applications. Save a campaign to revisit it. Hired applications have a work area with a deliverable checklist and URL submission.

**Brand:** select Brand-Agency → post a campaign through the wizard → find it in My campaigns and public browsing → open applicants → drag cards or use status menus/bulk actions → contact creators. Discover supports filters, grid/list display, shortlisting, and comparison of up to three creators.

**Chat:** phone numbers and emails are masked before hire. The initial Glow Theory thread is shortlisted (masked); the BoltFit thread is hired (unmasked). Replies are simulated. Attachments display file names; files are not uploaded.

**Persistence:** Zustand stores role, campaigns, applications, messages, shortlist, profile changes, and notifications under `collabkaro-demo-v1` in localStorage. Reset by clearing this key in the browser. Team/admin preferences are session previews.

## Architecture and API integration

- `types/index.ts`: strict domain models.
- `data/index.ts`: 36 fictional creators, 14 posters, 40 campaigns, seeded applications/messages/notifications.
- `lib/api.ts`: data-access boundary. UI data imports pass through this module. In backend mode `loadCatalog()` refills the shared `campaigns`/`creators`/`posters` arrays from the API, and `uploadImage` uploads to it.
- `lib/backend.ts`: API client (access token in memory, refresh cookie, auto-refresh on 401), typed endpoints, and the Socket.IO connection.
- `lib/store.ts`: session and mutations. In backend mode each mutation updates the UI optimistically and then calls the API in order; failures show a toast and resync. `store.me` holds the creator/brand ids the user acts as (demo: `cr-1`/`po-1`).
- `components/backend-sync.tsx` / `components/backend-auth.tsx`: session restore, catalogue + state loading and realtime; phone-OTP auth screens.
- `lib/format.ts`: Indian number/currency formatting, relative dates, contact masking.
- `components/`: reusable marketing, cards, workspaces, forms, chart, chat, and Radix dialog components.
- `app/[[...path]]/page.tsx`: route resolution, per-page metadata and static generation for sample detail routes. Newly created demo campaigns resolve dynamically.
- `app/globals.css`: responsive semantic tokens, dark theme, reduced-motion support.
- `docs/research.md`: reference observations and decisions.

Replace the placeholder `collabkaro.example` domain in metadata, sitemap, robots, and company information before publishing. Deploy as a Next.js application on Vercel; no secrets are needed for this demo.

## Verification

Browser regression tests in `tests/flows.spec.ts` cover apply/tracking/persistence, posting and applicant status, chat masking/unmasking, filters/saves/tools/command search, mobile viewport containment, and theme persistence.

```bash
npx playwright install chromium
npm test
```

Start the app on port 3000 before running tests. See `docs/verification.md` for the final measured results.

## Production scope

Real OTP/Google authentication, database, social account sync, payments/escrow, file storage, email delivery, actual verification/moderation, multi-user chat, final legal documents, and server-enforced access are future integration work. Metrics, rates, reviews, plans, and companies in this prototype are samples. Video gallery items open image previews; real video URLs need an API/content connection. This prototype intentionally never sends email or processes money.
