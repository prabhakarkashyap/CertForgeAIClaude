import { z } from 'zod';

/**
 * Zod schemas for the on-disk certification pack format described in
 * docs/architecture/certification-pack-design.md. Every file under a pack
 * directory is validated independently before cross-file consistency checks
 * run in loader.ts.
 */

export const manifestSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'version must be semver-like, e.g. 1.0.0'),
  status: z.enum(['draft', 'active', 'deprecated']),
  examName: z.string().min(1),
  totalQuestions: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  passingScore: z.number().int().positive().nullable(),
  scoreScale: z
    .object({
      min: z.number().int(),
      max: z.number().int(),
    })
    .nullable(),
  questionTypes: z.array(z.enum(['single_choice', 'multiple_response'])).min(1),
  delivery: z.string().min(1),
  sourceDisclaimer: z.string().min(1),
});
export type ManifestFile = z.infer<typeof manifestSchema>;

export const blueprintSchema = z.object({
  allocationStrategy: z.enum(['largest_remainder']),
  officialSimulation: z.object({
    questionCount: z.number().int().positive(),
    durationMinutes: z.number().int().positive(),
    allowVariance: z.literal(false),
  }),
  practice: z.object({
    allowVariance: z.literal(true),
    questionCountOptions: z.array(z.number().int().positive()).min(1),
  }),
});
export type BlueprintFile = z.infer<typeof blueprintSchema>;

export const domainFileEntrySchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  weightPercent: z.number().positive().max(100),
  targetQuestionCount: z.number().int().nonnegative(),
  minQuestionCount: z.number().int().nonnegative(),
  maxQuestionCount: z.number().int().nonnegative(),
  order: z.number().int().nonnegative(),
});
export const domainsSchema = z.array(domainFileEntrySchema).min(1);
export type DomainFileEntry = z.infer<typeof domainFileEntrySchema>;

export const objectiveFileEntrySchema = z.object({
  domainKey: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  isPlaceholder: z.boolean(),
  order: z.number().int().nonnegative(),
});
export const objectivesSchema = z.array(objectiveFileEntrySchema).min(1);
export type ObjectiveFileEntry = z.infer<typeof objectiveFileEntrySchema>;

export const terminologyEntrySchema = z.object({
  term: z.string().min(1),
  definition: z.string().min(1),
  aliases: z.array(z.string()).default([]),
});
export const terminologySchema = z.array(terminologyEntrySchema);
export type TerminologyEntry = z.infer<typeof terminologyEntrySchema>;

export const exclusionsSchema = z.object({
  scopeGuardrail: z.string().min(1),
  excludedTopics: z.array(z.string()),
  notes: z.string().optional(),
});
export type ExclusionsFile = z.infer<typeof exclusionsSchema>;

export const scenarioTemplateEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  applicableDomainKeys: z.array(z.string()).min(1),
  isPlaceholder: z.boolean(),
});
export const scenarioTemplatesSchema = z.array(scenarioTemplateEntrySchema);
export type ScenarioTemplateEntry = z.infer<typeof scenarioTemplateEntrySchema>;

export const validationRuleEntrySchema = z.object({
  gate: z.string().min(1),
  rule: z.string().min(1),
});
export const validationRulesSchema = z.array(validationRuleEntrySchema).min(1);
export type ValidationRuleEntry = z.infer<typeof validationRuleEntrySchema>;

export const referenceEntrySchema = z.object({
  title: z.string().min(1),
  source: z.string().min(1),
  accessedDate: z.string().min(1),
  note: z.string().optional(),
});
export const referencesSchema = z.array(referenceEntrySchema).min(1);
export type ReferenceEntry = z.infer<typeof referenceEntrySchema>;

export const promptReferencesSchema = z.object({
  generator: z.string().min(1),
  reviewer: z.string().min(1),
  repair: z.string().min(1),
  tutor: z.string().min(1),
});
export type PromptReferences = z.infer<typeof promptReferencesSchema>;
