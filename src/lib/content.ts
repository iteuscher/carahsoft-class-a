// Loads steps and paths, applies path overlays, and validates cross-file references.
// Anything inconsistent throws, which fails `astro build`.
import { getCollection, type CollectionEntry } from 'astro:content';
import { config, getPartner, resolveKey } from './site';
import { loadCpo } from './form';
import { isField } from './form-logic';

export type StepData = CollectionEntry<'steps'>['data'];
export type PathData = CollectionEntry<'paths'>['data'];

export const PHASES: Record<number, { label: string; short: string }> = {
  1: { label: 'Phase 1', short: 'Before your workspace' },
  2: { label: 'Phase 2', short: 'In Paramify' },
  3: { label: 'Phase 3', short: 'Ongoing' },
};

/** "[Draft] text" -> { text, draft: true }. */
export function parseDraft(s: string | undefined | null): { text: string; draft: boolean } {
  if (!s) return { text: '', draft: false };
  const m = s.match(/^\s*\[Draft\]\s*/);
  return m ? { text: s.slice(m[0].length), draft: true } : { text: s, draft: false };
}

export type BodyPart =
  | { kind: 'md'; src: string }
  | { kind: 'tasks'; ids: string[] }
  | { kind: 'cpo'; only: string[] }
  | { kind: 'cpo_tools' }
  | { kind: 'cpo_save' };

/**
 * Splits a step body on placeholder lines so a guided step can place its tasks and CPO form
 * between sections, each on its own line: `{{tasks: CA-06.1, CA-06.2}}`, `{{cpo_form}}` (the whole form),
 * `{{cpo_form: properties}}` (just those sections), `{{cpo_tools}}` (the AI import), and `{{cpo_save}}` (Copy/Download).
 */
export function splitBody(src: string): BodyPart[] {
  const parts: BodyPart[] = [];
  let buf: string[] = [];
  const flush = () => {
    if (buf.join('').trim()) parts.push({ kind: 'md', src: buf.join('\n') });
    buf = [];
  };
  for (const line of src.split('\n')) {
    const tasks = line.match(/^\s*\{\{\s*tasks:\s*([^}]*)\}\}\s*$/);
    const cpo = line.match(/^\s*\{\{\s*cpo_form\s*(?::\s*([^}]*))?\}\}\s*$/);
    if (tasks) {
      flush();
      parts.push({ kind: 'tasks', ids: tasks[1].split(',').map((x) => x.trim()).filter(Boolean) });
    } else if (cpo) {
      flush();
      parts.push({ kind: 'cpo', only: (cpo[1] ?? '').split(',').map((x) => x.trim()).filter(Boolean) });
    } else if (/^\s*\{\{\s*cpo_tools\s*\}\}\s*$/.test(line)) {
      flush();
      parts.push({ kind: 'cpo_tools' });
    } else if (/^\s*\{\{\s*cpo_save\s*\}\}\s*$/.test(line)) {
      flush();
      parts.push({ kind: 'cpo_save' });
    } else buf.push(line);
  }
  flush();
  return parts;
}

export interface ResolvedPath {
  id: string;
  label: string;
  description: string;
  isDefault: boolean;
  overrides: Record<string, { text?: string; done_when?: string; draft?: boolean; optional?: boolean }>;
  hidden: Set<string>;
  shown: Set<string>;
  fedrampRule?: { id: string; text: string };
  notes: PathData['notes'];
  ksiGapColumn: 'soc2_gap' | 'related_controls';
  auditTemplate?: string;
}

export interface Variant {
  paths: string[];
  text: string;
  done_when?: string;
  draft: boolean;
  /** Optional on these paths: shown with an "Optional" chip and left out of progress. */
  optional: boolean;
}

/** A task or recurring item after path overlays: one variant per distinct wording. */
export interface ResolvedItem {
  id: string;
  stepId: string;
  role: string[];
  visiblePaths: string[];
  variants: Variant[];
  draft: boolean;
  pending: boolean;
  raw: StepData['tasks'][number] | StepData['recurring'][number];
}

export interface Site {
  steps: StepData[];
  paths: ResolvedPath[];
  defaultPath: string;
  tasks: Map<string, ResolvedItem[]>; // stepId -> resolved tasks
  recurring: Map<string, ResolvedItem[]>;
  bodies: Map<string, string>; // stepId -> markdown body
  /** "I've read this step" item for steps with nothing to check on some path; null otherwise. */
  readItems: Map<string, ProgressItem | null>;
  /** Everything that counts toward progress: tasks plus the read item. */
  progressItems: Map<string, ProgressItem[]>;
}

export interface ProgressItem {
  id: string;
  paths: string[];
  /** Only counts when the viewer's answer to this step choice matches (or is unanswered). */
  choice?: { id: string; value: string };
  auto?: 'path_chosen' | 'team_named' | { cpo: string[] };
}

/** Storage ID for a step's read checkbox. Never collides with numeric task IDs. */
export const readId = (stepId: string) => `${stepId}.read`;

let cache: Site | null = null;

export async function loadSite(): Promise<Site> {
  if (cache) return cache;
  const stepEntries = await getCollection('steps');
  const pathEntries = await getCollection('paths');
  const errors: string[] = [];

  const steps = stepEntries.map((e) => e.data).sort((a, b) => a.sequence - b.sequence);
  const bodies = new Map(stepEntries.map((e) => [e.data.id, e.body ?? '']));

  // Unique step IDs and sequences.
  const seenStep = new Map<string, number>();
  const seenSeq = new Map<number, string>();
  for (const s of steps) {
    if (seenStep.has(s.id)) errors.push(`Duplicate step ID ${s.id}.`);
    seenStep.set(s.id, s.sequence);
    if (seenSeq.has(s.sequence)) errors.push(`Steps ${seenSeq.get(s.sequence)} and ${s.id} share sequence ${s.sequence}.`);
    seenSeq.set(s.sequence, s.id);
  }

  // Unique task IDs across every step (tasks, recurring items, checklist items).
  const owner = new Map<string, string>();
  const claim = (id: string, where: string) => {
    if (owner.has(id)) errors.push(`Duplicate task ID ${id} (in ${owner.get(id)} and ${where}). Task IDs are stable; never reuse them.`);
    else owner.set(id, where);
  };
  for (const s of steps) {
    for (const t of s.tasks) {
      claim(t.id, s.id);
      if (!t.id.startsWith(`${s.id}.`)) errors.push(`Task ${t.id} lives in ${s.id}; its ID should start with ${s.id}.`);
    }
    for (const r of s.recurring) claim(r.id, s.id);
    for (const c of s.checklists) for (const i of c.items) claim(i.id, `${s.id} checklist ${c.id}`);
  }

  // Config-driven links must exist in site.config.yml (TODO is allowed; it renders "coming soon").
  for (const s of steps) {
    for (const t of [...s.tasks, ...s.recurring]) {
      try {
        if (t.link_key) resolveKey(t.link_key);
        if ('template' in t && t.template) resolveKey(`templates.${t.template}`);
      } catch (e) {
        errors.push(`${t.id}: ${(e as Error).message}`);
      }
    }
  }

  // Guided steps place every task in the body exactly once with {{tasks: …}} lines.
  for (const s of steps) {
    const parts = splitBody(bodies.get(s.id) ?? '');
    const placed = parts.flatMap((p) => (p.kind === 'tasks' ? p.ids : []));
    if (!parts.some((p) => p.kind === 'tasks')) continue;
    const own = new Set(s.tasks.map((t) => t.id));
    const seen = new Set<string>();
    for (const id of placed) {
      if (!own.has(id)) errors.push(`${s.id}: {{tasks}} names ${id}, which is not one of this step's tasks.`);
      if (seen.has(id)) errors.push(`${s.id}: {{tasks}} places ${id} more than once.`);
      seen.add(id);
    }
    for (const id of own) if (!seen.has(id)) errors.push(`${s.id}: task ${id} is not placed by any {{tasks}} line in the body.`);
  }
  // {{cpo_form: …}} may only name the step's own CPO sections.
  for (const s of steps) {
    for (const p of splitBody(bodies.get(s.id) ?? '')) {
      if (p.kind !== 'cpo') continue;
      for (const sec of p.only) if (!s.cpo_sections.includes(sec)) errors.push(`${s.id}: {{cpo_form}} names ${sec}, which is not in this step's cpo_sections.`);
    }
  }

  // Choices, CPO form references, and self-checking tasks.
  const form = await loadCpo();
  const sectionIds = new Set(form.sections.map((x) => x.id));
  const cpoFieldIds = new Set(form.sections.flatMap((x) => x.items.filter(isField).map((f) => f.id)));
  for (const s of steps) {
    const options = new Set(s.choice?.options.map((o) => o.id) ?? []);
    for (const t of s.tasks) {
      if (t.variant && !options.has(t.variant)) {
        errors.push(`${t.id}: variant "${t.variant}" is not an option of ${s.id}'s choice (${[...options].join(', ') || 'none defined'}).`);
      }
      if (t.complete_when && typeof t.complete_when === 'object') {
        for (const sec of t.complete_when.cpo) if (!sectionIds.has(sec)) errors.push(`${t.id}: complete_when names unknown CPO section "${sec}".`);
      }
      for (const i of t.inputs ?? []) if (!cpoFieldIds.has(i.field)) errors.push(`${t.id}: input names unknown CPO field "${i.field}".`);
    }
    for (const sec of s.cpo_sections) {
      const def = form.sections.find((x) => x.id === sec);
      if (!def) errors.push(`${s.id}: cpo_sections names unknown section "${sec}".`);
    }
  }
  for (const sec of form.sections) {
    if (!seenStep.has(sec.step)) errors.push(`CPO section ${sec.id} names unknown step ${sec.step}.`);
    for (const f of sec.items.filter(isField)) if (f.later && !seenStep.has(f.later)) errors.push(`CPO field ${f.id}: later names unknown step ${f.later}.`);
  }

  // Resolve path inheritance.
  const byId = new Map(pathEntries.map((e) => [e.data.id, e.data]));
  const chainOf = (id: string, seen: string[] = []): PathData[] => {
    if (seen.includes(id)) {
      errors.push(`Path inheritance loop: ${[...seen, id].join(' -> ')}`);
      return [];
    }
    const p = byId.get(id)!;
    return p.inherits ? [...chainOf(p.inherits, [...seen, id]), p] : [p];
  };
  const paths: ResolvedPath[] = pathEntries
    .map((e) => e.data)
    .map((p) => {
      const chain = chainOf(p.id);
      const overrides: ResolvedPath['overrides'] = {};
      const hidden = new Set<string>();
      const shown = new Set<string>();
      let fedrampRule: ResolvedPath['fedrampRule'];
      let ksiGapColumn: ResolvedPath['ksiGapColumn'] = 'soc2_gap';
      let auditTemplate: string | undefined;
      for (const link of chain) {
        for (const [id, o] of Object.entries(link.overrides)) overrides[id] = { ...overrides[id], ...o };
        for (const id of link.hide) { hidden.add(id); shown.delete(id); }
        for (const id of link.show) { shown.add(id); hidden.delete(id); }
        if (link.fedramp_rule) fedrampRule = link.fedramp_rule;
        if (link.ksi_gap_column) ksiGapColumn = link.ksi_gap_column;
        if (link.audit_template) auditTemplate = link.audit_template;
      }
      for (const id of [...Object.keys(p.overrides), ...p.hide, ...p.show]) {
        if (!owner.has(id)) errors.push(`content/paths/${p.id}.yml references unknown task ${id}.`);
      }
      return {
        id: p.id,
        label: p.label,
        description: p.description,
        isDefault: p.id === config.default_path,
        overrides,
        hidden,
        shown,
        fedrampRule,
        notes: p.notes,
        ksiGapColumn,
        auditTemplate,
      };
    });
  // Base path first, then by inheritance depth, so the selector reads SOC 2, GovRAMP, Rev5.
  paths.sort((a, b) => chainOf(a.id).length - chainOf(b.id).length);
  if (!paths.some((p) => p.isDefault)) errors.push(`default_path "${config.default_path}" has no content/paths file.`);

  if (errors.length) {
    throw new Error(`Content validation failed:\n  - ${errors.join('\n  - ')}`);
  }

  const resolve = (s: StepData, t: StepData['tasks'][number] | StepData['recurring'][number]): ResolvedItem => {
    const groups = new Map<string, Variant>();
    const visiblePaths: string[] = [];
    for (const p of paths) {
      const visible = p.shown.has(t.id) || (!p.hidden.has(t.id) && (!t.paths || t.paths.includes(p.id)));
      if (!visible) continue;
      visiblePaths.push(p.id);
      const o = p.overrides[t.id] ?? {};
      const text = parseDraft(o.text ?? t.text);
      const done = 'done_when' in t ? parseDraft(o.done_when ?? t.done_when) : null;
      const v = {
        text: text.text,
        done_when: done?.text,
        draft: Boolean(o.draft ?? t.draft) || text.draft || Boolean(done?.draft) || t.review === 'pending',
        optional: Boolean(o.optional ?? ('optional' in t && t.optional)),
      };
      const key = JSON.stringify(v);
      if (groups.has(key)) groups.get(key)!.paths.push(p.id);
      else groups.set(key, { ...v, paths: [p.id] });
    }
    const variants = [...groups.values()];
    return {
      id: t.id,
      stepId: s.id,
      // A task without a role (unowned draft) gets an empty list.
      role: (t.role ?? '').split(',').map((r) => r.trim()).filter(Boolean),
      visiblePaths,
      variants,
      draft: variants.some((v) => v.draft),
      pending: t.review === 'pending',
      raw: t,
    };
  };

  const tasks = new Map(steps.map((s) => [s.id, s.tasks.map((t) => resolve(s, t))]));
  // Steps with no task on a path (CA-01, CA-02, CA-17) get a read checkbox on that path.
  const readItems = new Map<string, ProgressItem | null>(
    steps.map((s) => {
      const empty = paths
        .filter((p) => !tasks.get(s.id)!.some((t) => t.visiblePaths.includes(p.id)))
        .map((p) => p.id);
      return [s.id, empty.length ? { id: readId(s.id), paths: empty } : null];
    }),
  );
  const progressItems = new Map(
    steps.map((s) => {
      const items: ProgressItem[] = tasks.get(s.id)!.map((t) => {
        const raw = t.raw as StepData['tasks'][number];
        return {
          id: t.id,
          // Optional tasks don't count toward progress on the paths where they're optional.
          paths: t.visiblePaths.filter((pid) => !t.variants.some((v) => v.optional && v.paths.includes(pid))),
          ...(raw.variant && s.choice ? { choice: { id: s.choice.id, value: raw.variant } } : {}),
          ...(raw.complete_when ? { auto: raw.complete_when } : {}),
        };
      });
      const read = readItems.get(s.id);
      return [s.id, read ? [...items, read] : items];
    }),
  );

  cache = {
    steps,
    paths,
    defaultPath: config.default_path,
    tasks,
    recurring: new Map(steps.map((s) => [s.id, s.recurring.map((t) => resolve(s, t))])),
    bodies,
    readItems,
    progressItems,
  };
  return cache;
}

export const stepSlug = (id: string) => id.toLowerCase();
export const stepHref = (id: string) => `steps/${stepSlug(id)}/`;

/** Context for markdown rendering and ID linking. */
export async function renderContext(stepId: string) {
  const site = await loadSite();
  const taskIds = new Map<string, string>();
  for (const s of site.steps) {
    for (const t of [...s.tasks, ...s.recurring]) taskIds.set(t.id, s.id);
  }
  return {
    stepId,
    partner: await getPartner(),
    paths: site.paths,
    stepIds: new Set(site.steps.map((s) => s.id)),
    taskIds,
  };
}
