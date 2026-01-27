# @live-wiki/wiki-cli

Herramientas de desarrollo para el mantenimiento de "Live Wiki".

## Propósito

Esta CLI proporciona utilidades para:
1.  **Andamiaje (Scaffolding)** de nuevo contenido (personajes, lugares, etc.) usando plantillas estándar.
2.  **Linting** del repositorio de contenido para errores de esquema y enlaces rotos.
3.  **Construcción** de datos auxiliares (como índices de búsqueda) si es necesario.

## Instalación y Uso

Este paquete se instala como una dependencia de desarrollo en el workspace raíz.

### Mediante el Workspace Raíz (Recomendado)

Puedes ejecutar los comandos usando los scripts definidos en el `package.json` raíz:

```bash
# Ejecutar validaciones de contenido
pnpm wiki:check

# Crear nuevo contenido
pnpm wiki:new

# Construir índice de búsqueda / assets estáticos
pnpm wiki:build
```

### Ejecución Directa

Si necesitas ejecutar el binario directamente desde la raíz:

```bash
pnpm exec wiki [comando] [opciones]
```

## Comandos

### `wiki check`
Ejecuta el `lore-linter` contra el directorio `content/`.
- **Salida**: Errores (bloqueantes) y Advertencias (no bloqueantes).
- **CI**: Se usa en `pre-push` o GitHub Actions para prevenir datos corruptos.

### `wiki new`
Asistente interactivo para crear una nueva entidad.
- Pregunta por el **Tipo** (Personaje, Evento, etc.).
- Pregunta por el **Nombre/ID**.
- Genera un archivo en el directorio correcto basado en `templates/`.

### `wiki build`
Prepara datos para el frontend.
- Ejemplo: Genera `public/search-index.json` o artefactos similares usados por la UI para funcionalidades en el cliente.

## Desarrollo

La CLI está construida con TypeScript.

```bash
# Construir la CLI
pnpm build

# Ejecutar pruebas
pnpm test
```