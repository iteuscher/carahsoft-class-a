// CPO form behavior: binding inputs to saved answers, repeatable items, conditional fields,
// format checks, logo preview, section status, copy/download, and filling from an AI answer.
import {
  formToText, importText, isField, isRepeat, isVisible, isRequired, problem, sectionStatus, valueOf,
  type Field, type Repeat, type Value,
} from '../lib/form-logic';
import { announce, changed, currentPath, manifest, save, state } from './state';

const form = manifest.cpo;
const topFields = new Map<string, Field>();
const repeats = new Map<string, Repeat>();
for (const s of form.sections) {
  for (const item of s.items) {
    if (isField(item)) topFields.set(item.id, item);
    if (isRepeat(item)) repeats.set(item.repeat, item);
  }
}
const sectionFields = (id: string) => form.sections.find((s) => s.id === id)?.items.filter(isField) ?? [];
const allTop = [...topFields.values()];
const ctx = () => ({ path: currentPath() });

// ── Reading and writing inputs ──────────────────────────────
function scopeFor(el: Element): { scope: Record<string, Value>; field: Field; fields: Field[]; key: string } | null {
  const top = el.getAttribute('data-cpo-field');
  if (top) {
    const field = topFields.get(top);
    return field ? { scope: state.cpo.values, field, fields: allTop, key: top } : null;
  }
  const rid = el.getAttribute('data-rfield');
  const item = el.closest<HTMLElement>('[data-repeat-index]');
  const rep = el.closest<HTMLElement>('[data-repeat]');
  if (!rid || !item || !rep) return null;
  const def = repeats.get(rep.dataset.repeat!)!;
  const rows = (state.cpo.repeats[def.repeat] ??= []);
  const i = Number(item.dataset.repeatIndex);
  while (rows.length <= i) rows.push({});
  const field = def.items.find((f) => f.id === rid)!;
  return { scope: rows[i], field, fields: def.items, key: `${def.repeat}.${i}.${rid}` };
}

function readInput(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, field: Field): Value {
  if (el instanceof HTMLInputElement && el.type === 'checkbox') {
    const group = el.closest('fieldset')!;
    return [...group.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].filter((c) => c.checked).map((c) => c.value);
  }
  if (el instanceof HTMLInputElement && el.type === 'radio') {
    const group = el.closest('fieldset')!;
    return group.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.value ?? '';
  }
  return field.type === 'textarea' ? el.value : el.value.trim() === '' ? '' : el.value;
}

const BOUND = '[data-cpo-field], [data-rfield]';

function onEdit(e: Event) {
  const el = e.target as HTMLInputElement;
  if (!el.matches?.(BOUND)) return;
  const s = scopeFor(el);
  if (!s) return;
  s.scope[s.field.id] = readInput(el, s.field);
  save('cpo');
  changed();
}
document.addEventListener('input', onEdit);
document.addEventListener('change', (e) => {
  onEdit(e);
  const el = e.target as HTMLElement;
  if (el.matches?.(BOUND)) el.closest<HTMLElement>('[data-ff]')?.setAttribute('data-touched', '');
});
document.addEventListener('focusout', (e) => {
  const el = e.target as HTMLElement;
  if (el.matches?.(BOUND)) {
    el.closest<HTMLElement>('[data-ff]')?.setAttribute('data-touched', '');
    renderForm();
  }
});

// ── Repeatable items ────────────────────────────────────────
function renderRepeats() {
  document.querySelectorAll<HTMLElement>('[data-repeat]').forEach((box) => {
    const def = repeats.get(box.dataset.repeat!)!;
    const rows = (state.cpo.repeats[def.repeat] ??= []);
    while (rows.length < def.min) rows.push({});
    const list = box.querySelector<HTMLElement>('[data-repeat-items]')!;
    if (list.children.length === rows.length) return;
    const tpl = box.querySelector<HTMLTemplateElement>('[data-repeat-template]')!;
    list.replaceChildren(
      ...rows.map((_, i) => {
        const html = tpl.innerHTML.replaceAll('__i__', String(i)).replaceAll('__n__', String(i + 1));
        const frag = document.createRange().createContextualFragment(html);
        const item = frag.firstElementChild as HTMLElement;
        // Keep at least `min` items; the last required one can't be removed.
        if (rows.length <= def.min) item.querySelector('[data-repeat-remove]')?.remove();
        return item;
      }),
    );
  });
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>('[data-repeat-add]');
  if (add) {
    const box = add.closest<HTMLElement>('[data-repeat]')!;
    const rows = (state.cpo.repeats[box.dataset.repeat!] ??= []);
    rows.push({});
    save('cpo');
    changed();
    const items = box.querySelectorAll<HTMLElement>('.repeat-item');
    items[items.length - 1]?.querySelector<HTMLElement>('input, textarea, select')?.focus();
    announce(`${box.dataset.repeatLabel} ${rows.length} added.`);
  }
  const remove = t.closest<HTMLElement>('[data-repeat-remove]');
  if (remove) {
    const box = remove.closest<HTMLElement>('[data-repeat]')!;
    const i = Number(remove.closest<HTMLElement>('[data-repeat-index]')!.dataset.repeatIndex);
    const label = box.dataset.repeatLabel;
    if (!window.confirm(`Remove ${label?.toLowerCase()} ${i + 1} and its answers?`)) return;
    state.cpo.repeats[box.dataset.repeat!].splice(i, 1);
    box.querySelector<HTMLElement>('[data-repeat-items]')!.replaceChildren(); // force a rebuild
    save('cpo');
    changed();
    box.querySelector<HTMLElement>('[data-repeat-add]')?.focus();
    announce(`${label} ${i + 1} removed.`);
  }
});

// ── Rendering values, conditions, and checks ────────────────
function renderField(wrapper: HTMLElement) {
  const input = wrapper.querySelector<HTMLInputElement>(BOUND);
  if (!input) return;
  const s = scopeFor(input);
  if (!s) return;
  const { field, scope, fields } = s;
  const v = valueOf(field, scope, ctx());

  const visible = isVisible(field, scope, fields, ctx());
  wrapper.hidden = !visible;

  const inputs = wrapper.querySelectorAll<HTMLInputElement>(BOUND);
  // Swap the placeholder example to match the field it depends on (e.g. the framework used).
  if (field.placeholder_by) {
    const ctrl = fields.find((x) => x.id === field.placeholder_by!.field);
    const key = ctrl ? valueOf(ctrl, scope, ctx()) : '';
    const text = (typeof key === 'string' && field.placeholder_by.values[key]) || field.placeholder || '';
    inputs.forEach((el) => { el.placeholder = text; });
  }
  inputs.forEach((el) => {
    if (el.type === 'checkbox') el.checked = Array.isArray(v) && v.includes(el.value);
    else if (el.type === 'radio') el.checked = v === el.value;
    else if (document.activeElement !== el && el.value !== v) el.value = Array.isArray(v) ? v.join('; ') : v;
  });

  const mark = wrapper.querySelector<HTMLElement>('[data-req-mark]');
  if (mark) mark.hidden = !isRequired(field, scope, fields, ctx());

  if (field.max) {
    const n = Array.isArray(v) ? v.length : 0;
    inputs.forEach((el) => { el.disabled = !el.checked && n >= field.max!; });
    const note = wrapper.querySelector<HTMLElement>('[data-max-note]');
    if (note) note.textContent = `${n} of ${field.max} chosen.`;
  }

  const err = wrapper.querySelector<HTMLElement>('[data-ff-error]');
  const focused = wrapper.contains(document.activeElement) && !['checkbox', 'radio'].includes((document.activeElement as HTMLInputElement).type);
  const msg = visible && !focused ? problem(field, v) : null;
  if (err) {
    err.hidden = !msg;
    err.textContent = msg ?? '';
  }
  inputs.forEach((el) => el.toggleAttribute('aria-invalid', Boolean(msg)));

  const preview = wrapper.querySelector<HTMLElement>('[data-logo-preview]');
  if (preview) {
    const url = typeof v === 'string' && !problem(field, v) && v ? v : '';
    preview.hidden = !url;
    preview.querySelectorAll<HTMLImageElement>('[data-preview-img]').forEach((img) => {
      if (url && img.getAttribute('src') !== url) {
        img.onerror = () => { preview.querySelector<HTMLElement>('[data-preview-error]')!.hidden = false; };
        img.onload = () => { preview.querySelector<HTMLElement>('[data-preview-error]')!.hidden = true; };
        img.src = url;
      }
    });
  }
}

function renderStatus() {
  document.querySelectorAll<HTMLElement>('[data-section-status]').forEach((el) => {
    const section = form.sections.find((s) => s.id === el.dataset.sectionStatus)!;
    const st = sectionStatus(section, state.cpo, { excludeLater: true, path: currentPath() });
    const later = sectionFields(section.id).filter((f) => f.later).length;
    el.replaceChildren();
    if (st.required === 0) {
      el.textContent = section.optional ? 'Optional' : 'No required fields';
      return;
    }
    if (st.complete) {
      const chip = document.createElement('span');
      chip.className = 'chip chip-done';
      chip.textContent = 'Complete';
      el.append(chip);
      if (later) el.append(` ${later} field${later === 1 ? '' : 's'} added later.`);
    } else {
      el.textContent = `${st.filled} of ${st.required} required fields${later ? ` (${later} more added later)` : ''}`;
    }
  });
}

export function renderForm() {
  renderRepeats();
  document.querySelectorAll<HTMLElement>('[data-ff]').forEach(renderField);
  renderStatus();
}

export const cpoSectionsComplete = (ids: string[]) =>
  ids.every((id) => {
    const s = form.sections.find((x) => x.id === id);
    return s ? sectionStatus(s, state.cpo, { excludeLater: true, path: currentPath() }).complete : false;
  });

// ── Copy, download, import ──────────────────────────────────
const answersText = () => formToText(form, state.cpo, { path: currentPath() });

document.addEventListener('click', async (e) => {
  const t = e.target as HTMLElement;
  const status = document.querySelector<HTMLElement>('[data-cpo-toolbar-status]');
  if (t.closest('[data-cpo-copy]')) {
    try {
      await navigator.clipboard.writeText(answersText());
      announce('All CPO answers copied.');
      if (status) status.textContent = 'Copied.';
    } catch {
      announce('Copy failed. Use Download instead.');
    }
  }
  if (t.closest('[data-cpo-download]')) {
    const name = String(state.cpo.values.service_acronym || state.cpo.values.service_name || 'cpo')
      .replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-|-$/g, '') || 'cpo';
    const blob = new Blob([answersText()], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${name}-cpo-answers.txt` });
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    announce('Download started.');
  }
  if (t.closest('[data-cpo-import]')) {
    const box = t.closest<HTMLElement>('.cpo-import')!;
    const text = box.querySelector<HTMLTextAreaElement>('[data-cpo-import-text]')!.value;
    const ids = (box.closest<HTMLElement>('[data-cpo-form]')!.dataset.sections ?? '').split(',');
    const result = importText(form, ids, text, state.cpo);
    save('cpo');
    // Rebuild repeat items so imported services appear.
    document.querySelectorAll<HTMLElement>('[data-repeat-items]').forEach((l) => l.replaceChildren());
    changed();
    const out = box.querySelector<HTMLElement>('[data-cpo-import-result]')!;
    out.replaceChildren();
    const p = (txt: string) => Object.assign(document.createElement('p'), { textContent: txt });
    out.append(p(`Filled ${result.filled.length} field${result.filled.length === 1 ? '' : 's'}. Skipped ${result.skipped.length} marked MISSING.`));
    if (result.unmatched.length) {
      out.append(p("These values aren't on FedRAMP's allowed list, so they weren't filled in. Choose them yourself:"));
      const ul = document.createElement('ul');
      ul.append(...result.unmatched.map((u) => Object.assign(document.createElement('li'), { textContent: u })));
      out.append(ul);
    }
    if (!result.filled.length && !result.skipped.length) out.append(p('No field names matched. Paste the answer exactly as the AI wrote it, one "Field name: value" per line.'));
  }
});
