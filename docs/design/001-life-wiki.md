# Documento de Diseño (MVP) — Live-Wiki

## 1) Objetivo del MVP
Construir una “wiki viva” del universo del juego basada en **texto plano + Git**, capaz de:
- Renderizar fichas por tipo (Personaje, Evento, Lugar, Planeta, Elemento, Carta, Mecánica).
- Mantener **enlaces y relaciones** entre entidades mediante **IDs estables**.
- Generar **vistas automáticas** (ej. eventos de un personaje, eventos de un lugar).
- Ejecutar **validaciones** básicas para detectar incoherencias y referencias rotas.
- Ser **IA-friendly** (Codex): fácil de leer, crear y modificar en Markdown.

---

## 2) Alcance incluido (MVP)

### 2.1 Tipos soportados (7)
- `character` (Personajes)
- `event` (Eventos)
- `place` (Lugares)
- `planet` (Planetas)
- `element` (Elementos)
- `card` (Cartas)
- `mechanic` (Mecánicas)

### 2.2 Contenido en texto plano
- Cada entidad = 1 archivo `.md` (o `.mdx`).
- Cada entidad incluye:
  - **Frontmatter** (YAML) con datos mínimos (hechos).
  - Cuerpo Markdown libre (texto explicativo; el lore narrativo se definirá en un doc aparte).

### 2.3 Render web (SSG)
- Sitio estático con rutas:
  - `/characters/:id`
  - `/events/:id`
  - `/places/:id`
  - `/planets/:id`
  - `/elements/:id`
  - `/cards/:id`
  - `/mechanics/:id`
- Listados básicos:
  - `/characters`, `/events`, `/places`, etc.
- Páginas por tipo con plantilla dedicada.

### 2.4 Relaciones automáticas (vistas)
- En **Personaje**: timeline “Eventos donde aparece” ordenado por fecha.
- En **Lugar**: “Eventos que ocurren aquí” ordenado por fecha.
- En **Planeta**: lista de lugares del planeta + eventos del planeta (si aplica por referencias).
- En **Evento**: mostrar implicados (`who`) y localización (`where`) con links.
- En **Carta**: link a lo que representa (`represents`) si está definido.

### 2.5 Búsqueda (MVP)
- Búsqueda estática simple (por título/ID/contenido) integrada en la web.

### 2.6 Validación (Lore Linter MVP)
Checks obligatorios:
1) **IDs duplicados** (mismo `id` en dos archivos).
2) **Referencias rotas** (IDs apuntados que no existen).
3) **Fechas inválidas** en eventos (formato ISO `YYYY-MM-DD`).
4) **Campos requeridos** por tipo (schema).
5) **Coherencia mínima de muerte** (opcional MVP+):
   - Si un evento marca `kills: [character:x]`, ese personaje no puede aparecer en eventos posteriores.
   - Excepción manual permitida: `revived_in: event:y` (si se implementa).

> Nota: checks de viaje interplanetario quedan fuera del MVP (planificados para v1).

---

## 3) Fuera de alcance (NO MVP)
- Editor visual estilo Notion.
- Backend / DB / login.
- Sistema complejo de distancias/tiempos de viaje.
- Versionado semántico de canon (branches por timelines).
- Graph UI (mapa visual de nodos).
- Internacionalización (i18n) avanzada.

---

## 4) Ubicación de este documento
Este documento vivirá en:
- `docs/design/001-life-wiki.md`

---
## 5) Estructura inicial del repo (MVP)

```text
live-wiki/
  docs/
    design/
      001-life-wiki.md
  content/
    characters/
    events/
    places/
    planets/
    elements/
    cards/
    mechanics/
  src/
    pages/
    layouts/
    components/
    lib/
      content.ts
      schema.ts
      queries.ts
  packages/
    lore-linter/
    wiki-cli/
  templates/
  .github/
    workflows/
  README.md
  AGENTS.md
```

---

## 6) Schemas mínimos (MVP)

### 6.1 Campos comunes
- `type` (enum)
- `id` (kebab-case, único)
- `name` o `title` (según tipo)
- `tags` (opcional)

### 6.2 Character
Requeridos:
- `type: character`
- `id`
- `name`
Opcionales:
- `status: alive|dead|unknown`
- `home_planet: planet:<id>`
- `elements: element:<id>[]`
- `related_characters: character:<id>[]`

### 6.3 Event
Requeridos:
- `type: event`
- `id`
- `title`
- `date: YYYY-MM-DD`
Opcionales:
- `where: place:<id> | planet:<id> | (array)`
- `who: character:<id>[]`
- `elements: element:<id>[]`
- `kills: character:<id>[]` (si se activa check de muerte)

### 6.4 Place
Requeridos:
- `type: place`
- `id`
- `name`
Opcionales:
- `planet: planet:<id>`
- `elements: element:<id>[]`

### 6.5 Planet
Requeridos:
- `type: planet`
- `id`
- `name`
Opcionales:
- `elements: element:<id>[]`

### 6.6 Element
Requeridos:
- `type: element`
- `id`
- `name`

### 6.7 Card
Requeridos:
- `type: card`
- `id`
- `name`
Opcionales:
- `represents: character:<id> | event:<id> | place:<id> | planet:<id> | element:<id>`
- `elements: element:<id>[]`

### 6.8 Mechanic
Requeridos:
- `type: mechanic`
- `id`
- `name`
Opcionales:
- `related_cards: card:<id>[]`
- `related_events: event:<id>[]`

---

## 7) UX mínima (web)
- Header con:
  - Home
  - Secciones por tipo
  - Buscador
- En cada ficha:
  - “Ficha rápida” (metadatos)
  - Cuerpo Markdown
  - Bloque “Conexiones” (links generados: eventos, relaciones, etc.)

---

## 8) CLI (MVP)
Comandos:
- `wiki new <type> <id>` → crea archivo desde `templates/` con frontmatter mínimo.
- `wiki check` → ejecuta `lore-linter` y devuelve reporte.
- `wiki build` → build de Astro (usado por CI).

---

## 9) CI (MVP)
GitHub Actions (en PR y main):
- `pnpm i`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm wiki check`
- `pnpm build`

---

## 10) Entregables del MVP
1) Repo con estructura base + dependencias.
2) Plantillas `.md` por tipo en `templates/`.
3) 1 ejemplo real por tipo en `content/`.
4) Web generada con rutas + listados + búsqueda.
5) Linter funcionando con los checks definidos.
6) CI configurado.

---

## 11) Criterio de “MVP terminado”
- Puedo crear 10 personajes + 30 eventos + 10 lugares.
- La web muestra correctamente:
  - fichas por tipo
  - listados
  - “eventos por personaje” y “eventos por lugar” ordenados
- Si pongo una referencia a un ID inexistente, CI falla.
- Si pongo una fecha mal formateada, CI falla.
- El sistema se puede clonar, instalar y levantar con un único comando documentado.
