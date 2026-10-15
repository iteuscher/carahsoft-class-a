// CA-04 team names and contacts; names shown on task chips; the header Show filter.
import { allPeople, announce, changed, contactFor, manifest, namesFor, save, state, type Contact } from './state';

// ── CA-04 name entry ────────────────────────────────────────
function renderRows() {
  document.querySelectorAll<HTMLElement>('[data-team-role]').forEach((row) => {
    const role = row.dataset.teamRole!;
    const list = row.querySelector<HTMLUListElement>('[data-name-list]')!;
    const names = state.team.roles[role] ?? [];
    list.replaceChildren(
      ...names.map((name) => {
        const li = document.createElement('li');
        li.className = 'name-chip';
        const text = document.createElement('span');
        text.textContent = name;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'name-remove';
        btn.dataset.removeName = name;
        btn.setAttribute('aria-label', `Remove ${name} from ${role}`);
        btn.textContent = '×';
        li.append(text, btn);
        return li;
      }),
    );
    list.hidden = names.length === 0;
    const empty = row.querySelector<HTMLElement>('[data-name-empty]');
    if (empty) empty.hidden = names.length > 0;
  });
  const datalist = document.getElementById('team-names');
  if (datalist) {
    datalist.replaceChildren(...allPeople().map((p) => Object.assign(document.createElement('option'), { value: p.name })));
  }
  document.querySelectorAll<HTMLInputElement>('[data-contact-field]').forEach((input) => {
    const which = input.closest<HTMLElement>('[data-contact]')!.dataset.contact as 'partner' | 'paramify';
    const field = input.dataset.contactField as keyof Contact;
    if (document.activeElement !== input) input.value = contactFor(which)[field] ?? '';
  });
}

function addName(row: HTMLElement) {
  const input = row.querySelector<HTMLInputElement>('[data-name-input]')!;
  const role = row.dataset.teamRole!;
  const names = input.value.split(',').map((n) => n.trim()).filter(Boolean);
  if (!names.length) return;
  const list = (state.team.roles[role] ??= []);
  for (const n of names) if (!list.some((x) => x.toLowerCase() === n.toLowerCase())) list.push(n);
  input.value = '';
  save('team');
  changed();
  announce(`Added ${names.join(', ')} to ${role}.`);
  input.focus();
}

document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  const add = t.closest<HTMLElement>('[data-name-add]');
  if (add) addName(add.closest<HTMLElement>('[data-team-role]')!);
  const remove = t.closest<HTMLButtonElement>('[data-remove-name]');
  if (remove) {
    const row = remove.closest<HTMLElement>('[data-team-role]')!;
    const role = row.dataset.teamRole!;
    const name = remove.dataset.removeName!;
    state.team.roles[role] = (state.team.roles[role] ?? []).filter((n) => n !== name);
    save('team');
    changed();
    announce(`Removed ${name} from ${role}.`);
    row.querySelector<HTMLInputElement>('[data-name-input]')?.focus();
  }
});

document.addEventListener('keydown', (e) => {
  const input = e.target as HTMLInputElement;
  if (!input.matches?.('[data-name-input]')) return;
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    addName(input.closest<HTMLElement>('[data-team-role]')!);
  }
});

document.addEventListener('input', (e) => {
  const input = e.target as HTMLInputElement;
  if (!input.matches?.('[data-contact-field]')) return;
  const which = input.closest<HTMLElement>('[data-contact]')!.dataset.contact as 'partner' | 'paramify';
  const contact = (state.team.contacts[which] ??= {});
  contact[input.dataset.contactField as keyof Contact] = input.value;
  save('team');
  changed();
});

// ── Names on task chips ─────────────────────────────────────
function applyNames() {
  document.querySelectorAll<HTMLElement>('[data-role-chip]').forEach((chip) => {
    const role = chip.dataset.roleChip!;
    const names = namesFor(role);
    const text = chip.querySelector<HTMLElement>('[data-role-text]');
    const sr = chip.querySelector<HTMLElement>('[data-role-sr]');
    if (text) text.textContent = names.length ? names.join(', ') : role;
    if (sr) sr.textContent = names.length ? `${role}: ` : 'Role: ';
    chip.title = names.length ? role : '';
    chip.classList.toggle('has-name', names.length > 0);
  });
}

// ── Show filter (header) ────────────────────────────────────
const select = () => document.querySelector<HTMLSelectElement>('[data-show-select]');

export function rolesForShow(show: string | undefined): string[] | null {
  if (!show || show === 'all') return null;
  if (show.startsWith('role:')) return [show.slice(5)];
  if (show.startsWith('person:')) return allPeople().find((p) => p.name === show.slice(7))?.roles ?? null;
  return null;
}

export function showLabel(): string | null {
  const show = state.prefs.show;
  if (!show || show === 'all') return null;
  if (show.startsWith('role:')) return `${show.slice(5)} tasks`;
  const person = allPeople().find((p) => p.name === show.slice(7));
  return person ? `tasks for ${person.name} (${person.roles.join(', ')})` : null;
}

function applyShow() {
  let roles = rolesForShow(state.prefs.show);
  if (!roles && state.prefs.show && state.prefs.show !== 'all') {
    // The person was removed from the team: fall back to everything.
    state.prefs.show = 'all';
  }
  roles = rolesForShow(state.prefs.show);
  const style = document.getElementById('show-style')!;
  style.textContent = roles?.length
    ? `[data-roles]${roles.map((r) => `:not([data-roles~="${r}"])`).join('')}{display:none!important}`
    : '';
  if (JSON.stringify(state.prefs.showRoles ?? null) !== JSON.stringify(roles)) {
    state.prefs.showRoles = roles ?? undefined;
    save('prefs');
  }
}

function renderShowSelect() {
  const sel = select();
  if (!sel) return;
  let group = sel.querySelector<HTMLOptGroupElement>('optgroup[data-people]');
  const people = allPeople();
  if (!group) {
    group = document.createElement('optgroup');
    group.label = 'People';
    group.dataset.people = '';
    sel.insertBefore(group, sel.querySelector('optgroup'));
  }
  group.replaceChildren(...people.map((p) => new Option(p.name, `person:${p.name}`)));
  group.hidden = people.length === 0;
  sel.value = state.prefs.show ?? 'all';
  if (sel.value === '') sel.value = 'all';
}

select()?.addEventListener('change', () => {
  state.prefs.show = select()!.value;
  save('prefs');
  changed();
  const label = showLabel();
  announce(label ? `Showing ${label}.` : 'Showing all tasks.');
});

export function renderTeam() {
  renderRows();
  applyNames();
  renderShowSelect();
  applyShow();
}

export const teamComplete = () => manifest.cspRoles.every((r) => (state.team.roles[r] ?? []).some(Boolean));
