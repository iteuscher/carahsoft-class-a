// Content collections. The schema mirrors the frontmatter in content/ and is strict:
// unknown keys, unknown rule IDs, unknown roles, and unknown paths fail the build.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const root = process.cwd();
const rulesFile = YAML.parse(fs.readFileSync(path.join(root, 'content/rules.yml'), 'utf8'));
const ruleIds = Object.keys(rulesFile.rules) as [string, ...string[]];
const pathIds = fs
  .readdirSync(path.join(root, 'content/paths'))
  .filter((f) => f.endsWith('.yml'))
  .map((f) => f.replace(/\.yml$/, '')) as [string, ...string[]];

export const ROLES = ['Sponsor', 'Lead', 'Tech', 'SecOps', 'Comms', 'Partner', 'Paramify'] as const;

// superRefine (not refine) so the message can name the bad value under Zod 4.
const ruleId = z.string().superRefine((id, ctx) => {
  if (!ruleIds.includes(id)) {
    ctx.addIssue({ code: 'custom', message: `Unknown FedRAMP rule ID "${id}". Add it to content/rules.yml or fix the typo.` });
  }
});
const pathId = z.enum(pathIds);
const taskId = z.string().regex(/^CA-\d{2}\.\d+$/, 'Task IDs look like CA-03.2');
// "Partner, Lead" holds several roles.
const roleList = z.string().superRefine((s, ctx) => {
  if (!s.split(',').every((r) => (ROLES as readonly string[]).includes(r.trim()))) {
    ctx.addIssue({ code: 'custom', message: `Unknown role in "${s}". Roles: ${ROLES.join(', ')}` });
  }
});
const isoDate = z.union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).transform((d) =>
  d instanceof Date ? d.toISOString().slice(0, 10) : d,
);
const pending = z.literal('pending');

const task = z
  .object({
    id: taskId,
    text: z.string(),
    // Optional so draft tasks can be unowned while ownership is decided; they show "Owner TBD".
    role: roleList.optional(),
    done_when: z.string(),
    // A small pointer shown above "Done when", e.g. where on the page to find help for this task.
    help: z.string().optional(),
    // Optional tasks show an "Optional" chip and don't count toward step progress.
    optional: z.boolean().optional(),
    ahead: z.boolean().default(false),
    lead_time: z.string().optional(),
    rules: z.array(ruleId).optional(),
    link: z.string().url().optional(),
    // Button text for `link`, so a support article reads as what it is instead of "Open link".
    link_label: z.string().optional(),
    link_key: z.string().optional(),
    template: z.string().optional(),
    draft: z.boolean().optional(),
    review: pending.optional(),
    added: isoDate.optional(),
    paths: z.array(pathId).optional(),
    variant: z.string().optional(), // must match an option of the step's `choice`
    source: z.string().optional(),
    // Checks itself: when a path is chosen, every CA-04 role has a name, or CPO form sections are complete.
    complete_when: z
      .union([z.literal('path_chosen'), z.literal('team_named'), z.object({ cpo: z.array(z.string()).min(1) }).strict()])
      .optional(),
    // CPO form fields typed directly in the task (shared with the form).
    inputs: z
      .array(z.object({ field: z.string(), label: z.string().optional(), placeholder: z.string().optional() }).strict())
      .optional(),
    widget: z.literal('path_choice').optional(),
  })
  .strict();

const recurring = z
  .object({
    id: taskId,
    text: z.string(),
    cadence: z.string(),
    role: roleList,
    rules: z.array(ruleId).optional(),
    link_key: z.string().optional(),
    draft: z.boolean().optional(),
    review: pending.optional(),
    added: isoDate.optional(),
    paths: z.array(pathId).optional(),
  })
  .strict();

const steps = defineCollection({
  loader: glob({ pattern: 'CA-*.md', base: './content/steps' }),
  schema: z
    .object({
      id: z.string().regex(/^CA-\d{2}$/),
      title: z.string(),
      phase: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      sequence: z.number().int().nonnegative(),
      summary: z.string(),
      optional: z.boolean().optional(),
      gate_after: z.string().optional(),
      // Things done for the vendor at this gate, listed (not checkable, not counted) above gate_after.
      gate_done_for_you: z.array(z.string()).optional(),
      review: pending.optional(),
      // A per-viewer choice that hides tasks whose `variant` doesn't match (e.g. email platform in CA-05).
      choice: z
        .object({
          id: z.string().regex(/^[a-z][a-z0-9_]*$/),
          question: z.string(),
          hint: z.string().optional(),
          options: z.array(z.object({ id: z.string().regex(/^[a-z][a-z0-9_]*$/), label: z.string() }).strict()).min(2),
        })
        .strict()
        .optional(),
      cpo_sections: z.array(z.string()).default([]),
      rules: z.array(ruleId).default([]),
      tasks: z.array(task).default([]),
      resources: z
        .array(
          z
            .object({
              title: z.string(),
              url: z.string().url(),
              type: z.enum(['blog', 'video', 'help', 'fedramp', 'form', 'trust']),
            })
            .strict(),
        )
        .default([]),
      prompts: z
        .array(z.object({ title: z.string(), caution: z.string(), text: z.string() }).strict())
        .default([]),
      form: z
        .object({
          title: z.string(),
          confirm_note: z.string().optional(),
          fields: z.array(
            z
              .object({
                field: z.string(),
                value: z.string(),
                fedramp_note: z.string().optional(),
                draft: z.boolean().optional(),
                review: pending.optional(),
              })
              .strict(),
          ),
        })
        .strict()
        .optional(),
      checklists: z
        .array(
          z
            .object({
              id: z.string(),
              title: z.string(),
              source: z.string().optional(),
              items: z.array(z.object({ id: z.string(), text: z.string() }).strict()),
            })
            .strict(),
        )
        .default([]),
      roles: z
        .array(
          z.object({ id: z.enum(ROLES), title: z.string(), owns: z.string() }).strict(),
        )
        .default([]),
      ksis: z
        .array(
          z.object({ id: ruleId, statement: z.string(), soc2_gap: z.string().optional() }).strict(),
        )
        .default([]),
      procedures: z
        .array(z.object({ title: z.string(), steps: z.array(z.string()) }).strict())
        .default([]),
      recurring: z.array(recurring).default([]),
      keeping_current: z
        .array(
          z
            .object({
              when: z.string(),
              update: z.string(),
              note: z.string().default(''),
              draft: z.boolean().optional(),
              review: pending.optional(),
            })
            .strict(),
        )
        .default([]),
    })
    .strict(),
});

const override = z
  // optional: a path can make an optional task required (or the reverse), e.g. GovRAMP's Security Assessment Plan.
  .object({ text: z.string().optional(), done_when: z.string().optional(), draft: z.boolean().optional(), optional: z.boolean().optional() })
  .strict();

const paths = defineCollection({
  loader: glob({ pattern: '*.yml', base: './content/paths' }),
  schema: z
    .object({
      id: pathId,
      label: z.string(),
      default: z.boolean().optional(),
      inherits: pathId.optional(),
      description: z.string(),
      fedramp_rule: z.object({ id: ruleId, text: z.string() }).strict().optional(),
      overrides: z.record(taskId, override).default({}),
      hide: z.array(taskId).default([]),
      show: z.array(taskId).default([]),
      notes: z
        .array(
          z
            .object({
              title: z.string(),
              text: z.string(),
              fedramp: z.boolean().optional(),
              url: z.string().url().optional(),
              review: pending.optional(),
              draft: z.boolean().optional(),
            })
            .strict(),
        )
        .default([]),
      ksi_gap_column: z.enum(['soc2_gap', 'related_controls']).optional(),
      audit_template: z.string().optional(),
    })
    .strict(),
});

const partners = defineCollection({
  loader: glob({ pattern: '*.yml', base: './content/partners' }),
  schema: z
    .object({
      id: z.string(),
      name: z.string(),
      standalone: z.boolean(),
      logo: z.string().nullable().optional(),
      logo_on_dark: z.string().nullable().optional(),
      intro: z.string().optional(),
      intro_source: z.string().optional(),
      powered_by: z.boolean(),
      contact: z
        .object({ name: z.string(), email: z.string(), booking_url: z.string() })
        .partial()
        .strict()
        .default({}),
      theme: z.object({ primary: z.string().optional() }).strict().default({}),
    })
    .strict(),
});

const condition = z.object({ field: z.string(), equals: z.string() }).strict();
const option = z.union([z.string(), z.object({ value: z.string(), label: z.string() }).strict()]);
const field = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9_]*$/),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'url', 'email', 'tel', 'date', 'select', 'radio', 'checkboxes', 'fixed']),
    required: z.boolean().optional(),
    required_if: condition.optional(),
    show_if: condition.optional(),
    later: z.string().regex(/^CA-\d{2}$/).optional(),
    rule: ruleId.optional(),
    hint: z.string().optional(),
    placeholder: z.string().optional(),
    // Placeholder that changes with another field's value, e.g. one example per framework.
    placeholder_by: z.object({ field: z.string(), values: z.record(z.string(), z.string()) }).strict().optional(),
    pattern: z.string().optional(),
    pattern_hint: z.string().optional(),
    options: z.array(option).optional(),
    max: z.number().int().positive().optional(),
    max_age_months: z.number().int().positive().optional(),
    default: z.string().optional(),
    default_from: z.literal('path').optional(),
    preview: z.boolean().optional(),
    prompt_hint: z.string().optional(),
    review: pending.optional(),
  })
  .strict();
const heading = z.object({ heading: z.string() }).strict();
const repeat = z
  .object({
    repeat: z.string().regex(/^[a-z][a-z0-9_]*$/),
    label: z.string(),
    add_label: z.string(),
    min: z.number().int().nonnegative().default(0),
    prompt: z.boolean().optional(),
    prompt_label: z.string().optional(),
    items: z.array(field),
  })
  .strict();

const forms = defineCollection({
  loader: glob({ pattern: '*.yml', base: './content/forms' }),
  schema: z
    .object({
      id: z.string(),
      title: z.string(),
      sections: z.array(
        z
          .object({
            id: z.string().regex(/^[a-z][a-z0-9_]*$/),
            number: z.number().int(),
            title: z.string(),
            step: z.string().regex(/^CA-\d{2}$/),
            optional: z.boolean().optional(),
            prompt: z.boolean().optional(),
            intro: z.string().optional(),
            items: z.array(z.union([field, heading, repeat])),
          })
          .strict(),
      ),
    })
    .strict(),
});

export const collections = { steps, paths, partners, forms };
