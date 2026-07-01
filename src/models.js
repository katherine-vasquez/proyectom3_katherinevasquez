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

// Determina si vale la pena probar el SIGUIENTE modelo de la lista.
// - 429: el modelo actual se quedó sin cuota (límite por minuto o por día).
// - 503: el servicio de Google está temporalmente sobrecargado.
// Ambos son problemas del modelo/servicio puntual, no del mensaje ni de la
// API key, así que tiene sentido reintentar con otro modelo. Otros errores
// (400, 401, etc.) van a fallar igual sin importar el modelo, así que no
// tiene sentido seguir probando.
export function isTransientError(error) {
  return error?.status === 429 || error?.status === 503;
}