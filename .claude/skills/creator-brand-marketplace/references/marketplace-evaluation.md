# Marketplace evaluation framework

Use this to decide **whether** to build something and **how far** to take it. CollabKaro is a frontend prototype at this stage. Prefer changes that improve clarity and trust in the existing flows over new surface area.

## The five questions (answer all, briefly, before building)

1. **Creator problem:** what does this fix for creators?
2. **Brand problem:** what does this fix for brands or agencies?
3. **Trust:** does it make the marketplace more transparent or safer, or does it add a signal that could mislead?
4. **Efficiency or conversion:** which step of discover → apply → hire → deliver → pay gets faster or more likely?
5. **Risk and cost:** what could go wrong (unfairness to small creators, false claims, legal exposure, persisted-state breakage, maintenance)?

If one side benefits at the other's direct expense (for example, exposing creator contact details before hire to help brands), stop and rethink it.

## Perspective checklists

**Creator.** Do they understand value, eligibility, budget, deliverables, deadline, usage rights, and payment terms *before* applying? Can they track every application and active collab? Are their creative freedom, content ownership, and payment interests protected? Are nano and regional creators visible?

**Brand.** Can they find and compare relevant creators beyond follower count? Can they post a clear brief quickly, review applicants, manage approvals, and see outcomes and spend? Are their reputation and usage rights protected?

**Operator.** Does the change support fair matching, moderation, disputes, and policy compliance? Is it measurable with data we actually have? Does it support a sustainable model (subscription plans exist today; no take-rate is implemented) without dark patterns?

## Prioritisation rubric

Score each item 1–3 on user value (both sides), trust, business impact, complexity (inverse), and risk (inverse). Build the highest totals first. **Trust-accuracy bugs (wrong badges, data leaks, false claims) always jump the queue.**

## Feature specs (evaluate against the current product, don't build everything)

### A. Smart campaign matching
- Inputs that exist today: niche, platform, city, language, followers, engagement, price, collabTypes (creator); niche, platform, city, language, min followers, budget (campaign).
- Show **why** something matched ("Matches your niche · Hindi · All India"), never an opaque score.
- Don't rank by follower count alone. Weight fit (niche/language/city) and engagement, and give emerging creators a fair path (for example, "open to new creators" campaigns).
- Unmet criteria read "Check with brand", not "Not eligible", unless the brand set a hard requirement.

### B. Collaboration workflow
- Current statuses: Applied → Viewed → Shortlisted → Hired / Rejected / Withdrawn, plus a Work page with a URL submission.
- Natural extension: Hired → Content submitted → Changes requested ↔ Resubmitted → Approved → Published → Paid. Add steps only when there is UI to act on them.
- Each state change needs an owner, a timestamp, a notification to the other party, and an entry in an activity log.

### C. Fair deal and payment protection
- Before hire, both sides should see: deliverables and quantity, fee or product value, payment schedule, content due date, number of revisions, usage-rights duration and paid-ads terms, exclusivity, and cancellation terms.
- The current data model has only `deliverables`, `min/max`, `usage`, and `deadline` (applications close). Revisions, due dates, and payment terms are **not** campaign fields yet.
- Escrow or milestone payments need a licensed payment partner and legal review. **Never claim payment protection until it is implemented.** Show platform fees transparently before commitment.

### D. Campaign analytics
- Always label values **Actual / Estimated / Projected / Self-reported / Sample**. All analytics today are Sample.
- Useful when real data exists: reach, impressions, engagement rate, clicks, conversions, cost per result, spend, delivery and approval timelines. ROI only with attribution data.

### E. Trust, verification, disputes
- Verification is a binary `verified` flag for creators and posters, approved through an Admin preview. Badges must reflect it.
- Report flows exist (messages, agency "Report this profile") but are session-only.
- Never label anyone fraudulent automatically. Use "Unusual activity, under review" language and human review.
- Disputes need an evidence trail: accepted terms, submissions, approvals, and messages.

### F. Campaign brief builder
- The 5-step wizard (`CreateCampaign` in `components/forms.tsx`) covers Basics, Deliverables, Budget, Eligibility, and Review. Gaps: objective, audience, content formats beyond reels/videos, a required disclosure line, revisions, due dates, exclusivity, and approval criteria.
- The `/tools/brief-template` page already uses sensible defaults (1 reel + 3 stories, 30-day organic usage, 3-day review). Reuse them as wizard defaults when extending it.

### G. Creator portfolio and reputation
- The media kit (`/creator/[username]`) has a gallery, growth chart, audience, rate card, past collaborations, and testimonials, all sample data.
- Prefer contextual signals ("12 collabs completed on CollabKaro · 2 revisions avg") over a single star score. Avoid permanent punitive ratings, and allow responses or appeals.

### H. Messaging and negotiation
- Exists: campaign-linked threads, contact masking until hire, attachments (name only), report/block (session).
- Next: structured offers (fee, deliverables, dates) as message cards with Accept / Counter. Accepting needs explicit confirmation and creates an immutable "accepted terms" record.

### I. Notifications
- `notify()` exists and the bell shows the latest 3. Notify on status changes, invitations, review requests, deadlines, and payment milestones. Batch low-value updates. Make email opt-in (the email toggle is currently a future integration).

### J. Operator BI
- Measurable only once a backend exists: sign-ups by side, profile completion, apply rate per campaign view, application→hire conversion, completion rate, repeat brands, time-to-first-response, dispute rate, payment delays, and liquidity (live campaigns per active creator in each niche/city). **Do not build dashboards on fabricated numbers.**
