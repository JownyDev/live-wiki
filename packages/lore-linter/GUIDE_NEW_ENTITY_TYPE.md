# Guía: Añadir un Nuevo Tipo de Entidad

Esta guía explica cómo añadir un nuevo tipo de entidad (ej. `weapon`, `quest`, `faction`) al sistema completo, desde la validación hasta la visualización.

## 1. Definir el Esquema (Lore Linter)

El linter es la fuente de verdad. Primero definimos qué campos son válidos.

1.  Abre `packages/lore-linter/src/schema-validation.ts`.
2.  Crea un nuevo esquema Zod para tu tipo:
    ```typescript
    const weaponSchema = z.object({
      type: z.literal('weapon'),
      id: z.string().regex(ID_REGEX),
      name: z.string(),
      damage: z.number().optional(),
      // ... otros campos
    }).strict();
    ```
3.  Añade el esquema a la unión `anyDocSchema` al final del archivo.

## 2. Crear la Plantilla (Template)

Para que `wiki new` funcione, necesitamos una plantilla base.

1.  Crea un archivo en `templates/weapon.md` (reemplaza `weapon` por tu tipo).
2.  Añade el contenido inicial:
    ```markdown
    ---
    type: weapon
    id: {{id}}
    name: {{name}}
    damage: 0
    ---

    Descripción del arma...
    ```

## 3. Actualizar la CLI (`wiki new`)

Para permitir crear este tipo desde la línea de comandos.

1.  Abre `packages/wiki-cli/src/commands/new.ts`.
2.  Localiza el objeto constante `CONTENT_DIR_BY_TYPE`.
3.  Añade tu nuevo tipo al mapa, definiendo en qué subdirectorio de `content/` se guardará:

    ```typescript
    const CONTENT_DIR_BY_TYPE = {
      // ...
      character: 'characters',
      weapon: 'weapons', // <--- Tu nuevo tipo
    } as const;
    ```
    Esto habilita automáticamente el comando `pnpm wiki new weapon [id]`.

## 4. Soporte en Frontend (Carga de Datos)

Astro necesita saber cómo leer y validar estos archivos.

1.  Crea `src/lib/content/weapons.ts` (copia uno existente como `characters.ts`).
2.  Define la colección usando `defineCollection` de Astro y zod (puedes reutilizar lógica o redefinir el esquema para el frontend).
3.  Registra la colección en `src/content/config.ts` (si usas Content Collections de Astro 2.0+) o en el cargador manual que use el proyecto (`src/lib/content/index.ts` o similar).

## 5. Visualización (Página Dinámica)

1.  Crea el directorio `src/pages/weapons/`.
2.  Crea `src/pages/weapons/[id].astro`.
3.  Implementa `getStaticPaths()` para listar todos los items de este tipo.
4.  Diseña el layout de la página recibiendo los datos en `Astro.props`.

## 6. Verificación

Ejecuta todo el flujo:
```bash
# 1. Crear
pnpm wiki new weapon mi-espada

# 2. Validar
pnpm wiki check

# 3. Ver en web
pnpm dev
# Navega a localhost:4321/weapons/mi-espada
```
