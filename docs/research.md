# CollabKaro research and design decisions

Reviewed 4 October 2026. The PRD describes the complete product roadmap. The supplied build prompt narrows this delivery to a frontend prototype with fictional data and mocked authentication. Backend services, real identity verification, payments, and social API connections are outside this phase.

## Reference observations

- [Collabstr](https://collabstr.com/) and its [campaign documentation](https://help.collabstr.com/en/article/post-a-campaign-1h9w8jk/): two-sided discovery, creator proposals with rates, and clear budget controls. Borrow the direct browse-to-apply path and up-front pricing; avoid copying their brand or claims.
- [Kofluence case studies](https://www.kofluence.com/influencer-marketing-case-studies/): campaign stories connect strategy with measurable reach and engagement. Use illustrative case studies, prominently marked as samples rather than invented customer results.
- [Chtrbox creator onboarding](https://www.chtrbox.com/influencers): welcomes creators beyond celebrity accounts. Make smaller creators and regional languages visible.
- [Upwork proposals](https://www.upwork.com/resources/how-to-create-a-proposal-that-wins-jobs/) and [portfolio guidance](https://www.upwork.com/resources/portfolio-guide): specific proposals and relevant work samples help assess fit. Include pitch, quote, showcase selection, application tracking, and a public media kit.
- [Contra](https://contra.com/?userType=independent): portfolio-led independent discovery. Give visual work and creator identity a clear place beside engagement metrics.
- Naukri is a pattern reference supplied in the brief: campaign cards expose employer, location, eligibility, budget, and application status. No access to private recruiter workflows is claimed.
- Winkl, Plixxo, and InfluCollabs remain client-provided references, not verified active products; their current onboarding experiences were not available in the reviewed evidence.

## 2026 design context

Contemporary design discussions emphasize expressive typography and purposeful motion, but these are editorial trends rather than universal standards. The brief's emphasis on a product-led hero, trust, responsive layouts, and restrained motion informed the implementation. References: [Canva trend discussion](https://www.creativebloq.com/design/canvas-2026-trend-predictions-have-filled-me-with-hope), [2026 typography](https://www.creativebloq.com/design/fonts-typography/breaking-rules-and-bringing-joy-top-typography-trends-for-2026).

## Design system

Design dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 4, VISUAL_DENSITY 5. The product calls for a distinctive marketing page, purposeful feedback, and denser application workspaces. The client’s explicit brand palette, typography, logo, and preview requirements take precedence over generic style defaults.

Bricolage Grotesque headlines, Inter UI, and Mukta Devanagari fallback; fonts are locally bundled through next/font/local because Google Fonts fetches fail in this environment. Violet primary actions, coral attention, lime highlights, warm off-white canvas. Components use soft cards (12-16px), controls (8-9px), and round avatars. The speech-bubble brand mark is a custom SVG per the supplied specification; UI icons use Lucide.

Desktop uses a split hero with linked campaign/profile previews, a search-first marketplace, and a sidebar workspace. At 375px, content collapses to one column, creator grids to two, filters become a bottom sheet, and workspaces get bottom navigation. Dark mode uses semantic tokens throughout. Motion honors prefers-reduced-motion.

Radix dialog primitives underpin accessible modals, cmdk powers global search, React Hook Form and Zod validate primary forms, Zustand persists local demo state, Recharts renders profile/dashboard insights, and dnd-kit supports the applicant board. No real brand logos or creator identities are intentionally used.
