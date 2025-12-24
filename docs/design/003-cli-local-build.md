# Diseño — CLI local y build consistente (wiki-cli / lore-linter)

Fecha: 2025-12-22  
Proyecto: Live-Wiki  
Ámbito: CLI local + consistencia de build

---

## 1) Contexto

Necesitamos ejecutar el CLI (`wiki`) **sin instalación global**, y asegurar que la build se genera **siempre en `dist/`** para evitar conflictos o artefactos mezclados entre rutas de compilación.

---

## 2) Objetivos

- Exponer `wiki` como bin local del monorepo.
- Compilar `wiki-cli` y `lore-linter` únicamente a `dist/`.
- Usar un flujo único de build para evitar divergencias entre comandos.
- Eliminar residuos de build fuera de `dist/`.

---

## 3) Cambios realizados

### 3.1 Paquetes y bin
- `packages/wiki-cli/package.json` define `bin: { "wiki": "dist/index.js" }`.
- `packages/wiki-cli/src/index.ts` como entrypoint del CLI (parseo de comandos y dispatch).

### 3.2 Build de paquetes
- `packages/wiki-cli/tsconfig.json` compila a `dist/` (CommonJS, `outDir`, `rootDir`).
- `packages/lore-linter/tsconfig.build.json` compila a `dist/` (CommonJS, `outDir`, `rootDir`).
- `packages/wiki-cli` ejecuta el build de `lore-linter` antes de compilarse.

### 3.3 Scripts raíz
- `wiki:check`, `wiki:build`, `wiki:new` usan el bin local del workspace (`pnpm exec wiki`).
- El bin siempre apunta al artefacto generado por `packages/wiki-cli`.

### 3.4 Templates por defecto
- `templates/` en la raíz como fallback de `wiki new`.

---

## 4) Consistencia de build

- Todas las builds de `wiki-cli` y `lore-linter` generan artefactos en `dist/`.
- Se evita la compilación en `src/` desactivando `allowJs` en las configs de build.
- `wiki build` usa `pnpm build` (Astro) para garantizar el mismo resultado que el build directo del sitio.

---

## 5) Limpieza de residuos

- Se eliminan artefactos JS previos en `packages/lore-linter/src/*.js`.
- Se evita la regeneración de esos archivos con el build actual.

---

## 6) Verificación

- `pnpm wiki:check`
- `pnpm wiki:build`
- `pnpm wiki:new <type> <id>` (sin sobrescribir existentes)
- `pnpm quality`

