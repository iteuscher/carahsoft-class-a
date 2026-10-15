# FedRAMP 20x Class A Walkthrough: MVP build spec

## What this is

A checklist website that walks a cloud service provider (CSP) from "we have a SOC 2" to a submitted FedRAMP 20x Class A certification using Paramify. Every step says exactly what to do, where to do it in Paramify, how you know you're done, and which FedRAMP rule it satisfies, so a CSP can submit with confidence without pestering their partner or Paramify.

- **Audience:** CSP compliance and engineering teams (95% have a SOC 2 Type II). Secondary: partners (Carahsoft, Insight Assurance) guiding them.
- **Owner:** Paramify. Paramify provides the software, videos, and this walkthrough; partners guide; the CSP does the work and submits.

## MVP scope

Build a static site with:

1. **Step pages** for the 17 steps in `content/steps/`, ordered by `sequence` (not by ID), grouped into Phase 1 (no Paramify workspace yet), a gate, Phase 2 (in Paramify), and Phase 3 (ongoing). A persistent step nav shows phase, title, and progress per step.
2. **Task checklists** on each step. Each task shows its text, role tag, "done when" criterion, rule links, and an optional link or template button. Checking a task saves progress per viewer in `localStorage` (key from `site.config.yml`), keyed by task ID.
3. **"New" badges** on tasks whose optional `added: YYYY-MM-DD` date is later than the viewer's last visit (tasks without `added` are never new). Task IDs are stable; never reuse or renumber them.
4. **Path selector** (SOC 2 / GovRAMP / Rev5) in the header. Apply `content/paths/<id>.yml` overlays: `inherits`, `overrides` (replace text or done_when), `hide`, `show`, and `notes`. Per-task `paths:` restricts a task to listed paths. Default: SOC 2.
5. **Role filter**: show all tasks or only one role's (Sponsor, Lead, Tech, SecOps, Comms, Partner, Paramify). Roles are defined in CA-04.
6. **Workshop view** (`/workshop`): every task with `ahead: true`, grouped by step, with `lead_time` where present, plus the copy in `content/workshop.md`.
7. **Self Check** (CA-16): render `checklists` as checkable items; progress saved like tasks.
8. **Form walkthroughs** (CA-07, CA-16): render `form.fields` as a two-column table (field, what to enter), with `fedramp_note` styled as a FedRAMP quote and `confirm_note` under the table.
9. **Prompts**: render `prompts` as a collapsible block with the caution above it and a "Copy prompt" button. In CA-13, replace `{{ksi_statements}}` with the seven KSI statements from the step's `ksis` list, one per line, prefixed with the KSI ID.
10. **FedRAMP rule callouts**: markdown blockquotes starting `> [!FEDRAMP] <RULE-ID>` render as a callout labeled "FedRAMP rule <RULE-ID>" that links to the rule (build the URL from `content/rules.yml`: `base[page] + '#' + anchor`). Text inside is verbatim FedRAMP wording; never edit it.
11. **Feedback link** on every step: opens a dialog with a prefilled block (subject `<subject_prefix> - <step id>`, step ID and title, optional task ID, partner name, blank company and feedback lines), a "Copy" button, and a link to the Zendesk request form from `site.config.yml`.
12. **Partner theming**: build-time `PARTNER=<id>` env var selects `content/partners/<id>.yml`. It sets the logo, intro (shown in CA-02 as `{{partner.name}}` / `{{partner.intro}}`), contact card, primary color override, and the "Powered by Paramify" footer. `paramify` is the standalone default and hides the partner section in CA-02. Paramify content (blogs, videos, help articles) always stays Paramify-attributed.
13. **Resources** per step: list `resources` with a type icon (blog, video, help, fedramp, form, trust). Embed YouTube videos with `youtube-nocookie.com`.

### Content conventions

- `[Draft]` at the start of a paragraph, a task with `draft: true`, or `review: pending` marks AI-drafted or unapproved wording. Hide the marker by default; with `?review=1` in the URL, highlight draft items so Paramify can find and replace them.
- `{{templates.<key>}}`, `{{fedramp_forms.<key>}}`, and task `template:` / `link_key:` fields resolve from `site.config.yml`. If a value is `TODO`, render a disabled button labeled "Template coming soon" (never a broken link).
- Any partner field set to `TODO` falls back to Paramify defaults; log a build warning listing every unresolved TODO.
- Markdown tables, `<details>`, and fenced code blocks appear in step bodies. Fenced code blocks get a copy button.

## Stack

- **Astro** (static output) with **content collections** and a **Zod schema** that matches the frontmatter in `content/` (validate at build; fail on unknown rule IDs or duplicate task IDs).
- Interactive pieces (checklists, path/role filters, copy buttons, feedback dialog) as small islands, vanilla TS or Preact. No client-side framework for the whole page.
- **Hosting: GitHub Pages** via a GitHub Actions workflow. Build one site per partner (`PARTNER=paramify`, `carahsoft`, `insight-assurance`) into subpaths (`/`, `/carahsoft/`, `/insight-assurance/`).
- No backend, no auth, no analytics, no cookies. All state lives in the viewer's browser.
- Pin dependency versions in `package.json`.

## Design

Use the `paramify-design` skill in `.claude/skills/paramify-design/` for every visual and copy decision. Read its `SKILL.md` and `BRAND.md` before writing any CSS. Key points:

- White surfaces, Sean Blue (#1467FF) for primary actions, links, and progress; grey panel (#F6F6F6) for FedRAMP rule callouts; status chips from the accent palette (done, new, draft).
- Open Sauce One for titles, Inter for body, IBM Plex Mono caps only for phase labels. Use the web type scale in `SKILL.md`, not the deck sizes.
- Body text in #595959 or darker (the brand's #777777 misses WCAG AA at body sizes).
- Flat, clinical, no gradients, no emoji, no decorative illustration. The checklist is the hero: a clear phase/step map with progress.
- Responsive down to 360px. Steps read as a single column on mobile with the step nav collapsed into a drawer.

## Accessibility (required)

WCAG 2.1 AA / Section 508: semantic headings, real checkboxes with labels, visible focus, keyboard-operable nav and dialogs, `prefers-reduced-motion` respected, color never the only signal (done/new/draft chips carry text).

## Not in the MVP (do not build)

- Client instances, shared progress, accounts or auth, partner admin or portfolio views.
- Read-only Paramify API key checks (future: the key stays in the browser and calls Paramify directly).
- Server-side feedback filing (Zendesk link only).
- Paramify Agent skills.

## Acceptance criteria

- `npm run build` succeeds for all three partners and fails on a schema error, unknown rule ID, or duplicate task ID.
- Every step renders in `sequence` order with its tasks, callouts, resources, and feedback link.
- Checking a task, reloading, and returning keeps the check. Switching path hides, shows, and rewrites tasks per the overlays.
- `/workshop` lists exactly the tasks with `ahead: true`.
- `?review=1` highlights every draft and pending item; without it, no "[Draft]" text is visible.
- Lighthouse accessibility score of 100 on a step page; no axe violations.
- No link on the built site points to docs.google.com or drive.google.com.

## Files

```text
CLAUDE.md                     this spec
site.config.yml               forms, Zendesk, template links (TODOs), storage key
content/steps/CA-XX-*.md      one file per step: frontmatter (tasks, rules, resources, prompts, forms, checklists) + body
content/rules.yml             FedRAMP rule ID -> name and URL
content/paths/*.yml           SOC 2 base, GovRAMP and Rev5 overlays
content/partners/*.yml        Paramify (standalone), Carahsoft, Insight Assurance
content/workshop.md           copy for the one-day workshop view
public/brand/                 Paramify logos
.claude/skills/paramify-design/   design system skill (tokens, fonts, logos, brand book)
```
