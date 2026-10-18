# Content and voice

## The existing CollabKaro voice (match it)

- **Warm, short, confident.** Headlines are punchy fragments ending in a full stop: "Find your kind of collab.", "Your collab journey.", "Big ideas start here."
- **Light Hinglish, used sparingly** as a signature, not in every line: "Collab karo. Grow karo.", "Creators aur brands, ek jagah.", "Abhi koi match nahi mila." Keep instructions, terms, errors, and legal copy in plain English.
- **Eyebrows in ALL CAPS**, short and benefit-led: "OPPORTUNITIES, WITH YOUR NAME ON THEM".
- **Second person**, creator-respectful ("your creativity has value"), and brand-respectful ("authentic voices", not "influencers to use").
- Curly quotes and apostrophes (’ “ ”) in JSX copy, matching the existing strings. Use `₹` with `formatINR` and Indian units (K / L / Cr) with `formatCount`.

## Writing rules

1. Know the reader (creator, brand, or both) and the one action you want them to take.
2. Lead with the concrete benefit or fact. Name the specific thing: budget, deliverables, deadline, usage, eligibility.
   - Instead of "Manage campaigns easily", write "Review applicants, move them through your pipeline, and message shortlisted creators."
   - Instead of "Find the best influencers", write "Filter creators by niche, city, language, engagement, and rate."
3. Buttons are verb-first and specific ("Apply to this campaign", "Post a campaign", "Save for later"). Most CTAs carry an `ArrowUpRight` icon.
4. Empty states have a friendly title, one line of help, and one action (`<Empty>`).
5. Errors say what to fix ("Write at least 40 characters so the brand can understand your idea.").
6. Avoid filler and generic AI phrasing: "seamless", "revolutionize", "unlock your potential", "in today's fast-paced world", "leverage", "elevate", stacked adjectives, or the same sentence rhythm three times in a row.
7. Keep copy scannable: one idea per sentence, and paragraphs of about two lines in panels.

## Honesty rules (strict)

- This is a **demo with fictional data**. Wherever a number, review, testimonial, company, or case study appears, it must be labelled ("Sample data", "Illustrative", "Demo testimonial", "Sample reviews"). Follow the existing labels.
- Don't describe a capability as live unless it works end to end. Use "(demo)" or "future integration" for mocked items such as payments, escrow, OTP, social sync, email, uploads, moderation, and team invites.
- No invented statistics, market sizes, user counts, guarantees, or "trusted by X brands". Community counts must equal real data counts (as `CommunityStats` does: 36 / 40 / 14).
- Trust words ("Verified", "Pays on time", "Trusted") must be backed by a field. Don't hard-code them.
- **Positioning copy must match the catalogue.** For example, don't promise "no barter" while barter campaigns, filters, and FAQs exist. Resolve such contradictions in the product or the copy, consistently, across the whole site.
- No fake urgency ("Only 2 spots left!" without data), no countdowns, and no pre-ticked consents.

## Market-claim research standard

- For time-sensitive claims (market size, pricing benchmarks, platform policies, regulations), use primary or recent sources and cite them in `docs/research.md`, with the date checked.
- Treat vendor reports (agencies, influencer platforms) as directional. Say so, and don't put their numbers in UI copy as fact.
- Recommend trends only when they fit this product and stage. Current India-relevant signals (checked Oct 2026, vendor-sourced): nano/micro creators dominate performance-led budgets, demand for regional-language creators is rising, Tier-2/3 audiences are engaging, and performance accountability is growing but uneven. These support regional-language discovery, fair visibility for small creators, and clear outcome labelling. They don't justify fabricated ROI widgets.
