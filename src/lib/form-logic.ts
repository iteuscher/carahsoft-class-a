// Pure form logic shared by the build and the browser (no Node or DOM imports).

export type Option = string | { value: string; label: string };
export interface Condition { field: string; equals: string }
export interface Field {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'email' | 'tel' | 'date' | 'select' | 'radio' | 'checkboxes' | 'fixed';
  required?: boolean;
  required_if?: Condition;
  show_if?: Condition;
  later?: string;
  rule?: string;
  hint?: string;
  placeholder?: string;
  // Placeholder that changes with another field's value (keyed by that value).
  placeholder_by?: { field: string; values: Record<string, string> };
  pattern?: string;
  pattern_hint?: string;
  options?: Option[];
  max?: number;
  max_age_months?: number;
  default?: string;
  default_from?: 'path';
  preview?: boolean;
  prompt_hint?: string;
  review?: 'pending';
}
export interface Heading { heading: string }
export interface Repeat {
  repeat: string;
  label: string;
  add_label: string;
  min: number;
  prompt?: boolean;
  prompt_label?: string;
  items: Field[];
}
export type Item = Field | Heading | Repeat;
export interface Section {
  id: string;
  number: number;
  title: string;
  step: string;
  optional?: boolean;
  prompt?: boolean;
  intro?: string;
  items: Item[];
}
export interface FormDef { id: string; title: string; sections: Section[] }

export type Value = string | string[];
export interface FormData {
  values: Record<string, Value>;
  repeats: Record<string, Record<string, Value>[]>;
}

export const isField = (i: Item): i is Field => 'id' in i && 'type' in i;
export const isRepeat = (i: Item): i is Repeat => 'repeat' in i;
export const isHeading = (i: Item): i is Heading => 'heading' in i;

export const optValue = (o: Option) => (typeof o === 'string' ? o : o.value);
export const optLabel = (o: Option) => (typeof o === 'string' ? o : o.label);

/** The stored value, or the field default (fixed fields always use the default). */
export function valueOf(f: Field, scope: Record<string, Value>, ctx?: { path?: string }): Value {
  if (f.type === 'fixed') return f.default ?? '';
  const v = scope[f.id];
  if (v !== undefined) return v;
  if (f.default_from === 'path' && ctx?.path) return ctx.path;
  if (f.default !== undefined) return f.type === 'checkboxes' ? [f.default] : f.default;
  return f.type === 'checkboxes' ? [] : '';
}

const matches = (c: Condition | undefined, scope: Record<string, Value>, fields: Field[], ctx?: { path?: string }) => {
  if (!c) return true;
  const f = fields.find((x) => x.id === c.field);
  const v = f ? valueOf(f, scope, ctx) : scope[c.field];
  return Array.isArray(v) ? v.includes(c.equals) : v === c.equals;
};

export const isVisible = (f: Field, scope: Record<string, Value>, fields: Field[], ctx?: { path?: string }) =>
  matches(f.show_if, scope, fields, ctx);

export const isRequired = (f: Field, scope: Record<string, Value>, fields: Field[], ctx?: { path?: string }) =>
  Boolean(f.required) || (f.required_if ? matches(f.required_if, scope, fields, ctx) : false);

export const isEmpty = (v: Value) => (Array.isArray(v) ? v.length === 0 : !String(v ?? '').trim());

const MAX_PATTERN_INPUT = 2048;

/** A problem with a non-empty value, or null. */
export function problem(f: Field, v: Value, today = new Date()): string | null {
  if (isEmpty(v)) return null;
  if (Array.isArray(v)) {
    if (f.max && v.length > f.max) return `Choose at most ${f.max}.`;
    return null;
  }
  const s = v.trim();
  // Patterns come from content/forms (reviewed in the repo); cap input length before testing them.
  if (f.pattern && (s.length > MAX_PATTERN_INPUT || !new RegExp(f.pattern, 'i').test(s))) return f.pattern_hint ?? 'Check the format.';
  if (f.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(s)) return 'Enter a full link starting with https://';
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return 'Enter an email address like name@example.com.';
  if (f.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'Use the YYYY-MM-DD format.';
    if (f.max_age_months) {
      const limit = new Date(today);
      limit.setMonth(limit.getMonth() - f.max_age_months);
      if (new Date(`${s}T00:00:00`) < limit) return `Must be within the past ${f.max_age_months} months.`;
    }
  }
  return null;
}

const fieldsOf = (items: Item[]) => items.filter(isField);

export interface Status { required: number; filled: number; complete: boolean }

/**
 * Required-field status for a section. `excludeLater` skips fields filled in a later step.
 * Empty repeat items are ignored; at least `min` complete items are needed.
 */
export function sectionStatus(section: Section, data: FormData, opts: { excludeLater?: boolean; path?: string } = {}): Status {
  let required = 0;
  let filled = 0;
  const top = fieldsOf(section.items);
  const count = (f: Field, scope: Record<string, Value>, siblings: Field[]) => {
    if (f.type === 'fixed') return;
    if (opts.excludeLater && f.later) return;
    if (!isVisible(f, scope, siblings, opts) || !isRequired(f, scope, siblings, opts)) return;
    required++;
    const v = valueOf(f, scope, opts);
    if (!isEmpty(v) && !problem(f, v)) filled++;
  };
  for (const item of section.items) {
    if (isField(item)) count(item, data.values, top);
    if (isRepeat(item)) {
      const rows = (data.repeats[item.repeat] ?? []).filter((r) => item.items.some((f) => !isEmpty(r[f.id] ?? '')));
      for (const row of rows) for (const f of item.items) count(f, row, item.items);
      // Rows still needed to reach the minimum count as unfilled requirements.
      const missing = section.optional ? 0 : Math.max(0, item.min - rows.length);
      required += missing * item.items.filter((f) => f.required).length;
    }
  }
  return { required, filled, complete: filled >= required };
}

export const emptyForm = (): FormData => ({ values: {}, repeats: {} });

/** "Label: value" lines in form order. Used for copy/download and as the AI answer format. */
export function formToText(form: FormDef, data: FormData, opts: { sections?: string[]; path?: string } = {}): string {
  const out: string[] = [`${form.title} (FRC-CSO-PKG), Class A`, ''];
  const show = (v: Value) => (Array.isArray(v) ? v.join('; ') : v);
  for (const s of form.sections) {
    if (opts.sections && !opts.sections.includes(s.id)) continue;
    out.push(`${s.number} ${s.title}`);
    const top = fieldsOf(s.items);
    for (const item of s.items) {
      if (isHeading(item)) out.push(`-- ${item.heading}`);
      if (isField(item) && isVisible(item, data.values, top, opts)) {
        out.push(`${item.label}: ${labelFor(item, valueOf(item, data.values, opts))}`);
      }
      if (isRepeat(item)) {
        const rows = data.repeats[item.repeat] ?? [];
        rows.forEach((row, i) => {
          for (const f of item.items) {
            if (isVisible(f, row, item.items)) out.push(`${item.label} ${i + 1} / ${f.label}: ${show(labelFor(f, valueOf(f, row)))}`);
          }
        });
      }
    }
    out.push('');
  }
  return out.join('\n').trimEnd() + '\n';
}

function labelFor(f: Field, v: Value): string {
  const one = (x: string) => {
    const o = f.options?.find((o) => optValue(o) === x);
    return o ? optLabel(o) : x;
  };
  return Array.isArray(v) ? v.map(one).join('; ') : one(v);
}

export interface ImportResult { filled: string[]; skipped: string[]; unmatched: string[] }

/** Parse "Label: value" lines (the format the AI prompt asks for) into form data. */
export function importText(form: FormDef, sectionIds: string[], text: string, data: FormData): ImportResult {
  const result: ImportResult = { filled: [], skipped: [], unmatched: [] };
  const norm = (s: string) => s.toLowerCase().replace(/[*()]/g, '').replace(/\s+/g, ' ').trim();
  const sections = form.sections.filter((s) => sectionIds.includes(s.id));
  let current: Section | undefined;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[\s>*\-•]+/, '').replace(/\*\*/g, '').trim();
    if (!line) continue;
    const head = line.match(/^(\d+)\s+(.+)$/);
    if (head) {
      const s = sections.find((x) => String(x.number) === head[1]);
      if (s) { current = s; continue; }
    }
    const m = line.match(/^(.+?):\s*(.*)$/);
    if (!m) continue;
    const [, key, valueRaw] = m;
    const value = valueRaw.trim();
    const rep = key.match(/^(.+?)\s+(\d+)\s*\/\s*(.+)$/);
    const pool = current ? [current] : sections;
    let target: { f: Field; scope: Record<string, Value>; name: string } | null = null;
    for (const s of pool) {
      if (rep) {
        const r = s.items.filter(isRepeat).find((x) => norm(x.label) === norm(rep[1]) || norm(x.prompt_label?.replace(/ N$/, '') ?? '') === norm(rep[1]));
        const f = r?.items.find((x) => norm(x.label) === norm(rep[3]));
        if (r && f) {
          const rows = (data.repeats[r.repeat] ??= []);
          const idx = Number(rep[2]) - 1;
          while (rows.length <= idx) rows.push({});
          target = { f, scope: rows[idx], name: `${r.label} ${idx + 1} / ${f.label}` };
        }
      } else {
        const f = s.items.filter(isField).find((x) => norm(x.label) === norm(key));
        if (f) target = { f, scope: data.values, name: f.label };
      }
      if (target) break;
    }
    if (!target || target.f.type === 'fixed') continue;
    if (!value || /^missing\b/i.test(value)) { result.skipped.push(target.name); continue; }
    const { f } = target;
    if (f.options) {
      const pick = (s: string) => f.options!.find((o) => norm(optLabel(o)) === norm(s) || norm(optValue(o)) === norm(s));
      if (f.type === 'checkboxes') {
        const parts = value.split(/\s*;\s*|\s*\|\s*/).filter(Boolean);
        const ok = parts.map(pick).filter(Boolean).map((o) => optValue(o!));
        const bad = parts.filter((p) => !pick(p));
        if (ok.length) { target.scope[f.id] = f.max ? ok.slice(0, f.max) : ok; result.filled.push(target.name); }
        if (bad.length) result.unmatched.push(`${target.name}: ${bad.join('; ')}`);
      } else {
        const o = pick(value);
        if (o) { target.scope[f.id] = optValue(o); result.filled.push(target.name); }
        else result.unmatched.push(`${target.name}: ${value}`);
      }
    } else {
      target.scope[f.id] = value;
      result.filled.push(target.name);
    }
  }
  return result;
}
