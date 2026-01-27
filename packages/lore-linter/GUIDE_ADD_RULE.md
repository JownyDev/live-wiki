# Guía: Crear una Nueva Regla de Validación

Esta guía explica cómo añadir lógica personalizada al linter (ej. "Todo personaje debe tener una facción" o "El daño no puede ser negativo").

## 1. Implementar la Regla

Las reglas viven en `packages/lore-linter/src/`.

1.  Crea un archivo nuevo, ej. `src/factions-check.ts`.
2.  Exporta una función que reciba los documentos y devuelva una lista de errores.

    ```typescript
    import { LoreDoc } from './broken-references';
    
    export type FactionError = {
      type: 'character';
      id: string;
      field: string;
      reason: string;
    };

    export const checkFactions = (docs: LoreDoc[]): FactionError[] => {
      const errors: FactionError[] = [];
      for (const doc of docs) {
        if (doc.type === 'character' && !doc.data.faction) {
           errors.push({ 
             type: 'character',
             id: doc.id, 
             field: 'faction',
             reason: 'required' 
           });
        }
      }
      return errors;
    };
    ```

## 2. Integrar en el Linter

1.  Abre `packages/lore-linter/src/index.ts`.
2.  Importa tu función `checkFactions`.
3.  Si quieres que los errores aparezcan en el reporte estándar, puedes:
    - **Opción A (Recomendada):** Integrarlos en `schemaErrors` si son errores de estructura.
    - **Opción B:** Añadir una nueva categoría en `LintReport`:
    ```typescript
    export type LintReport = {
      // ...
      factionErrors: FactionError[];
    };
    ```
4.  Llama a tu función dentro de `scanLoreDirectory` y añade el resultado al objeto de retorno.

## 3. Actualizar la CLI (Reporte)

Si elegiste la **Opción B**, el CLI necesita saber cómo imprimir tus nuevos errores.

1.  Abre `packages/wiki-cli/src/commands/check.ts`.
2.  Actualiza `countLintErrors` para sumar `report.factionErrors.length`.
3.  Actualiza `formatCheckOutput` para formatear e imprimir tus errores en la consola.

## 4. Tests

Es vital testear la regla. Los tests globales del proyecto están en la raíz.

1.  Crea o edita un test en `tests/`, por ejemplo `tests/lore-linter-factions.spec.ts`.
2.  Carga archivos de `tests/fixtures/` y verifica que el linter detecta los errores.
