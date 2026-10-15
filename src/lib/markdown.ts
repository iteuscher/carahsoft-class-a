// Step body rendering. Bodies are rendered here (not by Astro's markdown pipeline) so the
// plugins can see the step, partner, and path overlays.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import { config, href, resolveKey, rule, ruleExists, type Partner } from './site';
import type { ResolvedPath } from './content';
import { stepHref } from './content';

export interface RenderContext {
  stepId: string;
  partner: Partner;
  paths: ResolvedPath[];
  stepIds: Set<string>;
  taskIds: Map<string, string>; // task ID -> step ID
}

const RULE_ID = /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/;

// Callout headers that name a FedRAMP source rather than a rule ID.
const NAMED_SOURCES: Record<string, () => { label: string; url: string }> = {
  'Class A Self Check': () => ({
    label: 'FedRAMP Class A Self Check',
    url: config.fedramp_forms.class_a_self_check,
  }),
};

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function disabledTemplateButton() {
  return '<button type="button" class="btn btn-secondary btn-sm" disabled>Template coming soon</button>';
}

/** Replace {{partner.*}}, {{templates.*}}, {{fedramp_forms.*}}; drop the partner section when standalone. */
function preprocess(src: string, ctx: RenderContext): string {
  const { partner } = ctx;
  if (partner.standalone || !partner.intro) {
    // Remove a heading that mentions {{partner.…}} and everything up to the next heading of the same or higher level.
    const lines = src.split('\n');
    const out: string[] = [];
    let skipLevel = 0;
    for (const line of lines) {
      const h = line.match(/^(#{1,6})\s/);
      if (skipLevel && h && h[1].length <= skipLevel) skipLevel = 0;
      if (!skipLevel && h && line.includes('{{partner.')) {
        skipLevel = h[1].length;
        continue;
      }
      if (!skipLevel) out.push(line);
    }
    src = out.join('\n');
  }
  src = src.replace(/^\{\{task_legend\}\}$/m, () => legendHtml());
  src = src.replace(/\{\{partner\.name\}\}/g, partner.name).replace(/\{\{partner\.intro\}\}/g, partner.intro ?? '');

  // Markdown link whose target is a config key: [text]({{templates.cpo}})
  src = src.replace(/\[([^\]]+)\]\(\{\{\s*((?:templates|fedramp_forms)\.[\w-]+)\s*\}\}\)/g, (_, text, key) => {
    const r = resolveKey(key);
    return r.url ? `[${text}](${r.url})` : disabledTemplateButton();
  });
  // Bare key: render a button.
  src = src.replace(/\{\{\s*((?:templates|fedramp_forms)\.[\w-]+)\s*\}\}/g, (_, key) => {
    const r = resolveKey(key);
    return r.url
      ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(r.url)}">${escapeHtml(r.label)}</a>`
      : disabledTemplateButton();
  });
  const left = src.match(/\{\{[^}]*\}\}/);
  if (left) throw new Error(`${ctx.stepId}: unresolved placeholder ${left[0]} in step body.`);
  return src;
}

/** Annotated example task for CA-00. One line of HTML so markdown keeps it as a single block. */
function legendHtml(): string {
  const chip = (cls: string, text: string) => `<span class="chip ${cls}">${text}</span>`;
  const example = [
    '<figure class="legend-example"><figcaption class="eyebrow">Example task</figcaption>',
    '<div class="task" aria-hidden="true"><span class="fake-box"></span><div class="task-body">',
    '<div class="task-head"><span class="task-id">CA-03.2</span><span class="task-text">Confirm an agency use case</span></div>',
    '<p class="task-done-when"><b>Done when:</b> You can name a direct or indirect agency use</p>',
    `<div class="task-meta">${chip('chip-role', 'Jordan Lee')}${chip('chip-ahead', 'Do ahead')}${chip('chip-info', 'Lead time: 1–2 business days')}<span class="rule-chip">MKT-IIP-AGU</span>${chip('chip-new', 'New')}</div>`,
    '</div></div></figure>',
  ].join('');
  const rows: [string, string][] = [
    ['<span class="fake-box" aria-hidden="true"></span> Checkbox', 'Tick it when the task is done. Some tasks check themselves when you fill in what they ask for; those say "Checks itself".'],
    ['<span class="task-id">CA-03.2</span> Task ID', 'A stable reference. Use it when you ask a question or send feedback.'],
    ['<b>Done when</b>', 'How you know the task is finished.'],
    [`${chip('chip-role', 'Jordan Lee')} Owner`, 'Who owns the task. Shows the role (Lead, Tech, Sponsor, and so on) until you type names in CA-04.'],
    [chip('chip-ahead', 'Do ahead'), 'Can be done early, before a workshop day or before your workspace exists.'],
    [chip('chip-info', 'Lead time'), 'Involves waiting on someone else. Start it early.'],
    ['<span class="rule-chip">MKT-IIP-AGU</span> Rule', 'The FedRAMP rule the task satisfies. Opens the rule on fedramp.gov.'],
    [chip('chip-new', 'New'), 'Added since your last visit.'],
    [chip('chip-info', 'Optional'), 'On a step: you can skip it if it doesn\'t apply.'],
    ['<span class="callout-label">FedRAMP rule</span>', 'Grey panels quote FedRAMP word for word, with a link to the source.'],
  ];
  const dl = `<dl class="legend no-link">${rows.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join('')}</dl>`;
  return example + dl;
}

/** `[Draft]` marks the rest of its paragraph as draft wording. The marker itself is never shown. */
function remarkDraft() {
  return (tree: any) => {
    visit(tree, 'paragraph', (node: any) => {
      const idx = node.children.findIndex((c: any) => c.type === 'text' && c.value.includes('[Draft]'));
      if (idx < 0) return;
      const t = node.children[idx];
      const pos = t.value.indexOf('[Draft]');
      const before = t.value.slice(0, pos);
      const after = t.value.slice(pos + '[Draft]'.length).replace(/^\s+/, '');
      if (idx === 0 && before.trim() === '') {
        t.value = after;
        node.data = { ...node.data, hProperties: { className: ['is-draft'] } };
        return;
      }
      const tail = [{ type: 'text', value: after }, ...node.children.slice(idx + 1)];
      node.children = [
        ...node.children.slice(0, idx),
        { type: 'text', value: before },
        { type: 'draftSpan', data: { hName: 'span', hProperties: { className: ['is-draft'] } }, children: tail },
      ];
    });
  };
}

function captionNode(label: string, url: string, name?: string) {
  const children: any[] = [
    {
      type: 'link',
      url,
      children: [{ type: 'text', value: label }],
      data: { hProperties: { className: ['callout-label'] } },
    },
  ];
  if (name) {
    children.push({
      type: 'calloutName',
      data: { hName: 'span', hProperties: { className: ['callout-name'] } },
      children: [{ type: 'text', value: name }],
    });
  }
  return { type: 'calloutCaption', data: { hName: 'figcaption' }, children };
}

/** `> [!FEDRAMP] RULE-ID` blockquotes become labeled, linked callouts. Inner text is left verbatim. */
function remarkFedrampCallouts(ctx: RenderContext) {
  return (tree: any) => {
    visit(tree, 'blockquote', (node: any, index: number | undefined, parent: any) => {
      const first = node.children[0];
      const text = first?.type === 'paragraph' ? first.children[0] : null;
      if (!text || text.type !== 'text' || !text.value.startsWith('[!FEDRAMP]')) return;
      const nl = text.value.indexOf('\n');
      const header = (nl < 0 ? text.value : text.value.slice(0, nl)).replace('[!FEDRAMP]', '').trim();
      text.value = nl < 0 ? '' : text.value.slice(nl + 1);
      if (!text.value) first.children.shift();
      if (!first.children.length) node.children.shift();

      let label: string;
      let url: string;
      let name: string | undefined;
      let ruleId: string | undefined;
      const m = header.match(/^(\S+)(?:\s+\(([^)]+)\))?$/);
      if (m && RULE_ID.test(m[1])) {
        ruleId = m[1];
        if (!ruleExists(ruleId)) {
          throw new Error(`${ctx.stepId}: callout cites unknown FedRAMP rule ID "${ruleId}". Add it to content/rules.yml.`);
        }
        const r = rule(ruleId);
        label = `FedRAMP rule ${ruleId}${m[2] ? ` (${m[2]})` : ''}`;
        url = r.url;
        name = r.name;
      } else if (Object.hasOwn(NAMED_SOURCES, header)) {
        ({ label, url } = NAMED_SOURCES[header]());
      } else {
        throw new Error(`${ctx.stepId}: callout header "[!FEDRAMP] ${header}" is not a known rule ID or FedRAMP source.`);
      }

      // Path overlays that quote their own wording of this rule replace the base callout.
      const overlays = ruleId && !m?.[2] ? ctx.paths.filter((p) => p.fedrampRule?.id === ruleId) : [];
      const baseProps: Record<string, string | string[]> = { className: ['callout'] };
      if (overlays.length) {
        baseProps['data-paths'] = ctx.paths.filter((p) => !overlays.includes(p)).map((p) => p.id).join(' ');
      }
      const figure = {
        type: 'callout',
        data: { hName: 'figure', hProperties: baseProps },
        children: [
          captionNode(label, url, name),
          { type: 'blockquote', children: node.children, data: { hProperties: { cite: url } } },
        ],
      };
      const extra: any[] = [];
      const byText = new Map<string, ResolvedPath[]>();
      for (const p of overlays) byText.set(p.fedrampRule!.text, [...(byText.get(p.fedrampRule!.text) ?? []), p]);
      for (const [quote, ps] of byText) {
        const quoteTree = unified().use(remarkParse).use(remarkGfm).parse(quote) as any;
        extra.push({
          type: 'callout',
          data: { hName: 'figure', hProperties: { className: ['callout'], 'data-paths': ps.map((p) => p.id).join(' ') } },
          children: [
            captionNode(label, url, `${name} (${ps.map((p) => p.label).join(', ')})`),
            { type: 'blockquote', children: quoteTree.children, data: { hProperties: { cite: url } } },
          ],
        });
      }
      parent.children.splice(index!, 1, figure, ...extra);
      return [SKIP, index! + 1 + extra.length];
    });
  };
}

function el(tagName: string, properties: Record<string, any>, children: any[] = []) {
  return { type: 'element', tagName, properties, children };
}
const txt = (value: string) => ({ type: 'text', value });

function hastText(node: any): string {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(hastText).join('');
}

/** Copy buttons on code blocks, scrollable tables, external-link hints, step-ID links. */
function rehypeEnhance(ctx: RenderContext) {
  let n = 0;
  return (tree: any) => {
    visit(tree, 'element', (node: any, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;

      if (node.tagName === 'pre') {
        const code = hastText(node).replace(/\n$/, '');
        const blocks: any[] = [];
        const auditPaths = ctx.stepId === 'CA-13' && code.startsWith('Plan:')
          ? ctx.paths.filter((p) => p.auditTemplate)
          : [];
        const makeBlock = (content: string, paths?: string[]) => {
          const id = `code-${ctx.stepId}-${++n}`;
          const props: Record<string, any> = { className: ['code-block'] };
          if (paths) props['data-paths'] = paths.join(' ');
          return el('div', props, [
            el('pre', { id, tabIndex: 0 }, [el('code', {}, [txt(content)])]),
            el('button', { type: 'button', className: ['btn', 'btn-secondary', 'btn-sm', 'copy-btn'], dataCopyFrom: id }, [txt('Copy')]),
          ]);
        };
        if (auditPaths.length) {
          blocks.push(makeBlock(code, ctx.paths.filter((p) => !p.auditTemplate).map((p) => p.id)));
          const byText = new Map<string, string[]>();
          for (const p of auditPaths) byText.set(p.auditTemplate!.trimEnd(), [...(byText.get(p.auditTemplate!.trimEnd()) ?? []), p.id]);
          for (const [t, ids] of byText) blocks.push(makeBlock(t, ids));
        } else {
          blocks.push(makeBlock(code));
        }
        parent.children.splice(index, 1, ...blocks);
        return [SKIP, index + blocks.length];
      }

      if (node.tagName === 'table') {
        const th = hastText(node).trim().split('\n')[0] ?? '';
        const first = (function find(n: any): any {
          if (n.tagName === 'th') return n;
          for (const c of n.children ?? []) { const f = find(c); if (f) return f; }
          return null;
        })(node);
        const label = first ? `Table: ${hastText(first).trim()}` : th || 'Table';
        parent.children.splice(index, 1, el('div', { className: ['table-wrap'], role: 'region', tabIndex: 0, ariaLabel: label }, [node]));
        return [SKIP, index + 1];
      }

      if (node.tagName === 'img' && typeof node.properties.src === 'string' && node.properties.src.startsWith('/')) {
        node.properties.src = href(node.properties.src);
        node.properties.loading = 'lazy';
        return SKIP;
      }

      if (node.tagName === 'a' && /^https?:\/\//.test(node.properties.href ?? '')) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
        node.children.push(el('span', { className: ['sr-only'] }, [txt(' (opens in a new tab)')]));
        return SKIP;
      }
    });

    // Link bare step and task IDs (CA-15, CA-11.1) to their pages. Never inside links, code,
    // buttons, or FedRAMP callouts (their text is verbatim).
    const NO_LINK = new Set(['a', 'code', 'pre', 'figure', 'button', 'script', 'style']);
    const linkify = (node: any, skip: boolean) => {
      if (!node.children) return;
      const next: any[] = [];
      for (const c of node.children) {
        if (c.type === 'text' && !skip) {
          next.push(...(linkIdsToHast(c.value, ctx) ?? [c]));
          continue;
        }
        if (c.type === 'element') linkify(c, skip || NO_LINK.has(c.tagName) || (c.properties?.className ?? []).includes('no-link'));
        next.push(c);
      }
      node.children = next;
    };
    linkify(tree, false);
  };
}

// Step IDs (CA-15), task IDs (CA-11.1), and FedRAMP rule IDs (FRC-CSO-PKG) in our own copy.
const ID_PATTERN = /\bCA-\d{2}(?:\.\d+)?\b|\b[A-Z]{3}-[A-Z]{3}-[A-Z]{3}\b/g;

function idTarget(id: string, ctx: Pick<RenderContext, 'stepIds' | 'taskIds'>): { url: string; external: boolean } | null {
  if (ctx.stepIds.has(id)) return { url: href(stepHref(id)), external: false };
  const stepId = ctx.taskIds.get(id);
  if (stepId) return { url: `${href(stepHref(stepId))}#task-${id}`, external: false };
  if (ruleExists(id)) return { url: rule(id).url, external: true };
  return null;
}

function linkIdsToHast(value: string, ctx: RenderContext) {
  const out: any[] = [];
  let last = 0;
  for (const m of value.matchAll(ID_PATTERN)) {
    const target = idTarget(m[0], ctx);
    if (!target) continue;
    out.push(txt(value.slice(last, m.index)));
    out.push(
      target.external
        ? el('a', { href: target.url, className: ['id-link'], target: '_blank', rel: ['noopener', 'noreferrer'] }, [
            txt(m[0]),
            el('span', { className: ['sr-only'] }, [txt(' (opens in a new tab)')]),
          ])
        : el('a', { href: target.url, className: ['id-link'] }, [txt(m[0])]),
    );
    last = m.index! + m[0].length;
  }
  if (!out.length) return null;
  out.push(txt(value.slice(last)));
  return out.filter((n) => n.type !== 'text' || n.value);
}

/** Escape a plain string and link step, task, and rule IDs in it. For task text, done-when lines, notes. */
export function inlineText(value: string, ctx: Pick<RenderContext, 'stepIds' | 'taskIds'>): string {
  let out = '';
  let last = 0;
  for (const m of value.matchAll(ID_PATTERN)) {
    const target = idTarget(m[0], ctx);
    if (!target) continue;
    out += escapeHtml(value.slice(last, m.index));
    out += target.external
      ? `<a class="id-link" href="${escapeHtml(target.url)}" target="_blank" rel="noopener noreferrer">${m[0]}<span class="sr-only"> (opens in a new tab)</span></a>`
      : `<a class="id-link" href="${escapeHtml(target.url)}">${m[0]}</a>`;
    last = m.index! + m[0].length;
  }
  return out + escapeHtml(value.slice(last));
}

export function renderBody(src: string, ctx: RenderContext): string {
  const processed = preprocess(src, ctx);
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDraft)
    .use(remarkFedrampCallouts, ctx)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeEnhance, ctx)
    .use(rehypeStringify)
    .processSync(processed);
  return String(file);
}

/** Small markdown snippets (path notes, workshop copy) without callout handling. */
export function renderSnippet(src: string, ctx: RenderContext): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDraft)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeEnhance, ctx)
    .use(rehypeStringify)
    .processSync(src);
  return String(file);
}

