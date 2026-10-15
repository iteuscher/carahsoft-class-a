// Fails if any built page links to Google Docs or Drive (internal links must never ship).
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2] || 'dist';
const banned = /https?:\/\/(docs|drive)\.google\.com/i;
const hits = [];
const walk = (d) => {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(html|js|json|xml|txt)$/.test(f.name) && banned.test(fs.readFileSync(p, 'utf8'))) hits.push(p);
  }
};
walk(dir);
if (hits.length) {
  console.error(`Forbidden docs.google.com / drive.google.com links found in:\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log('Link check passed: no docs.google.com or drive.google.com links.');
