// Lista de modelos de Gemini a intentar, en orden de preferencia. Se probó
// gemini-2.5-flash primero porque es el recomendado en el curso y no tiene
// "pensamiento" interno que consuma el presupuesto de tokens de salida.
// gemini-3.5-flash queda como respaldo extra: es más nuevo, pero al ser un
// modelo "razonador" necesita más maxOutputTokens para no cortar su
// respuesta a mitad de camino.
export const MODEL_FALLBACK_LIST = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash",
];

// Determina si un error de la API de Gemini corresponde a un límite de
// velocidad excedido (429 - "Too Many Requests" / cuota agotada).
export function isRateLimitError(error) {
  return error?.status === 429;
}