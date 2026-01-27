[**Live Wiki API**](../../../README.md)

***

# Function: scanLoreDirectory()

> **scanLoreDirectory**(`baseDir`): `Promise`\<[`LintReport`](../type-aliases/LintReport.md)\>

Defined in: [lore-linter/src/index.ts:26](https://github.com/JownyDev/live-wiki/blob/914f9aa4820b404ec7b6b5e06f89e63fae70f809/packages/lore-linter/src/index.ts#L26)

Punto de entrada publico: coordina lectura, parseo y checks basicos.

## Parameters

### baseDir

`string`

Directorio raiz del contenido.

## Returns

`Promise`\<[`LintReport`](../type-aliases/LintReport.md)\>

Reporte con duplicados y referencias rotas.
