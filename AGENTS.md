# AGENTS.md — Live-Wiki (Solo reglas de programación)

> Este archivo define **reglas técnicas** para contribuir (humanos/IA).  
> **Aquí NO van reglas de lore/escritura narrativa.**
> si buscas reglas de lore, ve a [AGENTS-LORE.md](AGENTS-LORE.md).

---

## Regla de Oro (Análisis de Skills)

Antes de realizar cualquier acción o modificación, **analiza siempre** si existe una skill en la sección "Skills disponibles" que aplique a la tarea actual. Si existe, **invócala obligatoriamente** antes de proceder para asegurar el cumplimiento de los flujos técnicos.

---

## Skills disponibles

Usa estas skills para instrucciones y flujos detallados cuando apliquen.

### Nota de Setup (obligatoria)

Cuando ejecutes scripts de setup de skills (`./skills/setup.sh`), **usa siempre `--all` por defecto**.
Solo omite `--all` si el usuario indica explícitamente un scope distinto.

### Skills del proyecto

| Skill | Description | URL |
|-------|-------------|-----|
| `skill-creator` | Create new AI agent skills | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Sync skill metadata to AGENTS.md Auto-invoke sections | [SKILL.md](skills/skill-sync/SKILL.md) |
| `entity-type-creator` | Guides the creation of new entity types | [SKILL.md](skills/entity-type-creator/SKILL.md) |
| `schema-extender` | Guides the extension of existing entity types | [SKILL.md](skills/schema-extender/SKILL.md) |
| `content-creator` | Handles creation and modification of lore entities | [SKILL.md](skills/content-creator/SKILL.md) |

### Auto-invoke Skills

Cuando realices estas acciones, SIEMPRE invoca la skill correspondiente primero:

| Action | Skill |
|--------|-------|
| Adding a new entity type | `entity-type-creator` |
| After creating/modifying a skill | `skill-sync` |
| Creating new skills | `skill-creator` |
| Creating or editing lore content | `content-creator` |
| Extending an existing entity type | `schema-extender` |
| Implementing UI from reference views | `ui-developer` |
| Regenerate AGENTS.md Auto-invoke tables (sync.sh) | `skill-sync` |
| Troubleshoot why a skill is missing from AGENTS.md auto-invoke | `skill-sync` |

---

## Stack asumido

- **Node.js** (LTS)
- **TypeScript** (strict)
- **Gestor de paquetes:** `pnpm` (preferido)
- **SSG:** Astro (recomendado)
- **Estilos:** Tailwind CSS
- **Tests:** Vitest (unit/integración) + Playwright (e2e opcional)
- **Formato/Lint:** Prettier + ESLint

---

## Arquitectura

Monolito modular / monorepo con separación clara:

- `content/` → **fuente de verdad** (Markdown/MDX + metadatos). Sin lógica.
- `src/` → **render web** (Astro: pages/layouts/components). Presentación + helpers de consulta.
- `packages/lore-linter/` → **motor de validación** (reglas/checks). Sin dependencias de UI.
- `packages/wiki-cli/` → **herramientas dev** (crear plantillas, correr checks). Sin dependencias de UI.

Dirección de dependencias (de fuera hacia dentro):

`wiki-cli → lore-linter → shared`  
`site (src) → shared`  
**Prohibido** que `content/` dependa de código.  
**Prohibido** que `lore-linter` dependa de `src/` o Astro.

---

## TDD (Obligatorio para lógica)

Para cualquier lógica no trivial (parser, resolvers, grafo, queries, reglas del linter):

1. Escribe el test primero → corre → **debe fallar**
2. Implementa lo mínimo para pasar
3. Refactoriza con tests en verde

Cambios de UI/maquetación pueden ser más ligeros, pero **toda lógica de datos** va con tests.

---

## Reglas TypeScript

- `strict: true` y no rebajarlo.
- **No `any`**. Usa `unknown` + narrowing.
- Funciones/clases exportadas: tipos explícitos (params/return).
- Prefiere tipos pequeños y específicos.
- Errores recuperables: usa `Result`/uniones discriminadas, no excepciones.

---

## Principios de código

Aplicar **SOLID + KISS + DRY**:

- Funciones pequeñas y con una sola responsabilidad.
- Evita abstracciones “por si acaso”.
- No duplicar normalización/parsing: centralizar en utilidades compartidas.

---

## Convenciones (nombres y estructura)

- IDs/slugs: `kebab-case` en minúsculas, estables.
- Ficheros: idealmente el nombre coincide con el `id` principal.
- Código interno en **inglés** (tipos, funciones, nombres de archivo).  
  Comentarios pueden ser ES/EN.

---

## Frontend / Astro UI

Objetivo UI: **wiki compacta, legible y escaneable**.

- **Pages finas**: cargar datos y pasar props; evitar duplicar markup entre páginas.
- **Separación clara**:
  - Layouts = estructura de página (container/nav/spacing).
  - Componentes presentacionales = sin JS cliente por defecto.
  - Islands = solo para interactividad real (búsqueda en vivo, filtros client-side, timeline, grafo).
- **Componentes por intención**: preferir genéricos reutilizables (ej. `RelationList`) en vez de uno por tipo.
  - Qué hacer: `RelationList` con label + items.
  - Qué no hacer: `EventParticipants` si solo cambia el label.
- **Estilos**: base + markdown/prose + tokens; evita estilos ad-hoc repetidos por página.
- **Comentarios**: explicar el **por qué** (trade-offs, compatibilidad, edge cases), no lo obvio.

---

## Manejo de errores

- CLI/Linter **no deben crashear** por contenido inválido:
  - acumular errores/warnings y reportar con ruta + contexto (línea si es posible).
- Diferenciar:
  - **Error:** rompe CI/build
  - **Warning:** sospechoso pero permitido (configurable)

---

## Testing guidelines

- Tests deterministas (sin tiempo/random; si hace falta, seed).
- Prioriza funciones puras (sin I/O) en el linter.
- Si se necesita filesystem: usa fixtures en `packages/*/test/fixtures` o temp dirs.

---

## Puertas de calidad (local y CI)

Debe existir un flujo único para validar todo:

- `pnpm quality` → lint + typecheck + tests
- `pnpm verify` → `quality` + build (+ e2e si aplica)

CI falla por:
- Type errors
- Lint errors
- Tests fallando
- Linter con **errors** (warnings según config)

---

## Git hooks

- `pre-commit`: lint + typecheck
- `pre-push`: tests + build + checks de lore si aplica

---

## Documentación técnica (no lore)

- Todo export público en `packages/*` lleva JSDoc corto:
  - propósito, params, retorno, edge cases.
- Cambios de arquitectura requieren ADR breve y técnico.

---

## Comentarios (cuando y cómo)

- Añade comentarios **solo cuando aporten contexto útil** (no describas lo obvio).
- Comenta especialmente:
  - **Intención / por qué** (decisiones, trade-offs, invariantes).
  - **Reglas de negocio** y su razonamiento (por ejemplo, validaciones del linter).
  - **Casos límite** y comportamientos no evidentes.
  - **Workarounds** y enlaces a issues/ADRs si aplica.
- Evita comentarios redundantes tipo “incrementa i” o “lee el archivo”.
- Mantén los comentarios **cortos y accionables** (1–3 líneas). Si se vuelve largo, muévelo a doc/ADR.
- Código (identificadores) en inglés; comentarios en ES.

---

## Lore authoring

- Antes de editar lore, lee `AGENTS-LORE.md`.
- Después de editar lore, pasa validación (`pnpm wiki:check` / `pnpm verify`).

---
