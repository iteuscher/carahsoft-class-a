# FedRAMP 20x Class A Walkthrough

Checklist site that walks a CSP from an existing SOC 2, GovRAMP, or Rev5 assessment to a submitted FedRAMP 20x Class A certification with Paramify. The build spec is in `CLAUDE.md`.

## Run it

```bash
npm install
npm run dev                         # http://localhost:4321, PARTNER=paramify by default
PARTNER=carahsoft npm run dev       # preview a partner theme
npm run build                       # all partners: dist/, dist/carahsoft/, dist/insight-assurance/
npm run preview                     # serve dist/ like GitHub Pages
```

`npm run build` fails on a schema error, an unknown rule ID (frontmatter or `> [!FEDRAMP]` callout), a duplicate task ID, a path overlay that names a missing task, an unresolved `{{placeholder}}`, or any docs.google.com / drive.google.com link in the output. It prints one warning listing every unresolved `TODO`.

Deploys run from `.github/workflows/deploy.yml` on push to `main`. For a project site (`user.github.io/<repo>/`) the base path defaults to `/<repo>/`; with a custom domain, set the repository variable `BASE_PATH` to `/`.

## Where things live

| Path | What |
| --- | --- |
| `content/` | All copy and data (steps, rules, paths, partners, workshop). Edit here, not in `src/`. |
| `src/content.config.ts` | Zod schema for `content/` (strict: unknown keys fail) |
| `src/lib/content.ts` | Step ordering, path overlays, cross-file validation |
| `src/lib/markdown.ts` | Step body rendering: FedRAMP callouts, `[Draft]`, placeholders, copy buttons, ID links |
| `src/scripts/app.ts` | Browser-side: progress, path/role filters, "New" badges, copy, feedback dialog, drawer |
| `src/styles/global.css` | Paramify tokens scaled for the web |

## Content notes

- `?review=1` highlights draft and pending items for the rest of the browser session; `?review=0` turns it off.
- Step IDs (`CA-15`), task IDs (`CA-11.1`), and rule IDs (`FRC-CSO-PKG`) in our own copy link automatically. Text inside FedRAMP callouts is never changed.
- A path's `fedramp_rule` replaces the base callout for the same rule on that path (CA-11). `audit_template` replaces the CA-13 note template; `ksi_gap_column` switches the CA-13 KSI table column. Path `notes` appear in the CA-03 path panel.
- Progress is keyed by task ID in `localStorage` (`progress_storage_key`). Never reuse or renumber task IDs.

## Before partners or clients see it

- [ ] Fill every `TODO` in `site.config.yml` (template links) and `content/partners/*.yml` (logos, contacts, colors)
- [ ] Replace `[Draft]` wording and resolve `review: pending` items (preview with `?review=1`)
- [ ] Confirm the Marketplace listing form fields after choosing a new listing (CA-07)
- [ ] Zendesk trigger or form field that tags walkthrough feedback
- [ ] Partner approval of copy and logos (Carahsoft, Insight Assurance)
- [ ] Self-host the Insight Assurance logo (it is hotlinked from insightassurance.com today)
- [ ] Check partner `theme.primary` colors for 4.5:1 contrast on white before setting them
- [ ] Check the Open Sauce font license before making the repo public
