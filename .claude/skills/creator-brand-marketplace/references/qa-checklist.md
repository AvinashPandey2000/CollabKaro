# QA checklist

## Always

```bash
npx prettier --write <files you touched>
npm run typecheck
npm run lint            # zero warnings allowed
```

## When UI or behaviour changes

```bash
# Needs a server on :3000. Reuse one if `lsof -i :3000` shows it, otherwise run `npm run dev`.
npx playwright test --grep-invert "dark theme persists"   # avoids overwriting docs/home-dark.png
```

- Add or extend a test in `tests/flows.spec.ts` for every behavioural fix or feature. Select by role, label, or visible text, and use the "Viewing role" select to switch roles.
- Run `npm run build` before declaring release-ready work done, or when you touch routing, metadata, `generateStaticParams`, or `next.config.ts`.

## Manual pass (for UI changes)

- [ ] Light **and** dark theme (toggle in the header).
- [ ] 375px width: no horizontal scroll, tap targets ≥ 40px, bottom-sheet filters and bottom nav work.
- [ ] Every role that can see the screen: Guest, Creator, Brand-Agency, Admin.
- [ ] Keyboard: tab order, visible focus, Esc closes dialogs, and toggles expose `aria-pressed` or `aria-label`.
- [ ] States: loading (skeleton), empty (`<Empty>`), validation error, success toast.
- [ ] Persistence: reload keeps intended state (`collabkaro-demo-v1`) and doesn't crash with older stored state.
- [ ] Copy: every number or badge is backed by data or labelled sample, with no contradiction against other pages.
- [ ] Viewer scoping: no other user's applications, pitches, or contacts are visible.

## Reporting

List the commands run and their results (pass/fail with output for failures), the tests added, anything skipped and why, what remains mocked, and the items that need legal or product sign-off.
