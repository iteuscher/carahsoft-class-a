// Site-wide data: config, rule index, partner, and link resolution.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { getCollection } from 'astro:content';

const root = process.cwd();
const readYaml = (p: string) => YAML.parse(fs.readFileSync(path.join(root, p), 'utf8'));

export interface SiteConfig {
  title: string;
  default_partner: string;
  default_path: string;
  progress_storage_key: string;
  feedback: { zendesk_url: string; subject_prefix: string };
  paramify_contact?: { name?: string; email?: string };
  fedramp_forms: Record<string, string>;
  templates: Record<string, string>;
}

export const config: SiteConfig = readYaml('site.config.yml');
const rulesFile: {
  base: Record<string, string>;
  rules: Record<string, { name: string; page: string; anchor?: string }>;
} = readYaml('content/rules.yml');

export const isTodo = (v: unknown) => typeof v === 'string' && v.trim().toUpperCase() === 'TODO';
const blank = (v: unknown) => v == null || v === '' || isTodo(v);

export function rule(id: string) {
  const r = rulesFile.rules[id];
  if (!r) throw new Error(`Unknown FedRAMP rule ID "${id}". Add it to content/rules.yml.`);
  const base = rulesFile.base[r.page];
  if (!base) throw new Error(`Rule ${id} uses unknown page "${r.page}" in content/rules.yml.`);
  return { id, name: r.name, url: r.anchor ? `${base}#${r.anchor}` : base };
}
export const ruleExists = (id: string) => id in rulesFile.rules;

/** Prefix a site-relative path with the build's base. */
export function href(p: string) {
  if (/^https?:\/\//.test(p)) return p;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${p.replace(/^\//, '')}`;
}

// Labels for config-driven links; anything unlisted gets a generic label.
const KEY_LABELS: Record<string, string> = {
  'fedramp_forms.marketplace_listing': 'Marketplace Listing Request Form',
  'fedramp_forms.certification_application': '20x Certification Application Form',
  'fedramp_forms.agency_access_denial': 'Agency Access Denial form',
  'fedramp_forms.json_schema_validator': 'JSON Schema Validator',
  'fedramp_forms.class_a_self_check': 'Class A Self Check',
  'fedramp_forms.sam_entity_registration': 'SAM.gov entity registration',
  'templates.cpo': 'CPO template',
  'templates.ocr': 'Ongoing Certification Report template',
  'templates.incident_report': 'Incident report samples',
  'templates.risk_profile': 'Class A risk profile (.csv)',
  'templates.risk_solution_preset': 'Class A risk solution preset (.csv)',
};

/** Resolve "templates.cpo" / "fedramp_forms.x" against site.config.yml. url is null when TODO. */
export function resolveKey(key: string): { url: string | null; label: string; kind: 'template' | 'form' } {
  const [group, name] = key.split('.');
  if ((group !== 'templates' && group !== 'fedramp_forms') || !name) {
    throw new Error(`Unknown link key "${key}". Use templates.<key> or fedramp_forms.<key>.`);
  }
  const table = config[group] as Record<string, string>;
  if (!(name in table)) throw new Error(`"${key}" is not defined in site.config.yml.`);
  const value = table[name];
  return {
    // Site-relative values (files in public/) get the partner build's base path; full URLs pass through.
    url: blank(value) ? null : value.startsWith('/') ? href(value) : value,
    label: KEY_LABELS[key] ?? (group === 'templates' ? 'Template' : 'Open form'),
    kind: group === 'templates' ? 'template' : 'form',
  };
}

export interface Partner {
  id: string;
  name: string;
  standalone: boolean;
  logo: string;
  logoIsFallback: boolean;
  intro: string | null;
  poweredBy: boolean;
  contact: { name?: string; email?: string; booking_url?: string } | null;
  primary: string | null;
}

const PARAMIFY_LOGO = '/brand/paramify-logo-blue-trimmed.png';

let partnerCache: Partner | null = null;

/** The partner this build is themed for (PARTNER env var). TODO fields fall back to Paramify. */
export async function getPartner(): Promise<Partner> {
  if (partnerCache) return partnerCache;
  const id = process.env.PARTNER || config.default_partner;
  const all = await getCollection('partners');
  const entry = all.find((p) => p.data.id === id);
  if (!entry) {
    throw new Error(`PARTNER="${id}" has no content/partners/${id}.yml. Options: ${all.map((p) => p.data.id).join(', ')}`);
  }
  const fallback = all.find((p) => p.data.id === config.default_partner)!.data;
  const p = entry.data;
  const pick = <T,>(v: T, fb: T) => (blank(v) ? (blank(fb) ? null : fb) : v);
  const logo = pick(p.logo, fallback.logo) ?? PARAMIFY_LOGO;
  const contact = {
    name: pick(p.contact.name, fallback.contact.name) ?? undefined,
    email: pick(p.contact.email, fallback.contact.email) ?? undefined,
    booking_url: pick(p.contact.booking_url, fallback.contact.booking_url) ?? undefined,
  };
  partnerCache = {
    id: p.id,
    name: p.name,
    standalone: p.standalone,
    logo,
    logoIsFallback: blank(p.logo),
    intro: p.intro && !blank(p.intro) ? p.intro : null,
    poweredBy: p.powered_by,
    contact: contact.name || contact.email || contact.booking_url ? contact : null,
    primary: pick(p.theme.primary, fallback.theme.primary) ?? null,
  };
  warnTodos(p);
  return partnerCache;
}

// One build warning listing every unresolved TODO for this partner and the site config.
function warnTodos(p: Record<string, any>) {
  const g = globalThis as any;
  if (g.__classATodoWarned) return;
  g.__classATodoWarned = true;
  const found: string[] = [];
  const walk = (obj: unknown, file: string, at = '') => {
    if (isTodo(obj)) found.push(`${file} ${at}`);
    else if (obj && typeof obj === 'object') {
      for (const [k, v] of Object.entries(obj)) walk(v, file, at ? `${at}.${k}` : k);
    }
  };
  walk(p, `content/partners/${p.id}.yml`);
  walk(config, 'site.config.yml');
  if (found.length) {
    console.warn(
      `\n[class-a] ${found.length} unresolved TODO value(s) (partner fields fall back to Paramify defaults; TODO templates render as "Template coming soon"):\n` +
        found.map((f) => `  - ${f}`).join('\n') +
        '\n',
    );
  }
}
