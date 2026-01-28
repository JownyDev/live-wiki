import { ui, defaultLang } from '../i18n/ui';

/**
 * Formatea un ID en kebab-case a un nombre legible en Title Case.
 * Ejemplo: 'xylos-prime' -> 'Xylos Prime'
 */
export const formatEntityId = (id: string): string => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea una referencia de origen (e.g. 'planet:xylos-prime') para su visualización.
 */
export const formatOrigin = (origin: string | null | undefined, lang: string = defaultLang): string => {
  if (!origin || origin === 'unknown') {
    return ui[lang as keyof typeof ui]['ui.unknown'];
  }
  
  // Extrae el ID (lo que está después de ':') o usa el string completo
  const parts = origin.split(':');
  const id = parts[parts.length - 1] || origin;
  
  return formatEntityId(id);
};
