import matter from 'gray-matter';
import { isAllowedLocationRef } from './location-refs';

type FrontmatterPayload = { data: Record<string, unknown>; content: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const parseFrontmatter = (markdown: string): FrontmatterPayload => {
  const parsed = matter(markdown);
  const data: unknown = parsed.data;
  if (!isRecord(data)) {
    throw new Error('Invalid frontmatter');
  }
  return { data, content: parsed.content };
};

export const getStringField = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

export const getStringArrayField = (
  record: Record<string, unknown>,
  field: string,
): string[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    // Permite campos opcionales sin romper contenido valido.
    return [];
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

export type EventParticipant = { character: string };

export const getEventParticipantsField = (
  record: Record<string, unknown>,
  field: string,
): EventParticipant[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value.map((entry) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error(`Invalid ${field}`);
    }
    const character = (entry as Record<string, unknown>).character;
    if (typeof character !== 'string') {
      throw new Error(`Invalid ${field}`);
    }
    return { character };
  });
};

export const getLocationsField = (
  record: Record<string, unknown>,
  field: string,
): string[] => {
  const value = record[field];
  if (typeof value === 'undefined') {
    return [];
  }
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid ${field}`);
  }
  if (!value.every((item) => isAllowedLocationRef(item))) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

export const getOptionalLocationField = (
  record: Record<string, unknown>,
  field: string,
): string | null => {
  const value = record[field];
  // Para campos opcionales (e.g. origin) permitimos ausencia o null sin romper contenido valido.
  if (typeof value === 'undefined' || value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${field}`);
  }
  if (!isAllowedLocationRef(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
};

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const getDateField = (record: Record<string, unknown>, field: string): string => {
  const value = record[field];
  if (typeof value === 'string') {
    if (!isIsoDate(value)) {
      throw new Error(`Invalid ${field}`);
    }
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Normaliza Date de frontmatter a YYYY-MM-DD para un formato estable.
    return value.toISOString().slice(0, 10);
  }
  throw new Error(`Invalid ${field}`);
};
