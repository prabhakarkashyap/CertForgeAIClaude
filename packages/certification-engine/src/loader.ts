import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { CertificationPackError } from '@certforge/shared';
import {
  manifestSchema,
  blueprintSchema,
  domainsSchema,
  objectivesSchema,
  terminologySchema,
  exclusionsSchema,
  scenarioTemplatesSchema,
  validationRulesSchema,
  referencesSchema,
} from './schemas.js';
import type {
  ManifestFile,
  BlueprintFile,
  DomainFileEntry,
  ObjectiveFileEntry,
  TerminologyEntry,
  ExclusionsFile,
  ScenarioTemplateEntry,
  ValidationRuleEntry,
  ReferenceEntry,
  PromptReferences,
} from './schemas.js';
import { crossValidatePack } from './validate.js';
import type { CertificationPack } from './types.js';

const REQUIRED_JSON_FILES = [
  'manifest.json',
  'blueprint.json',
  'domains.json',
  'objectives.json',
  'terminology.json',
  'exclusions.json',
  'scenario-templates.json',
  'validation-rules.json',
  'references.json',
] as const;

const REQUIRED_PROMPT_FILES = ['generator.md', 'reviewer.md', 'repair.md', 'tutor.md'] as const;

async function readJsonFile(filePath: string, label: string): Promise<unknown> {
  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (cause) {
    throw new CertificationPackError({
      message: `Missing required certification pack file: ${label}`,
      details: { filePath },
      cause,
    });
  }
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new CertificationPackError({
      message: `Malformed JSON in certification pack file: ${label}`,
      details: { filePath },
      cause,
    });
  }
}

function parseWithSchema<T>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: { issues: unknown[] } } },
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new CertificationPackError({
      message: `Certification pack file failed schema validation: ${label}`,
      details: { issues: result.error?.issues ?? [] },
    });
  }
  return result.data as T;
}

/**
 * Load, schema-validate and cross-validate a single certification pack
 * directory. Throws CertificationPackError on any missing file, malformed
 * JSON, schema violation or cross-file inconsistency (e.g. domain weights
 * not summing to 100).
 */
export async function loadCertificationPack(packDir: string): Promise<CertificationPack> {
  const dirStat = await stat(packDir).catch(() => null);
  if (!dirStat || !dirStat.isDirectory()) {
    throw new CertificationPackError({
      message: `Certification pack directory not found: ${packDir}`,
      details: { packDir },
    });
  }

  const manifest = parseWithSchema<ManifestFile>(
    manifestSchema,
    await readJsonFile(path.join(packDir, 'manifest.json'), 'manifest.json'),
    'manifest.json',
  );
  const blueprint = parseWithSchema<BlueprintFile>(
    blueprintSchema,
    await readJsonFile(path.join(packDir, 'blueprint.json'), 'blueprint.json'),
    'blueprint.json',
  );
  const domains = parseWithSchema<DomainFileEntry[]>(
    domainsSchema,
    await readJsonFile(path.join(packDir, 'domains.json'), 'domains.json'),
    'domains.json',
  );
  const objectives = parseWithSchema<ObjectiveFileEntry[]>(
    objectivesSchema,
    await readJsonFile(path.join(packDir, 'objectives.json'), 'objectives.json'),
    'objectives.json',
  );
  const terminology = parseWithSchema<TerminologyEntry[]>(
    terminologySchema,
    await readJsonFile(path.join(packDir, 'terminology.json'), 'terminology.json'),
    'terminology.json',
  );
  const exclusions = parseWithSchema<ExclusionsFile>(
    exclusionsSchema,
    await readJsonFile(path.join(packDir, 'exclusions.json'), 'exclusions.json'),
    'exclusions.json',
  );
  const scenarioTemplates = parseWithSchema<ScenarioTemplateEntry[]>(
    scenarioTemplatesSchema,
    await readJsonFile(path.join(packDir, 'scenario-templates.json'), 'scenario-templates.json'),
    'scenario-templates.json',
  );
  const validationRules = parseWithSchema<ValidationRuleEntry[]>(
    validationRulesSchema,
    await readJsonFile(path.join(packDir, 'validation-rules.json'), 'validation-rules.json'),
    'validation-rules.json',
  );
  const references = parseWithSchema<ReferenceEntry[]>(
    referencesSchema,
    await readJsonFile(path.join(packDir, 'references.json'), 'references.json'),
    'references.json',
  );

  const promptDir = path.join(packDir, 'prompts');
  for (const file of REQUIRED_PROMPT_FILES) {
    const filePath = path.join(promptDir, file);
    try {
      await readFile(filePath, 'utf-8');
    } catch (cause) {
      throw new CertificationPackError({
        message: `Missing required prompt file: prompts/${file}`,
        details: { filePath },
        cause,
      });
    }
  }
  const promptReferences: PromptReferences = {
    generator: path.join('prompts', 'generator.md'),
    reviewer: path.join('prompts', 'reviewer.md'),
    repair: path.join('prompts', 'repair.md'),
    tutor: path.join('prompts', 'tutor.md'),
  };

  crossValidatePack({ manifest, blueprint, domains, objectives });

  return {
    packDir,
    manifest,
    blueprint,
    domains,
    objectives,
    terminology,
    exclusions,
    scenarioTemplates,
    validationRules,
    references,
    promptReferences,
  };
}

/** List immediate subdirectories of a certifications root, each a candidate pack. */
export async function discoverPackDirs(certificationsRoot: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(certificationsRoot, { withFileTypes: true });
  } catch (cause) {
    throw new CertificationPackError({
      message: `Certifications root directory not found: ${certificationsRoot}`,
      details: { certificationsRoot },
      cause,
    });
  }
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(certificationsRoot, entry.name));
}

/** Load every pack found under a certifications root. Fails fast on the first invalid pack. */
export async function loadAllCertificationPacks(
  certificationsRoot: string,
): Promise<CertificationPack[]> {
  const dirs = await discoverPackDirs(certificationsRoot);
  const packs: CertificationPack[] = [];
  for (const dir of dirs) {
    packs.push(await loadCertificationPack(dir));
  }
  return packs;
}

export { REQUIRED_JSON_FILES, REQUIRED_PROMPT_FILES };
