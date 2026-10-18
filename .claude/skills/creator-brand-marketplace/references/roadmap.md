# Marketplace audit and roadmap

Living document. Started 12 Oct 2026 from a full read of the codebase. Move items to "Done" with a date and add new findings as you go.

## Done

- **2026-10-12 — Verification badges honour data.** Campaign detail (poster label and poster panel) and the agency profile no longer show a verified tick or "Verified partner" for unverified posters. Unverified posters show "Verification pending". (`components/marketplace.tsx`; test: "verification badges reflect…")
- **2026-10-12 — Dashboard activity scoped to the viewer.** The creator dashboard showed other creators' applications. It now shows only `cr-1`'s, and the brand dashboard shows applicants to `po-1` campaigns by creator name, with an empty state. (`components/workspace.tsx`; test: "dashboard activity only shows…")
- **2026-10-12 — Homepage track-record card derived from data.** Its hard-coded Social Sutra stats (82/246/4 hrs/98%/4.9 from 46, "agency") contradicted the profile page (122/354/7 hrs/94%/4.6 from 76, "Small business"). The card now reads from `posters`, and its review is labelled sample. (`components/home.tsx`; test: "homepage track-record card…")
- **2026-10-12 — Barter positioning decided: keep barter.** The hero now reads "PAID COLLABS. CLEAR BUDGETS." and the hero note is “What’s the budget?” Right on the brief. Barter stays in the catalogue, filters, and FAQ. (`components/home.tsx`)
- **2026-10-12 — Removed the hero star rating that had no rating behind it.** (`components/home.tsx`)
- **2026-10-12 — Money display depends on campaign type.** The new `campaignValue()` in `lib/format.ts` drives the card, detail panel, sticky bar, wizard review, and brand campaign list. Paid shows a range, Barter shows "Worth ₹max", and Affiliate shows "Up to ₹max (commission-based)".
- **2026-10-12 — Timelines labelled as platform defaults** on campaign detail and in `Work`. They are still not per-campaign fields (see P1-1).
- **2026-10-12 — "pays on time" on campaign detail labelled "Illustrative demo metric".**
- **2026-10-12 — Notifications scoped by role.** `Notice.audience` is optional, so persisted state stays compatible. `seesNotice()` in `lib/store.ts` filters the bell, `/notifications`, and `markRead`. A creator withdrawal now notifies the brand. Old persisted notices with no audience still show to every role.
- **2026-10-12 — Homepage "how it works" card depends on the side.** The creators view shows a brand track record (Social Sutra), and the brands view shows a creator track record (followers, engagement, brand collabs, turnaround, sample brand review) from `creators` data. The hero float's creator stats and verified tick are now data-driven too. Sample data was aligned so a creator's main platform follower count equals `followers`, and the profile page opens on the main platform. (`components/home.tsx`, `data/index.ts`, `components/profile.tsx`; test: "how-it-works card switches…")

- **2026-10-18 — Campaign builder made data-driven.** Gallery uploads (cover/logo via `api.uploadImage`), multi-platform deliverables, structured usage rights with duration and who pays, do's & don'ts, min engagement, searchable location with custom entry, "Campaign closing date".
- **2026-10-18 — Budgets, deals, contracts and payment records (partly covers P1-1 and P1-4).** Total budget + tier ranges, engagement-aware fee suggestion, per-hire deal with milestones, typed e-signature contract (draft template — **needs lawyer + CA review before real use**), payment ledger at `/a/payments`, creator deal view. Records only; no money moves.
- **2026-10-18 — Applicant board:** whole-card drag, click menu (profile, message, deal, move), consistent column names ("Not selected" replaces "Rejected" in the brand UI).
- **2026-10-18 — Chat:** voice notes and scheduled call invites (accept/decline/reschedule, .ics, join link). Phone calls only after hire. No in-app calling.

## Open from 2026-10-18

- Real payments (escrow/payouts via a gateway), PAN/GST capture and TDS need backend + CA review.
- Legally valid e-sign (Aadhaar eSign provider) needs backend; current signatures are demo only.
- Voice notes bypass contact masking; production needs moderation or transcription checks.
- Pipeline has no ownership check (any brand URL opens any campaign's applicants) — enforce on the server.

## P0: trust and accuracy

All items done (see above).

## P1: core middleware value (plan first; changes data model / persisted state)

1. **Deal terms at a glance (C + F).** Add optional `Campaign` fields: `contentDueDays`, `revisions`, `paymentTerms` (e.g. "50% on hire, 50% on approval", text only, no money movement), `exclusivityDays`, `paidUsage`, `disclosureLabel`. Extend the wizard's Deliverables and Budget steps with defaults from `/tools/brief-template`, and show a "Terms at a glance" panel on the detail page and in `Work`. Version the persisted store.
2. **Explainable match reasons (A).** Reuse the eligibility logic in `CampaignDetail` to show "Matches: niche · language · city" chips on `CampaignCard` for creators. Upgrade "Only campaigns I qualify for" to check niche, language, and city, not just followers. Add a "Fit" sort to `Discover` for brands (niche, language, engagement, rate within budget), with reasons shown and no follower-only ranking.
3. **Two-sided content review (B).** Persist content submissions in the store and add a brand-side review (Approve / Request changes with a note, counting against the revision limit). Add statuses Submitted → Changes requested → Approved → Published, plus an activity log per collaboration.
4. **Structured offers in chat (H).** Offer cards (fee, deliverables, due date) with Accept / Counter. Acceptance needs explicit confirmation and writes an immutable accepted-terms record shown in `Work`.
5. **Disclosure reminder (compliance).** In `Work`, before submitting, add a checklist item "Disclosure label visible in the content (e.g. #Ad / Paid partnership)". Add it to the brand review checklist too.

## P2: worthwhile, lower urgency

- Finance-niche guardrail: in the wizard, ask "Is your company SEBI-regulated?" and, if so, require an education-only scope or registered creators.
- Contextual creator reputation ("X collabs completed here, avg Y-day turnaround") alongside sample testimonials.
- Brand invitations from a creator profile should appear as an "Invited" state in creator applications.
- Persist admin verification approvals so they flip `verified` in the demo.
- Regional-language discovery: a language-first filter chip row on `/campaigns` and `/a/discover`, which fits current market demand for vernacular creators.
- Add `version` + `migrate` to the Zustand persist config before any P1 data-model change.

## P3: production foundations (not frontend work; needs backend and legal)

Real auth with server-side role and ownership enforcement, a database, social API verification of metrics, a licensed payment partner (escrow or milestones, TDS/GST handling, invoices), email and notification delivery, file storage, a moderation console with audit logs, DPDP-compliant consent, deletion, and retention, and age-gating for minors. Operator BI (conversion, liquidity, dispute rate) becomes possible only after this work.
