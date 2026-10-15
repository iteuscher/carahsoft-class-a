// Build-time loading and validation of content/forms/*.yml, plus the AI prompt field list.
import { getCollection } from 'astro:content';
import { isField, isRepeat, optLabel, type Field, type FormDef, type Section } from './form-logic';

let cache: FormDef | null = null;

export async function loadCpo(): Promise<FormDef> {
  if (cache) return cache;
  const forms = await getCollection('forms');
  const entry = forms.find((f) => f.data.id === 'cpo');
  if (!entry) throw new Error('content/forms/cpo.yml is missing.');
  const form = entry.data as unknown as FormDef;
  const errors: string[] = [];

  const sectionIds = new Set<string>();
  const topIds = new Set<string>();
  for (const s of form.sections) {
    if (sectionIds.has(s.id)) errors.push(`Duplicate section id ${s.id}.`);
    sectionIds.add(s.id);
    const labels = new Set<string>();
    const checkFields = (fields: Field[], where: string, scope: Set<string>) => {
      for (const f of fields) {
        if (scope.has(f.id)) errors.push(`${where}: duplicate field id "${f.id}".`);
        scope.add(f.id);
        const key = f.label.toLowerCase();
        if (labels.has(key)) errors.push(`${where}: duplicate label "${f.label}" (labels must be unique so pasted answers map to one field).`);
        labels.add(key);
        if (['select', 'radio', 'checkboxes'].includes(f.type) && !f.options?.length) errors.push(`${where}: ${f.id} needs options.`);
        if (f.pattern) {
          try { new RegExp(f.pattern); } catch { errors.push(`${where}: ${f.id} has an invalid pattern.`); }
        }
      }
      for (const f of fields) {
        for (const c of [f.show_if, f.required_if]) {
          if (c && !fields.some((x) => x.id === c.field)) errors.push(`${where}: ${f.id} refers to unknown field "${c.field}".`);
        }
      }
    };
    checkFields(s.items.filter(isField), `cpo section ${s.id}`, topIds);
    for (const r of s.items.filter(isRepeat)) {
      if (topIds.has(r.repeat)) errors.push(`cpo: repeat id "${r.repeat}" clashes with a field id.`);
      topIds.add(r.repeat);
      labels.clear();
      checkFields(r.items, `cpo repeat ${r.repeat}`, new Set());
    }
  }
  if (errors.length) throw new Error(`content/forms/cpo.yml is invalid:\n  - ${errors.join('\n  - ')}`);
  cache = form;
  return form;
}

export async function cpoField(id: string): Promise<Field> {
  const form = await loadCpo();
  for (const s of form.sections) {
    const f = s.items.filter(isField).find((x) => x.id === id);
    if (f) return f;
  }
  throw new Error(`Unknown CPO form field "${id}".`);
}

/** Field list for the AI prompt: order, labels, formats, and allowed values come from the form. */
export function promptFields(form: FormDef, sectionIds: string[]): string {
  const lines: string[] = [];
  const describe = (f: Field) => {
    const notes: string[] = [];
    if (f.required && !f.later) notes.push('required');
    if (f.options?.length) {
      const list = f.options.map(optLabel).join('; ');
      if (f.type === 'checkboxes') notes.push(`${f.max ? `up to ${f.max}` : 'one or more'}, separated by semicolons, only from: ${list}`);
      else notes.push(`exactly one of: ${list}`);
    }
    if (f.prompt_hint) notes.push(/^[A-Z][a-z]/.test(f.prompt_hint) ? f.prompt_hint[0].toLowerCase() + f.prompt_hint.slice(1) : f.prompt_hint);
    else if (f.placeholder?.startsWith('e.g.')) notes.push(f.placeholder);
    return notes.length ? ` [${notes.join('; ')}]` : '';
  };
  for (const s of form.sections.filter((x) => sectionIds.includes(x.id)) as Section[]) {
    lines.push(`${s.number} ${s.title}`);
    for (const item of s.items) {
      if (isField(item)) {
        lines.push(item.type === 'fixed' ? `${item.label}: ${item.default}` : `${item.label}:${describe(item)}`);
      } else if (isRepeat(item) && item.prompt !== false) {
        lines.push(`(Repeat these lines for each ${item.label.toLowerCase()}, numbering them ${item.label} 1, ${item.label} 2, and so on.)`);
        for (const f of item.items) lines.push(`${item.label} 1 / ${f.label}:${describe(f)}`);
      }
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
