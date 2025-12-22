/**
 * Resultado estandar de un comando del CLI.
 */
export type CommandResult = {
  exitCode: number;
  output: string;
};

/**
 * Resuelve un mensaje legible desde errores desconocidos.
 * @param error Error capturado en runtime.
 * @returns Mensaje util para salida de CLI.
 */
export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Unknown error';
};

/**
 * Formatea la salida de error con prefijo consistente.
 * @param message Mensaje de error.
 * @returns Mensaje con prefijo "Error:".
 */
export const formatErrorOutput = (message: string): string => {
  return `Error: ${message}`;
};

/**
 * Crea un resultado exitoso con salida dada.
 * @param output Texto de salida.
 * @returns Resultado con exitCode 0.
 */
export const okResult = (output: string): CommandResult => {
  return { exitCode: 0, output };
};

/**
 * Crea un resultado fallido con salida dada.
 * @param output Texto de salida.
 * @returns Resultado con exitCode 1.
 */
export const failResult = (output: string): CommandResult => {
  return { exitCode: 1, output };
};

/**
 * Crea un resultado de error usando el mensaje de un error desconocido.
 * @param error Error capturado en runtime.
 * @returns Resultado con exitCode 1 y salida formateada.
 */
export const errorResult = (error: unknown): CommandResult => {
  return failResult(formatErrorOutput(getErrorMessage(error)));
};
