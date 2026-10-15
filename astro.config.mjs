// Static build. PARTNER=<id> themes the site; non-default partners build into /<id>/.
// BASE_PATH sets the root (e.g. "/class-a-walkthrough/" for a GitHub Pages project site).
import fs from 'node:fs';
import YAML from 'yaml';
import { defineConfig } from 'astro/config';

const site = YAML.parse(fs.readFileSync('./site.config.yml', 'utf8'));
const partner = process.env.PARTNER || site.default_partner;
const root = `/${(process.env.BASE_PATH || '/').replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/');
const base = partner === site.default_partner ? root : `${root}${partner}/`;

export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base,
  outDir: process.env.OUT_DIR || './dist',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
