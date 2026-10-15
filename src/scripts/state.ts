// Shared browser state. Everything lives in this browser (localStorage); nothing is sent anywhere.
import type { FormData, FormDef } from '../lib/form-logic';

export type Auto = 'path_chosen' | 'team_named' | { cpo: string[] };
export interface ManifestItem { id: string; paths: string[]; choice?: { id: string; value: string }; auto?: Auto }
export interface Manifest {
  storageKey: string;
  paths: { id: string; label: string }[];
  defaultPath: string;
  roles: string[];
  cspRoles: string[];
  steps: { id: string; title: string; tasks: ManifestItem[] }[];
  choices: { id: string; options: { id: string; label: string }[] }[];
  cpo: FormDef;
  teamDefaults: { partner: Contact; paramify: Contact; partnerName: string; standalone: boolean };
}
export interface Contact { name?: string; email?: string; phone?: string }
export interface Team { roles: Record<string, string[]>; contacts: { partner?: Contact; paramify?: Contact } }
export interface Prefs {
  path?: string;
  pathChosen?: boolean;
  show?: string; // 'all' | 'role:Lead' | 'person:Jane Doe'
  showRoles?: string[];
  choices?: Record<string, string>;
}

export const manifest: Manifest = JSON.parse(document.getElementById('site-manifest')!.textContent || '{}');
export const KEY = manifest.storageKey;
export const root = document.documentElement;

const area = (name: 'localStorage' | 'sessionStorage') => {
  try { return window[name]; } catch { return undefined; }
};
export const local = area('localStorage');
export const session = area('sessionStorage');

export function get(store: Storage | undefined, k: string): string | null {
  try { return store ? store.getItem(k) : null; } catch { return null; }
}
export function set(store: Storage | undefined, k: string, v: string) {
  try { store?.setItem(k, v); } catch { /* storage blocked: state just won't persist */ }
}
function readJson<T>(k: string, fallback: T): T {
  try {
    const v = JSON.parse(get(local, k) || 'null');
    return v && typeof v === 'object' ? v : fallback;
  } catch { return fallback; }
}

const keys = { progress: KEY, prefs: `${KEY}:prefs`, team: `${KEY}:team`, cpo: `${KEY}:cpo` };

export const state = {
  progress: readJson<{ done: Record<string, string> }>(keys.progress, { done: {} }),
  prefs: readJson<Prefs>(keys.prefs, {}),
  team: readJson<Team>(keys.team, { roles: {}, contacts: {} }),
  cpo: readJson<FormData>(keys.cpo, { values: {}, repeats: {} }),
};
if (typeof state.progress.done !== 'object') state.progress.done = {};
state.team.roles ??= {};
state.team.contacts ??= {};
state.cpo.values ??= {};
state.cpo.repeats ??= {};

export function save(part: keyof typeof state) {
  set(local, keys[part], JSON.stringify(state[part]));
}

/** Tell every module that state changed (they re-render what they own). */
export function changed() {
  document.dispatchEvent(new CustomEvent('classa:change'));
}

// Another tab changed something: reload it here.
window.addEventListener('storage', (e) => {
  const part = (Object.keys(keys) as (keyof typeof keys)[]).find((p) => keys[p] === e.key);
  if (!part) return;
  (state as any)[part] = readJson(keys[part], (state as any)[part]);
  changed();
});

export const currentPath = () => root.getAttribute('data-path') || manifest.defaultPath;

export function contactFor(which: 'partner' | 'paramify'): Contact {
  const saved = state.team.contacts[which] ?? {};
  const def = manifest.teamDefaults[which];
  return {
    name: saved.name ?? def.name ?? '',
    email: saved.email ?? def.email ?? '',
    phone: saved.phone ?? def.phone ?? '',
  };
}

/** Names assigned to a role: typed in CA-04, or the partner/Paramify contact. */
export function namesFor(role: string): string[] {
  if (role === 'Partner') { const n = contactFor('partner').name; return n ? [n] : []; }
  if (role === 'Paramify') { const n = contactFor('paramify').name; return n ? [n] : []; }
  return (state.team.roles[role] ?? []).filter(Boolean);
}

export function allPeople(): { name: string; roles: string[] }[] {
  const people = new Map<string, string[]>();
  for (const role of manifest.roles) {
    for (const n of namesFor(role)) people.set(n, [...(people.get(n) ?? []), role]);
  }
  return [...people].map(([name, roles]) => ({ name, roles })).sort((a, b) => a.name.localeCompare(b.name));
}

const live = () => document.querySelector<HTMLElement>('[data-live]');
export function announce(msg: string) {
  const el = live();
  if (!el) return;
  el.textContent = '';
  window.setTimeout(() => (el.textContent = msg), 50);
}

export const isShown = (el: Element) => el.getClientRects().length > 0;
