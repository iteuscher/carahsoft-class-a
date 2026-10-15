// Builds one site per partner and assembles them: the default partner at the root,
// every other partner under /<id>/. Fails if any build fails or a forbidden link appears.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const site = YAML.parse(fs.readFileSync('site.config.yml', 'utf8'));
const partners = (process.env.PARTNERS
  ? process.env.PARTNERS.split(',')
  : fs.readdirSync('content/partners').filter((f) => f.endsWith('.yml')).map((f) => f.replace(/\.yml$/, ''))
).sort((a, b) => (a === site.default_partner ? -1 : b === site.default_partner ? 1 : a.localeCompare(b)));
// Partner IDs become directory names; allow only simple slugs.
for (const id of partners) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`Invalid partner id "${id}": use lowercase letters, digits, and hyphens.`);
}

const stage = '.build';
const dist = 'dist';
fs.rmSync(stage, { recursive: true, force: true });
fs.rmSync(dist, { recursive: true, force: true });

for (const id of partners) {
  console.log(`\n=== Building PARTNER=${id} ===`);
  execFileSync('npx', ['astro', 'build'], {
    stdio: 'inherit',
    env: { ...process.env, PARTNER: id, OUT_DIR: path.join(stage, id) },
  });
}

fs.cpSync(path.join(stage, site.default_partner), dist, { recursive: true });
for (const id of partners) {
  if (id !== site.default_partner) fs.cpSync(path.join(stage, id), path.join(dist, id), { recursive: true });
}
fs.rmSync(stage, { recursive: true, force: true });

execFileSync('node', ['scripts/check-links.mjs', dist], { stdio: 'inherit' });
console.log(`\nBuilt ${partners.length} site(s) into ${dist}/: ${partners.map((p) => (p === site.default_partner ? '/' : `/${p}/`)).join(', ')}`);
