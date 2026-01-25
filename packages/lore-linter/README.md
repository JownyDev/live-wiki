# @live-wiki/lore-linter

Lógica central para validar la consistencia y el esquema del contenido de "Live Wiki".

## Propósito

Este paquete actúa como la **fuente de verdad** para la validación de datos. Está desacoplado de la interfaz de usuario (Astro) y de las herramientas de CLI, enfocándose exclusivamente en:

1.  **Validación de Esquema**: Asegurar que el frontmatter de los archivos Markdown coincida con los tipos esperados (Personajes, Eventos, Lugares, etc.).
2.  **Chequeos de Integridad**: Detectar enlaces rotos (referencias a IDs que no existen).
3.  **Unicidad**: Detectar IDs duplicados en toda la base de contenido.

## Arquitectura

- **`src/schema-validation.ts`**: Define el tipado estricto para cada tipo de entidad.
- **`src/broken-references.ts`**: Escanea todos los campos `related_*` y menciones para asegurar que los objetivos existen.
- **`src/duplicates.ts`**: Asegura que no haya dos archivos reclamando el mismo `id`.
- **`src/frontmatter.ts`**: Utilidades de bajo nivel para extraer datos de archivos Markdown.

## Uso

Este paquete es consumido principalmente por:
- **`wiki-cli`**: Para ejecutar validaciones localmente o en CI.
- **`site` (Astro)**: Para proporcionar seguridad de tipos durante el tiempo de compilación.

### Ejecutar Pruebas

Las pruebas unitarias para las reglas de validación son críticas.

```bash
pnpm test
```

## Referencia del Esquema

Para un desglose detallado de los campos válidos por tipo de entidad, consulta [LORE_SCHEMA.md](./LORE_SCHEMA.md).