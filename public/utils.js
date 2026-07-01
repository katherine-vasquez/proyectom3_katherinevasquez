
// Funciones utilitarias: transformación de datos, parseo y routing.
// Se mantienen puras (sin tocar el DOM) para que sean fáciles de testear
// y se puedan reutilizar tanto en el frontend como en la serverless function.
 
export function formatMessage(role, text) {
  return `${role}: ${text}`;
}
 
export function isEmpty(text) {
  return !text || text.trim().length === 0;
}
 
// Decide qué vista corresponde a una URL. Devuelve null si la ruta no existe,
// para que el router pueda mostrar una vista 404 (FSM3L2).
export function resolveRoute(pathname) {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname === "/chat") return "chat";
  if (pathname === "/about") return "about";
  return null;
}
 
// Convierte el historial de mensajes que se muestra en pantalla
// (role: "Usuario" | "Spider-Man") al formato que espera la API de Gemini
// (role: "user" | "model").
export function mapHistoryForGemini(messages) {
  return (messages || [])
    .filter((m) => m && (m.role === "Usuario" || m.role === "Spider-Man") && m.text)
    .map((m) => ({
      role: m.role === "Usuario" ? "user" : "model",
      parts: [{ text: m.text }],
    }));
}
 
// Parsea la respuesta JSON que devuelve /api/functions, con un mensaje
// de respaldo si la respuesta no trae el campo esperado.
export function parseGeminiReply(data) {
  if (!data || typeof data.reply !== "string" || !data.reply.trim()) {
    return "No tengo respuesta 😅";
  }
  return data.reply;
}
 
// Convierte el "retryDelay" que devuelve la API de Gemini (ej. "8s") en un
// número de segundos. Si no viene o no se puede leer, usa 60s por defecto
// (tal como sugirió el profe en clase).
export function parseRetryDelaySeconds(retryDelay) {
  if (!retryDelay) return 60;
  const match = String(retryDelay).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}
 
// Realiza la llamada real a /api/functions. Se exporta como función propia
// (en vez de inlinearla en app.js) para poder testearla con fetch mockeado
// sin caer en un "test circular" (FSM3L8).
export async function sendChatMessage(message, history) {
  const res = await fetch("/api/functions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: mapHistoryForGemini(history) }),
  });
 
  const data = await res.json();
 
  if (!res.ok) {
    const error = new Error(data?.error || `HTTP ${res.status}`);
    error.status = res.status;
    error.retryDelay = data?.retryDelay;
    throw error;
  }
 
  return parseGeminiReply(data);
}