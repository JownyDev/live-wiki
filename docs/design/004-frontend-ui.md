# Diseño — Frontend UI (Astro)

Fecha: 2025-12-24  
Proyecto: Live-Wiki  
Ámbito: MVP UI + evolución controlada

---

## 1) Visión UI

- **Compacta y escaneable**: bloques cortos, tipografía legible, foco en contenido.
- **Consistente**: mismos patrones visuales para todos los tipos.
- **Wiki-style**: navegación clara, poco ruido visual.

Estado actual:
- La UI vive en `src/pages/` con HTML directo.
- Todavía no hay layouts/componentes compartidos ni estilos globales.

---

## 2) Arquitectura Astro (flujo recomendado)

**pages → layouts → components → islands (opcional)**

- **Pages**: solo cargar datos y pasar props. Nada de markup duplicado.
- **Layouts**: estructura de página (container, nav, spacing).
- **Componentes**: presentación reusable, sin JS cliente por defecto.
- **Islands**: solo cuando haya interactividad real (búsqueda en vivo, filtros client-side, timeline, grafo).

---

## 3) Componentes base propuestos (intención, no tipo)

- **Header**
  - Responsabilidad: título + metadatos visibles.
  - Props: `title`, `meta` (lista de pares label/valor).

- **Description**
  - Responsabilidad: render de Markdown (body) con estilo consistente.
  - Props: `body` (string), `className?`.

- **Section**
  - Responsabilidad: bloque con heading + contenido.
  - Props: `title`, `children`.

- **RelationList**
  - Responsabilidad: lista reutilizable (label + items + variante visual).
  - Props: `label`, `items`, `variant?`.

- **EntityLink**
  - Responsabilidad: link consistente + fallback si falta entidad.
  - Props: `href`, `label`, `isMissing?`.

- **Badge/Chip** (si aplica)
  - Responsabilidad: etiquetas compactas.
  - Props: `label`, `variant?`.

---

## 4) Markdown: render y estilo

- **Fuente**: `frontmatter` + `markdown body`.
- **Render**: el body se pasa a un componente `Description`.
- **Estilo**: clase tipo `.prose` con reglas base (tipografía, listas, enlaces).

---

## 5) Estrategia de crecimiento

- **Nuevos tipos**: crear/usar el mismo layout y componentes base, sin duplicar UI.
- **Nuevas relaciones (`related_*`)**: siempre con `RelationList`.
- **Timeline**: island opcional, sin reescribir páginas existentes.

---

## 6) Decisiones y trade-offs

- **No islands para todo**: menos JS, mejor performance y mantenimiento.
- **Componentes por intención**: evita duplicación y mejora consistencia visual.
- **MVP vs futuro**:
  - MVP: páginas simples con layout compartido + `Description`.
  - Futuro: timeline interactiva y grafo como islands.
