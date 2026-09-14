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

/**
 * Fully loaded and cross-validated certification pack. This is the
 * in-memory representation the rest of the application reads; the
 * certification blueprint is the curriculum authority (never the LLM).
 */
export interface CertificationPack {
  packDir: string;
  manifest: ManifestFile;
  blueprint: BlueprintFile;
  domains: DomainFileEntry[];
  objectives: ObjectiveFileEntry[];
  terminology: TerminologyEntry[];
  exclusions: ExclusionsFile;
  scenarioTemplates: ScenarioTemplateEntry[];
  validationRules: ValidationRuleEntry[];
  references: ReferenceEntry[];
  promptReferences: PromptReferences;
}

export interface CertificationPackSummary {
  slug: string;
  name: string;
  version: string;
  status: ManifestFile['status'];
  examName: string;
  totalQuestions: number;
  durationMinutes: number;
  domainCount: number;
}

export function summarizePack(pack: CertificationPack): CertificationPackSummary {
  return {
    slug: pack.manifest.slug,
    name: pack.manifest.name,
    version: pack.manifest.version,
    status: pack.manifest.status,
    examName: pack.manifest.examName,
    totalQuestions: pack.manifest.totalQuestions,
    durationMinutes: pack.manifest.durationMinutes,
    domainCount: pack.domains.length,
  };
}
