# Live-Wiki

## Descripción general
Live-Wiki es una wiki "text-first" para un universo de juego, construida sobre Markdown + Git. Renderiza páginas estáticas por tipo de entidad, mantiene relaciones mediante IDs estables y valida la consistencia del lore con un linter.

---

## Instalación y ejecución

Requisitos:
- Node.js LTS (se recomienda v20)
- pnpm

Comando rápido (instalar + ejecutar):
```bash
pnpm install && pnpm dev
```

Comandos útiles:
```bash
pnpm quality      # Ejecuta lint, typecheck y tests
pnpm test --run   # Ejecuta los tests una sola vez
pnpm wiki:check   # Ejecuta el linter de lore
pnpm build        # Construye el sitio estático
```

### Configuración de Asistentes IA

El proyecto incluye scripts para configurar asistentes de IA (Claude, Gemini, Copilot, etc.) con el contexto del proyecto y las skills disponibles.

Para configurarlos, ejecuta:
```bash
bash skills/setup.sh
```

---

## Stack tecnológico

- **Node.js (LTS):** entorno de ejecución para herramientas, builds y scripts.
- **TypeScript (strict):** lógica de validación y parsing más segura.
- **pnpm:** gestión de dependencias monorepo rápida y eficiente en disco.
- **Astro:** generación de sitios estáticos para páginas centradas en contenido.
- **Vitest:** tests unitarios/integración para lógica central.
- **ESLint + Prettier:** calidad de código y formateo consistente.

---

## Funcionalidades

- **7 tipos de entidades:** character, event, place, planet, element, card, mechanic.
- **Páginas estáticas:** `/characters/:id`, `/events/:id`, `/places/:id`, etc.
- **Listados por tipo:** `/characters`, `/events`, `/places`, etc.
- **Relaciones automáticas:** líneas de tiempo y enlaces entre entidades.
- **Lore linter:** validación de esquema, comprobación de fechas, detección de IDs duplicados y referencias rotas.
- **Herramientas CLI:** para crear contenido, verificar integridad y construir el proyecto.

---

## Estructura

```text
content/               Fuente de la verdad en Markdown
src/                   Sitio Astro (pages/layouts/components)
packages/lore-linter/  Motor de validación (sin dependencias de UI)
packages/wiki-cli/     Herramientas de desarrollo y checks
templates/             Plantillas Markdown por tipo
docs/design/           Documentos de diseño técnico
```

Dirección de dependencias:
- `wiki-cli -> lore-linter -> shared`
- `site (src) -> shared`

---

## Formato de contenido

Cada entidad es un único archivo Markdown bajo `content/<tipo>/`.
El frontmatter define los campos mínimos; el cuerpo es Markdown libre.

Ejemplo (character):
```md
---
type: character
id: arina-mora
name: Arina Mora
origin: place:haven-docks
---

Biografía corta en Markdown.
```

Ejemplo (event):
```md
---
type: event
id: relay-run
title: Relay Run
date: 3051-02-14
who:
  - character: arina-mora
locations:
  - place:haven-docks
---
```

Reglas:
- Los IDs usan `kebab-case` y son estables.
- Las referencias usan prefijos como `character:`, `place:`, `planet:`, `element:`.

---

## Sin base de datos (por diseño)

Live-Wiki no utiliza una base de datos convencional. El repositorio es la fuente de verdad: el contenido vive como archivos Markdown bajo `content/`, permitiendo que humanos e IA trabajen directamente en el repositorio e iteren ideas creativas sin migraciones.

---

## CLI

Estos comandos utilizan el paquete local `wiki-cli`:

```bash
pnpm wiki:new <type> <id>
pnpm wiki:check
pnpm wiki:build
```

---

## CI

GitHub Actions se ejecuta en push/PR:
- Instalación de dependencias (pnpm)
- Comprobaciones de calidad (lint, types)
- Tests (Vitest)
- `pnpm wiki:check` (Lore Linter)
- Build del sitio

Workflow: `.github/workflows/ci.yml`

---

## Contribución

Lee `AGENTS.md` para las reglas y convenciones del proyecto.

Referencias de diseño:
- `docs/`