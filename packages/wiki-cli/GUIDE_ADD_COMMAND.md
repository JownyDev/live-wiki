# Guía: Añadir un Nuevo Comando al CLI

Esta guía explica cómo extender `wiki-cli` con nuevos comandos (ej. `wiki stats` o `wiki graph`).

## 1. Crear la Acción del Comando

1.  Crea un archivo en `packages/wiki-cli/src/commands/`, por ejemplo `stats.ts`.
2.  Implementa la lógica y devuelve un `CommandResult`.

    ```typescript
    import { okResult, CommandResult } from './result';

    export const runStatsCommand = async (): Promise<CommandResult> => {
      // Lógica aquí (ej. leer archivos, contar cosas)
      const stats = "Personajes: 50, Eventos: 20";
      return okResult(stats);
    };
    ```

## 2. Registrar el Comando

1.  Abre `packages/wiki-cli/src/index.ts`.
2.  Importa tu función `runStatsCommand`.
3.  Añade un bloque `if` en la función `runCommand` (o `main`):

    ```typescript
    if (command === 'stats') {
      return await runStatsCommand();
    }
    ```

## 3. Exponer en NPM (Opcional)

Si quieres ejecutarlo fácilmente con `pnpm` desde la raíz.

1.  Abre el `package.json` raíz del proyecto.
2.  Añade un script:
    ```json
    "scripts": {
      "wiki:stats": "pnpm -C packages/wiki-cli build && pnpm exec wiki stats"
    }
    ```

Ahora puedes correr `pnpm wiki:stats`.
