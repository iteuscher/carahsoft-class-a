// Client behavior: progress, self-checking tasks, path and platform choices, "New" badges,
// copy buttons, feedback dialog, and the mobile step drawer. State lives in ./state.
import { renderForm, cpoSectionsComplete } from './cpo';
import { renderTeam, rolesForShow, showLabel, teamComplete } from './team';
import {
  KEY, announce, changed, currentPath, get, isShown, local, manifest, root, save, session, set, state, type ManifestItem,
} from './state';

// ── Self-checking tasks ─────────────────────────────────────
function autoDone(item: ManifestItem): boolean {
  const a = item.auto!;
  if (a === 'path_chosen') return Boolean(state.prefs.pathChosen);
  if (a === 'team_named') return teamComplete();
  return cpoSectionsComplete(a.cpo);
}

function evaluateAuto() {
  let dirty = false;
  for (const step of manifest.steps) {
    for (const item of step.tasks) {
      if (!item.auto) continue;
      const done = autoDone(item);
      if (done && !state.progress.done[item.id]) { state.progress.done[item.id] = new Date().toISOString(); dirty = true; }
      if (!done && state.progress.done[item.id]) { delete state.progress.done[item.id]; dirty = true; }
    }
  }
  if (dirty) save('progress');
}

// ── Checkboxes ───────────────────────────────────────────────
function syncCheckboxes() {
  document.querySelectorAll<HTMLInputElement>('input[data-task]').forEach((cb) => {
    const done = Boolean(state.progress.done[cb.dataset.task!]);
    cb.checked = done;
    cb.closest('.task')?.classList.toggle('is-done', done);
  });
}

document.addEventListener('change', (e) => {
  const cb = e.target as HTMLInputElement;
  if (!cb.matches?.('input[data-task]') || cb.disabled) return;
  const id = cb.dataset.task!;
  if (cb.checked) state.progress.done[id] = new Date().toISOString();
  else delete state.progress.done[id];
  save('progress');
  changed();
});

// ── Progress ────────────────────────────────────────────────
const counts = (item: ManifestItem) => {
  if (!item.paths.includes(currentPath())) return false;
  if (!item.choice) return true;
  const chosen = state.prefs.choices?.[item.choice.id];
  return !chosen || chosen === item.choice.value;
};

function setBar(el: HTMLElement, ratio: number) {
  const pct = Math.round(ratio * 100);
  el.setAttribute('aria-valuenow', String(pct));
  el.setAttribute('aria-valuetext', `${pct}%`);
  const fill = el.querySelector<HTMLElement>('span');
  if (fill) fill.style.width = `${pct}%`;
}

const each = (sel: string, fn: (el: HTMLElement) => void) => document.querySelectorAll<HTMLElement>(sel).forEach(fn);

function updateProgress() {
  let total = 0;
  let done = 0;
  for (const step of manifest.steps) {
    const tasks = step.tasks.filter(counts);
    const n = tasks.length;
    const d = tasks.filter((t) => state.progress.done[t.id]).length;
    total += n;
    done += d;
    const st = n === 0 ? 'none' : d === n ? 'done' : d > 0 ? 'partial' : 'none';
    each(`[data-step-status="${step.id}"]`, (el) => (el.dataset.state = st));
    each(`[data-step-count="${step.id}"]`, (el) => (el.textContent = n ? `${d}/${n}` : ''));
    each(`[data-step-sr="${step.id}"]`, (el) => (el.textContent = n ? (d === n ? ', complete' : `, ${d} of ${n} tasks done`) : ''));
    each(`[data-step-bar="${step.id}"]`, (el) => setBar(el, n ? d / n : 0));
    each(`[data-step-count-text="${step.id}"]`, (el) => (el.textContent = n ? `${d} of ${n} done` : ''));
  }
  each('[data-overall-bar]', (el) => setBar(el, total ? done / total : 0));
  each('[data-overall-count]', (el) => (el.textContent = `${done} of ${total}`));
  each('[data-checklist]', (list) => {
    const boxes = list.querySelectorAll<HTMLInputElement>('input[data-task]');
    const checked = [...boxes].filter((b) => b.checked).length;
    const out = list.querySelector<HTMLElement>('[data-checklist-count]');
    if (out) out.textContent = `${checked} of ${boxes.length} verified`;
  });
}

// ── Path choice (CA-03.1) ───────────────────────────────────
function renderPath() {
  const path = currentPath();
  document.querySelectorAll<HTMLInputElement>('input[data-path-choice]').forEach((r) => {
    r.checked = Boolean(state.prefs.pathChosen) && r.value === path;
  });
}

document.addEventListener('change', (e) => {
  const r = e.target as HTMLInputElement;
  if (!r.matches?.('input[data-path-choice]')) return;
  root.setAttribute('data-path', r.value);
  state.prefs.path = r.value;
  state.prefs.pathChosen = true;
  save('prefs');
  changed();
  announce(`Path set to ${manifest.paths.find((p) => p.id === r.value)?.label}. Tasks updated across the walkthrough.`);
});

// ── Step choices (e.g. email platform in CA-05) ─────────────
function renderChoices() {
  for (const c of manifest.choices) {
    const chosen = state.prefs.choices?.[c.id] ?? '';
    if (chosen) root.setAttribute(`data-choice-${c.id}`, chosen);
    else root.removeAttribute(`data-choice-${c.id}`);
    document.querySelectorAll<HTMLInputElement>(`input[data-choice-input="${c.id}"]`).forEach((r) => (r.checked = r.value === chosen));
  }
}

document.addEventListener('change', (e) => {
  const r = e.target as HTMLInputElement;
  if (!r.matches?.('input[data-choice-input]')) return;
  state.prefs.choices = { ...state.prefs.choices, [r.dataset.choiceInput!]: r.value };
  save('prefs');
  changed();
  announce(r.value ? 'Showing the steps for your choice.' : 'Showing every option.');
});

// ── Filter notes ─────────────────────────────────────────────
function updateFilterNotes() {
  const label = showLabel();
  each('[data-task-section]', (section) => {
    const items = [...section.querySelectorAll<HTMLElement>('.task[data-roles]')];
    const visible = items.filter(isShown).length;
    // Count only tasks hidden by the Show filter (not by the path or a platform choice).
    const roles = rolesForShow(state.prefs.show) ?? [];
    const hidden = items.filter((i) => {
      if (!(i.dataset.paths ?? '').split(' ').includes(currentPath())) return false;
      const choice = i.dataset.choice;
      const chosen = choice ? state.prefs.choices?.[choice] : '';
      if (chosen && i.dataset.variant !== chosen) return false;
      return roles.length > 0 && !(i.dataset.roles ?? '').split(' ').some((r) => roles.includes(r));
    }).length;
    const note = section.querySelector<HTMLElement>('[data-filter-note]');
    const empty = section.querySelector<HTMLElement>('[data-empty-note]');
    if (note) {
      note.hidden = !label || hidden <= 0;
      note.textContent = label ? `Showing ${label}. ${hidden} other ${hidden === 1 ? 'task is' : 'tasks are'} hidden by the Show filter.` : '';
    }
    if (empty) empty.hidden = visible > 0 || items.length === 0;
  });
}

// ── "New" badges ────────────────────────────────────────────
// The previous visit is captured once per browser session so badges survive navigation between steps.
(function newBadges() {
  let prev = get(session, `${KEY}:prev-visit`);
  if (prev === null) {
    prev = get(local, `${KEY}:last-visit`) || '';
    set(session, `${KEY}:prev-visit`, prev);
    set(local, `${KEY}:last-visit`, new Date().toISOString().slice(0, 10));
  }
  if (!prev) return; // first visit: nothing is "new" yet
  each('[data-added]', (el) => {
    if ((el.dataset.added || '') > prev!) {
      const chip = el.querySelector<HTMLElement>('[data-new-chip]');
      if (chip) chip.hidden = false;
    }
  });
})();

// ── Copy buttons ────────────────────────────────────────────
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

document.addEventListener('click', async (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-copy-from]');
  if (!btn) return;
  const src = document.getElementById(btn.dataset.copyFrom!);
  if (!src) return;
  const ok = await copyText(src instanceof HTMLTextAreaElement ? src.value : src.textContent || '');
  const label = [...btn.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
  if (label) {
    const original = label.textContent;
    label.textContent = ok ? 'Copied' : 'Copy failed';
    window.setTimeout(() => (label.textContent = original), 2000);
  }
  announce(ok ? 'Copied to clipboard.' : 'Copy failed. Select the text and copy it manually.');
});

// ── Feedback dialog ─────────────────────────────────────────
const dialog = document.getElementById('feedback-dialog') as HTMLDialogElement | null;
let feedbackStep: { id: string; title: string } | null = null;
let feedbackOpener: HTMLElement | null = null;

function refreshFeedback() {
  if (!dialog || !feedbackStep) return;
  const taskSelect = dialog.querySelector<HTMLSelectElement>('[data-feedback-task]');
  const lines = [`Subject: ${dialog.dataset.subjectPrefix} - ${feedbackStep.id}`, `Step: ${feedbackStep.id} ${feedbackStep.title}`];
  if (taskSelect?.value) lines.push(`Task: ${taskSelect.selectedOptions[0]?.textContent}`);
  lines.push(`Partner: ${dialog.dataset.partner}`, 'Company: ', 'Feedback: ');
  const ta = dialog.querySelector<HTMLTextAreaElement>('[data-feedback-text]');
  if (ta) ta.value = lines.join('\n');
}

document.addEventListener('click', (e) => {
  const opener = (e.target as HTMLElement).closest<HTMLElement>('[data-feedback-open]');
  if (!opener || !dialog) return;
  feedbackOpener = opener;
  feedbackStep = { id: opener.dataset.stepId!, title: opener.dataset.stepTitle! };
  const select = dialog.querySelector<HTMLSelectElement>('[data-feedback-task]')!;
  select.length = 1;
  each('article .task[data-task-id]', (t) => {
    if (!isShown(t)) return;
    const text = t.querySelector('.task-text')?.textContent?.trim().replace(/\s+/g, ' ') ?? '';
    select.add(new Option(`${t.dataset.taskId} ${text}`, t.dataset.taskId));
  });
  refreshFeedback();
  dialog.showModal();
});
dialog?.querySelector('[data-feedback-task]')?.addEventListener('change', refreshFeedback);
dialog?.querySelector('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
dialog?.addEventListener('close', () => feedbackOpener?.focus());

// ── Mobile step drawer ──────────────────────────────────────
const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
const nav = document.getElementById('step-nav');
function setNav(open: boolean) {
  root.classList.toggle('nav-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  if (open) nav?.querySelector<HTMLElement>('[aria-current="page"], a, button')?.focus();
  else toggle?.focus();
}
toggle?.addEventListener('click', () => setNav(!root.classList.contains('nav-open')));
document.querySelectorAll('[data-nav-close]').forEach((el) => el.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('nav-open')) setNav(false);
  if (e.key === 'Tab' && root.classList.contains('nav-open') && nav) {
    const focusables = [...nav.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter(isShown);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
  }
});
window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => { if (m.matches) root.classList.remove('nav-open'); });

// ── Render loop ─────────────────────────────────────────────
function render() {
  renderPath();
  renderChoices();
  renderTeam();
  renderForm();
  evaluateAuto();
  syncCheckboxes();
  updateProgress();
  updateFilterNotes();
}
document.addEventListener('classa:change', render);
render();
