# CollabKaro design system (as implemented)

Inspected from `app/globals.css`, `app/layout.tsx`, and `components/*` on 12 Oct 2026. Treat this as a map, not a replacement: if code and this file disagree, the code wins. Update this file afterwards.

## Styling approach

- **Plain semantic CSS classes in one file: `app/globals.css`** (~6.2k lines). Tailwind v4 is installed and `@theme inline` maps a few tokens, but components use **hand-written class names, not Tailwind utilities**. Follow that convention and add new rules next to related ones.
- Theme switching: `next-themes` sets `data-theme="dark"` on `<html>`. Dark overrides live under `[data-theme="dark"] …`. Every new colour must work in both themes.
- Responsive breakpoints actually used: `max-width: 1200px`, `1023px`, `767px` (main mobile), `374px`, and `min-width: 1500px`. Mobile also gets `.bottom-nav` in workspaces and bottom-sheet filters (`.filters-open`).
- Motion: `motion/react` with `MotionConfig reducedMotion="user"`. CSS has `prefers-reduced-motion` blocks. Keep motion subtle (fade/rise ≤ 0.7s).

## Tokens (`:root` → dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--brand` | `#6c3bff` violet | `#9a7aff` | Primary actions, links, verified ticks |
| `--brand-soft` | `#efe9ff` | `#231a47` | Soft badges, info boxes, icon hovers |
| `--accent` | `#ff5a36` coral | `#ff927b` | Attention, "not eligible" marks |
| `--lime` | `#c8f560` | `#b5e64a` | Highlight badges (text `#25350b`) |
| `--ink` | `#0e0b1f` | `#f4f2fa` | Body text |
| `--muted` | `#666274` | `#b2adc4` | Secondary text, paragraphs |
| `--bg` | `#fbfaf7` warm off-white | `#0b0918` | Page canvas |
| `--surface` | `#fff` | `#151229` | Cards/panels |
| `--border` | `#e8e5ef` | `#2a2545` | 1px borders |
| `--success` | `#168244` | `#6add9b` | Success text |
| `--tint` | `#f3f0fa` | `#1a152d` | Table headers, muted status |
| `--coral-tint` | `#fff0e9` | `#2a1c24` | Coral badge bg |
| `--radius` | `16px` | | Large cards |

Known hard-coded exceptions: `.error` `#c82e48`, `.stars` `#d98b12`, status-hired `#e2f5e7/#176b38`, poster monogram pastels in `data/index.ts`. Do not add more. Prefer a token, and if you need a new one, add it to both `:root` and `[data-theme="dark"]` and explain why.

## Typography

- Headings and `.logo`: **Bricolage Grotesque** (`--font-heading`, variable 200–800). Body: **Inter** (`--font-body`). Devanagari fallback: **Mukta** (`--font-hindi`, unicode-range only). All are local `next/font/local` files in `public/fonts/`. Never add Google Fonts (blocked at build here).
- Scale: `h1 46px/750/-1.9px`, `h2 34px/700`, `h3 19px/700`, `h4 15px/650`, body 14px. `p` is `--muted`, line-height 1.8. `.panel h2` is 24px.
- **Eyebrows**: `.eyebrow`, 10px uppercase text, letter-spacing 1.6px, written in ALL CAPS in JSX (e.g. `"YOUR CREATOR CORNER"`).

## Shape, elevation, spacing

- Radii in use: buttons/inputs/icon-buttons **9px**, panels **13px**, cards 12–16px (`--radius`), badges **5px**, info boxes 8px, avatars `50%` (`.round`).
- Shadows are rare and soft (e.g. button hover `0 5px 18px #6c3bff25`, cards `0 13px 40px #3b27401a`). Borders do most of the separation.
- Layout: `.container` = `min(1240px, 100% - 96px)`. Page wrappers: `.page-wrap`, `.section`, `.workspace-section`. Flex helpers: `.row`, `.row.between`. Grids: `.form-grid`, `.review-grid`, `.campaign-grid` (`.two`), `.creator-grid`, `.dashboard-stats`, `.dashboard-middle`, `.settings-grid`.

## Component vocabulary (reuse these)

| Need | Use |
|---|---|
| Primary / secondary / small / full-width button | `.button`, `.button.secondary`, `.button.small`, `.button.full` |
| Inline link-style action | `.text-button` (violet, underline on hover) |
| Icon-only control | `.icon-button` + `aria-label` |
| Status pill | `.badge` + `.soft` / `.lime` / `.coral`, application status `badge status-{applied,viewed,shortlisted,hired,rejected,withdrawn}` |
| Tag list | `.chips > span` |
| Card container | `.panel` |
| Explanatory / safety note | `.info-box` with a Lucide icon first (usually `ShieldCheck`) |
| Long dropdown (more than 6 options: city, niche, language, campaign picker) | `<SearchSelect value onChange options placeholder label />` from `components/ui/search-select.tsx`, which has a search box on top, keyboard support, and flips upward near the viewport bottom. Keep the native `<select>` for short lists. |
| Multi-select (platform filters) | `<MultiSelect value onChange options placeholder label />` from `components/ui/multi-select.tsx`. The value is a comma-separated string (`""` = all, written to URLs as `?platform=Instagram,YouTube`). Filters match with `platform.split(",").includes(...)`. |
| Platform icon | `<PlatformIcon platform size />` from `components/cards.tsx`. Platforms are limited to Instagram, YouTube, and LinkedIn (`platforms` in `data/index.ts`). |
| Form field | `<label className="field"><span>Label</span><input/>…<small className="error"/></label>`; checkbox: `.check-field` |
| Tabs/filters | `.tabs > button.selected > span(count)`; segmented toggle: `.segmented > button.selected` (+ `aria-pressed`) |
| Progress / steps | `.wizard-progress > div.complete > span`, `.status-timeline` |
| Table | `.data-table` (wrap in `.table-scroll` on mobile) |
| Empty state | `<Empty title text href label action />` from `components/marketplace.tsx` |
| Section title | `<SectionHeader label title subtitle href link />` from `components/home.tsx` |
| Modal | `<Dialog open onOpenChange title description>` from `components/ui/dialog.tsx` (Radix) |
| Toasts | `toast.success / info / error` from `sonner` |
| Loading | `.skeleton-card`, `.chart.skeleton` |
| Avatars / brand marks | `next/image` with `.round`; posters use `.monogram` (`.large`, `.xlarge`) with `style={{background: p.color}}` |
| Cards | `CampaignCard`, `CreatorCard`, `PosterStats` in `components/cards.tsx` |
| Charts | Recharts wrappers in `components/charts.tsx`, loaded with `dynamic(..., { ssr:false })` |

## Icons

**Lucide only** (`lucide-react`). The project aliases `Camera as Instagram` and `Video as Youtube` because brand icons aren't used. Common icons: `BadgeCheck` (verified, render only if `verified`), `ShieldCheck` (trust/safety), `ArrowUpRight` (CTA affordance on buttons/links), `Sparkles`, `MapPin`, `Users`, `Briefcase`, `Bookmark`, `Check`, `X`. Sizes: 13–20px inline, 26–36px feature icons.

## Imagery

`next/image` everywhere. Remote images come from `images.unsplash.com` (whitelisted in `next.config.ts`) via `photo(id, width)` in `data/index.ts`. The local hero is `public/brand-campaign-hero.png`. Alt text describes the scene. Decorative avatar stacks use `alt=""`.
