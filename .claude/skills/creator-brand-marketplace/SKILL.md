---
name: creator-brand-marketplace
description: Product intelligence for CollabKaro, the India-focused creator × brand marketplace in this repo. Use whenever adding or changing any page, component, copy, campaign/creator/brand feature, workflow, pricing, trust signal, analytics, messaging, payments, or compliance-related UI in this project — or when asked to evaluate, prioritise, or plan marketplace features. Enforces the existing design system, two-sided (creator + brand + operator) evaluation, honest demo-vs-real claims, Indian compliance awareness, and the project's QA bar.
---

# Creator–Brand Marketplace Product Intelligence

You are working on **CollabKaro**: a Next.js 16 frontend prototype of an Indian creator × brand marketplace. All data is fictional, auth is mocked, and nothing touches money, email, or real social accounts. Act as neutral middleware: every change must make the marketplace more useful, trustworthy, fair, and sustainable for **both** creators and brands.

## Non-negotiables

1. **Read before you write.** Read `AGENTS.md` and the relevant guide in `node_modules/next/dist/docs/` before any Next.js API work. This Next version differs from training data.
2. **The existing UI is the design source of truth.** Reuse the tokens, classes, and components in [references/design-system.md](references/design-system.md). Do not add fonts, colours, gradients, icon sets, CSS frameworks, or dependencies without a stated reason.
3. **Claims must match the implementation.** Nothing may imply that payments, escrow, verification, social sync, email, moderation, or analytics are live. Label sample data as sample data. Never invent statistics, testimonials, customer names, or competitor capabilities. See "Honesty rules" in [references/content-guidelines.md](references/content-guidelines.md).
4. **Trust signals must be data-driven.** Verified badges, "pays on time", ratings, and eligibility ticks render from the underlying field. They must never be hard-coded on.
5. **Scope data to the viewer.** A creator sees only their own applications. A brand sees only applicants to its own campaigns. Contact details stay masked until hire (`maskContact`).
6. **No dark patterns.** No fake urgency, misleading counters, hidden fees, pre-ticked consent, or confirm-shaming.
7. **Smallest effective change.** No unrelated refactors. Preserve existing behaviour and tests.

## Workflow (run every time)

1. **Understand.** Read the route in `components/router.tsx`, the component, its types (`types/index.ts`), data (`data/index.ts`), and store (`lib/store.ts`). See [references/architecture.md](references/architecture.md).
2. **Identify.** State the user problem and business objective in one line each.
3. **Evaluate.** Check the change against the creator, brand, and operator perspectives and the five questions in [references/marketplace-evaluation.md](references/marketplace-evaluation.md).
4. **Research (when needed).** For market claims, platform policy, or Indian regulation, use recent primary sources first. Read [references/compliance-india.md](references/compliance-india.md) before touching disclosure, finance-niche, barter, payments, or personal-data flows.
5. **Prioritise.** Score user value, trust, business impact, complexity, and risk. Check [references/roadmap.md](references/roadmap.md) for existing priorities.
6. **Plan.** For simple, low-risk work, proceed directly. **Stop and present a plan first** for anything architectural, financial (fees, payouts, escrow), legal or policy copy, auth/permissions, data-model changes that break persisted state (`collabkaro-demo-v1`), or removals of existing features.
7. **Implement.** Use existing classes and components, and follow the copy voice.
8. **Validate.** Run the checks in [references/qa-checklist.md](references/qa-checklist.md).
9. **Report.** Cover what changed and why, the files touched, checks run with their results, what stayed a demo or placeholder, and open risks. Update `references/roadmap.md` if priorities moved.

## Definition of done

- [ ] Uses existing tokens, classes, fonts, Lucide icons. Works in light/dark and at 375px with no horizontal overflow.
- [ ] Solves a stated problem and has been considered from both the creator and the brand side.
- [ ] Every claim, badge, and metric is backed by data or labelled as sample/demo/illustrative.
- [ ] Viewer-scoped data, masked contacts, and role gating are respected.
- [ ] Loading, empty, error, and success states exist where relevant.
- [ ] Accessible: labelled controls, keyboard reachable, `aria-pressed`/`aria-label` where needed, motion respects reduced-motion.
- [ ] `npm run typecheck` and `npm run lint` pass. Relevant Playwright tests pass or are added.
- [ ] Assumptions, limitations, and items for legal review are written down.

## Reference files (load only what the task needs)

| File | Read when |
|---|---|
| [references/design-system.md](references/design-system.md) | Any UI or CSS work |
| [references/architecture.md](references/architecture.md) | Any code change, new route, data or store change |
| [references/marketplace-evaluation.md](references/marketplace-evaluation.md) | New features and prioritisation, or any work on matching, workflow, payments, trust, briefs, portfolio, messaging, notifications, or operator BI |
| [references/content-guidelines.md](references/content-guidelines.md) | Any user-facing copy |
| [references/compliance-india.md](references/compliance-india.md) | Disclosure, finance/health niches, barter, payments/tax, personal data, contracts, moderation |
| [references/qa-checklist.md](references/qa-checklist.md) | Before reporting done |
| [references/roadmap.md](references/roadmap.md) | Choosing what to build next; record new findings here |

**Final test for every change:** does this make the marketplace more useful, trustworthy, fair, commercially sustainable, and easier for creators and brands to collaborate through? If not, reconsider.
