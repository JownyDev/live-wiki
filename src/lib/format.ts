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
export const formatOrigin = (origin: string | null | undefined): string => {
  if (!origin || origin === 'unknown') return 'Desconocido';
  
  // Extrae el ID (lo que está después de ':') o usa el string completo
  const id = origin.includes(':') ? origin.split(':').pop()! : origin;
  
  return formatEntityId(id);
};
