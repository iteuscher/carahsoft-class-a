---
name: paramify-design
description: Paramify brand design system (colors, type, spacing, radius, shadows, logos, fonts, voice). Use for any UI, styling, layout, copy tone, or visual decision on this site.
---

# Paramify design system

Source: the organization's default "Paramify Design System" in Claude (claude.ai/artifact/MnyKPp3Noi1RkkcGDfXuRK), copied here so Claude Code can use it. If the two disagree, the Claude artifact is newer; ask before diverging.

## Files

- `BRAND.md`: the brand book (voice, casing, color, type, spacing, borders, shadows, radii, cards, iconography). Read it before styling anything.
- `tokens.json`: source of truth for tokens. `tokens.css` is generated from it (CSS custom properties). Import `tokens.css` once at the app root.
- `components.css`: reference styles from the design system's component previews (buttons, cards, data tables, status chips, feature lists). Borrow patterns; don't import the slide-specific rules.
- `fonts/`: Open Sauce One (Regular, Medium, SemiBold) and Open Sauce Sans (Medium, Bold), self-hosted. Inter and IBM Plex Mono load from Google Fonts.
- `logos/`: Paramify horizontal lockups, blue (default) and black.

## Adapting a deck system to a web page

The system was extracted from a 1920×1080 sales deck. Keep its character, scale it for the web:

| Role | Deck | Web |
| --- | --- | --- |
| Page title | Open Sauce One Medium 56px | Open Sauce One Medium, clamp(32px, 4vw, 44px), line-height 1.1 |
| Section / step title | Open Sauce One Medium 40px | Open Sauce One Medium 24–28px |
| Body | Inter 24px / 36–44px | Inter 16–17px / 1.6 |
| Eyebrow / phase label | IBM Plex Mono caps 24–40px | IBM Plex Mono caps 12–13px, letter-spacing 0.06em, used sparingly (phase labels only) |
| Supporting text | Inter Light 20px | Inter 14–15px |

- Color: white surfaces; Sean Blue `--p-blue` (#1467FF) for primary actions, links, progress, and one full-bleed band at most (the hero). Grey panel `--bg-panel` (#F6F6F6) for callouts and rule quotes. Accent palette only for status chips (done, new, draft).
- Contrast: the brand's body grey `--p-grey-600` (#777777) is 4.48:1 on white, just under WCAG AA for small text. Use `--p-grey-700` (#595959) or darker for body copy on this site.
- Cards: white or #FCFCFC, 1px #E9E9E9 border, 16px radius, no colored left borders, no gradients.
- Icons: Lucide (stroke 1.5–2px, 16/20px). Pin an exact version.
- Motion: 200–250ms ease-out for state changes only. Respect `prefers-reduced-motion`.
- Voice: confident, factual, short declarative sentences, no exclamation points, no emoji, acronyms exact (FedRAMP, KSI, SDR, CPO, POA&M).

## Fonts and licensing

Check the Open Sauce font license before publishing these files from a public repo. If in doubt, keep the repo private or swap in the Google Fonts fallback the design system names (Manrope).
