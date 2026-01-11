import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  getDateField,
  getOptionalLocationField,
  getStringField,
  getStringArrayField,
  parseFrontmatter,
} from './frontmatter';
import {
  listSimpleEntities,
  type SimpleEntityListItem,
} from './simple-entities';

export type CharacterListItem = { id: string; name: string };
export type RelatedCharacter = { type: string; character: string };
export type CharacterKnowledge = {
  summary: string | null;
  knowsAbout: string[];
  blindspots: string[];
  canReveal: string[];
};
export type CharacterGoals = {
  longTerm: string[];
  typicalPriorities: string[];
};
export type CharacterCapabilityAction = {
  action: string;
  triggers: string[];
  notes: string[];
  filters: string[];
};
export type CharacterCapabilities = {
  actions: CharacterCapabilityAction[];
};
export type CharacterPersonaVoice = {
  tone: string | null;
  styleNotes: string[];
};
export type CharacterPersona = {
  archetype: string | null;
  traits: string[];
  values: string[];
  taboos: string[];
  biographyHighlights: string[];
  voice: CharacterPersonaVoice | null;
};
export type CharacterMemoryProfile = {
  interestTags: string[];
  relationshipTags: string[];
  allowedTags: string[];
  blockedTags: string[];
  provenancePolicy: {
    allowed: string[];
    default: string | null;
  } | null;
  retrievalLimits: {
    maxItems: number | null;
    maxTokensSummary: number | null;
  } | null;
};
export type CharacterEmotionsProfile = {
  baselineMood: Record<string, number>;
  towardPlayer: {
    stance: string | null;
    note: string | null;
  } | null;
  sensitivities: {
    angersIf: string[];
    calmsIf: string[];
  } | null;
  manipulability: {
    byEmpathy: string | null;
    byBribe: string | null;
    byIntimidation: string | null;
    byAuthority: string | null;
    notes: string[];
  } | null;
};
export type Character = {
  id: string;
  name: string;
  origin: string | null;
  image: string | null;
  born: string | null;
  died: string | null;
  affinity: string | null;
  relatedCharacters: RelatedCharacter[];
  knowledge: CharacterKnowledge | null;
  goals: CharacterGoals | null;
  capabilities: CharacterCapabilities | null;
  persona: CharacterPersona | null;
  memoryProfile: CharacterMemoryProfile | null;
  emotionsProfile: CharacterEmotionsProfile | null;
  body: string;
};

type NodeErrorWithCode = Error & { code?: string };

const getCharactersDir = (baseDir?: string): string => {
  const resolvedBaseDir = baseDir ?? path.resolve(process.cwd(), 'content');
  return path.join(resolvedBaseDir, 'characters');
};

const toCharacterListItem = (entity: SimpleEntityListItem): CharacterListItem => ({
  id: entity.id,
  name: entity.name,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getOptionalStringField = (
  record: Record<string, unknown>,
  field: string,
): string | null => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return null;
  }
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const getOptionalDateField = (
  record: Record<string, unknown>,
  field: string,
): string | null => {
  if (typeof record[field] === 'undefined') {
    return null;
  }
  return getDateField(record, field);
};

const getOptionalNumberField = (
  record: Record<string, unknown>,
  field: string,
): number | null => {
  const value = record[field];
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const getNumberRecordField = (
  record: Record<string, unknown>,
  field: string,
): Record<string, number> => {
  const value = record[field];
  if (typeof value === 'undefined' || value === null) {
    return {};
  }
  if (!isRecord(value)) {
    throw new Error(`Invalid ${field}`);
  }
  const entries = Object.entries(value);
  for (const [key, entryValue] of entries) {
    if (typeof entryValue !== 'number' || Number.isNaN(entryValue)) {
      throw new Error(`Invalid ${field}`);
    }
    if (key.length === 0) {
      throw new Error(`Invalid ${field}`);
    }
  }
  return value as Record<string, number>;
};

const getRelatedCharactersField = (value: unknown): RelatedCharacter[] => {
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error('Invalid related_characters');
  }
  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error('Invalid related_characters');
    }
    const typeValue = entry.type;
    const characterValue = entry.character;
    if (typeof typeValue !== 'string' || typeValue.length === 0) {
      throw new Error('Invalid related_characters');
    }
    if (typeof characterValue !== 'string') {
      throw new Error('Invalid related_characters');
    }
    return { type: typeValue, character: characterValue };
  });
};

const getKnowledgeField = (
  record: Record<string, unknown>,
): CharacterKnowledge | null => {
  const value = record.knowledge;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid knowledge');
  }
  return {
    summary: getOptionalStringField(value, 'summary'),
    knowsAbout: getStringArrayField(value, 'knows_about'),
    blindspots: getStringArrayField(value, 'blindspots'),
    canReveal: getStringArrayField(value, 'can_reveal'),
  };
};

const getGoalsField = (record: Record<string, unknown>): CharacterGoals | null => {
  const value = record.goals;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid goals');
  }
  return {
    longTerm: getStringArrayField(value, 'long_term'),
    typicalPriorities: getStringArrayField(value, 'typical_priorities'),
  };
};

const getCapabilitiesField = (
  record: Record<string, unknown>,
): CharacterCapabilities | null => {
  const value = record.capabilities;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid capabilities');
  }
  const actionsValue = value.actions;
  if (!Array.isArray(actionsValue) || actionsValue.length === 0) {
    throw new Error('Invalid capabilities');
  }
  const actions = actionsValue.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error('Invalid capabilities');
    }
    const actionValue = entry.action;
    if (typeof actionValue !== 'string' || actionValue.length === 0) {
      throw new Error('Invalid capabilities');
    }
    const triggers = getStringArrayField(entry, 'triggers');
    if (triggers.length === 0) {
      throw new Error('Invalid capabilities');
    }
    return {
      action: actionValue,
      triggers,
      notes: getStringArrayField(entry, 'notes'),
      filters: getStringArrayField(entry, 'filters'),
    };
  });
  return { actions };
};

const getPersonaVoiceField = (
  record: Record<string, unknown>,
): CharacterPersonaVoice | null => {
  const value = record.voice;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid persona');
  }
  return {
    tone: getOptionalStringField(value, 'tone'),
    styleNotes: getStringArrayField(value, 'style_notes'),
  };
};

const getPersonaField = (
  record: Record<string, unknown>,
): CharacterPersona | null => {
  const value = record.persona;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid persona');
  }
  return {
    archetype: getOptionalStringField(value, 'archetype'),
    traits: getStringArrayField(value, 'traits'),
    values: getStringArrayField(value, 'values'),
    taboos: getStringArrayField(value, 'taboos'),
    biographyHighlights: getStringArrayField(value, 'biography_bullets'),
    voice: getPersonaVoiceField(value),
  };
};

const getMemoryProfileField = (
  record: Record<string, unknown>,
): CharacterMemoryProfile | null => {
  const value = record.memory_profile;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid memory_profile');
  }
  const provenanceValue = value.provenance_policy;
  const provenancePolicy =
    typeof provenanceValue === 'undefined' || provenanceValue === null
      ? null
      : (() => {
          if (!isRecord(provenanceValue)) {
            throw new Error('Invalid memory_profile');
          }
          return {
            allowed: getStringArrayField(provenanceValue, 'allowed'),
            default: getOptionalStringField(provenanceValue, 'default'),
          };
        })();
  const limitsValue = value.retrieval_limits;
  const retrievalLimits =
    typeof limitsValue === 'undefined' || limitsValue === null
      ? null
      : (() => {
          if (!isRecord(limitsValue)) {
            throw new Error('Invalid memory_profile');
          }
          return {
            maxItems: getOptionalNumberField(limitsValue, 'max_items'),
            maxTokensSummary: getOptionalNumberField(limitsValue, 'max_tokens_summary'),
          };
        })();
  return {
    interestTags: getStringArrayField(value, 'interest_tags'),
    relationshipTags: getStringArrayField(value, 'relationship_tags'),
    allowedTags: getStringArrayField(value, 'allowed_tags'),
    blockedTags: getStringArrayField(value, 'blocked_tags'),
    provenancePolicy,
    retrievalLimits,
  };
};

const getEmotionsProfileField = (
  record: Record<string, unknown>,
): CharacterEmotionsProfile | null => {
  const value = record.emotions_profile;
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (!isRecord(value)) {
    throw new Error('Invalid emotions_profile');
  }
  const towardPlayerValue = value.toward_player_default;
  const towardPlayer =
    typeof towardPlayerValue === 'undefined' || towardPlayerValue === null
      ? null
      : (() => {
          if (!isRecord(towardPlayerValue)) {
            throw new Error('Invalid emotions_profile');
          }
          return {
            stance: getOptionalStringField(towardPlayerValue, 'stance'),
            note: getOptionalStringField(towardPlayerValue, 'note'),
          };
        })();
  const sensitivitiesValue = value.sensitivities;
  const sensitivities =
    typeof sensitivitiesValue === 'undefined' || sensitivitiesValue === null
      ? null
      : (() => {
          if (!isRecord(sensitivitiesValue)) {
            throw new Error('Invalid emotions_profile');
          }
          return {
            angersIf: getStringArrayField(sensitivitiesValue, 'angers_if'),
            calmsIf: getStringArrayField(sensitivitiesValue, 'calms_if'),
          };
        })();
  const manipulabilityValue = value.manipulability;
  const manipulability =
    typeof manipulabilityValue === 'undefined' || manipulabilityValue === null
      ? null
      : (() => {
          if (!isRecord(manipulabilityValue)) {
            throw new Error('Invalid emotions_profile');
          }
          return {
            byEmpathy: getOptionalStringField(manipulabilityValue, 'by_empathy'),
            byBribe: getOptionalStringField(manipulabilityValue, 'by_bribe'),
            byIntimidation: getOptionalStringField(
              manipulabilityValue,
              'by_intimidation',
            ),
            byAuthority: getOptionalStringField(manipulabilityValue, 'by_authority'),
            notes: getStringArrayField(manipulabilityValue, 'notes'),
          };
        })();
  return {
    baselineMood: getNumberRecordField(value, 'baseline_mood'),
    towardPlayer,
    sensitivities,
    manipulability,
  };
};

const parseAndValidateCharacterMarkdown = (markdown: string): Character => {
  const { data, content } = parseFrontmatter(markdown);
  if (data.type !== 'character') {
    throw new Error('Invalid type');
  }

  const id = getStringField(data, 'id');
  const name = getStringField(data, 'name');
  const origin = getOptionalLocationField(data, 'origin');
  const image = getOptionalStringField(data, 'image');
  const born = getOptionalDateField(data, 'born');
  const died = getOptionalDateField(data, 'died');
  const affinity = getOptionalStringField(data, 'affinity');
  const relatedCharacters = getRelatedCharactersField(data.related_characters);
  const knowledge = getKnowledgeField(data);
  const goals = getGoalsField(data);
  const capabilities = getCapabilitiesField(data);
  const persona = getPersonaField(data);
  const memoryProfile = getMemoryProfileField(data);
  const emotionsProfile = getEmotionsProfileField(data);

  return {
    id,
    name,
    origin,
    image,
    born,
    died,
    affinity,
    relatedCharacters,
    knowledge,
    goals,
    capabilities,
    persona,
    memoryProfile,
    emotionsProfile,
    body: content,
  };
};

const isEnoentError = (error: unknown): error is NodeErrorWithCode =>
  error instanceof Error && (error as NodeErrorWithCode).code === 'ENOENT';

export async function listCharacters(
  baseDir?: string,
): Promise<Array<CharacterListItem>> {
  const charactersDir = getCharactersDir(baseDir);
  // Adaptador para preservar el tipo público y permitir ampliar Character más adelante.
  const entities = await listSimpleEntities(charactersDir, 'character');
  return entities.map(toCharacterListItem);
}

export async function getCharacterById(
  id: string,
  baseDir?: string,
): Promise<Character | null> {
  const charactersDir = getCharactersDir(baseDir);
  // Parsea origin aqui para no acoplar SimpleEntity a la semantica de localizaciones.
  const filePath = path.join(charactersDir, `${id}.md`);

  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if (isEnoentError(error)) {
      return null;
    }
    throw error;
  }

  return parseAndValidateCharacterMarkdown(markdown);
}
