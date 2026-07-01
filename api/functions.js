import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapHistoryForGemini } from "../public/utils.js";
import { SYSTEM_PROMPT } from "../src/chat.js";
import { MODEL_FALLBACK_LIST, isTransientError } from "../src/models.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key no configurada en el servidor" });
  }

  const { message, history } = req.body || {};

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "El mensaje es requerido" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  // Probamos los modelos de MODEL_FALLBACK_LIST en orden. Si uno está
  // saturado (429), pasamos al siguiente automáticamente, dentro de la
  // misma solicitud (estrategia explicada en clase para darle
  // continuidad a la app cuando un modelo se queda sin cuota).
  for (const modelName of MODEL_FALLBACK_LIST) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.8, // un poco de variedad, sin perder consistencia de personaje
          maxOutputTokens: 1024, // margen extra para modelos que "piensan" antes de responder
        },
      });

      // Le pasamos a Gemini todo el historial previo de la conversación,
      // para que el personaje mantenga contexto entre mensajes.
      const chat = model.startChat({
        history: mapHistoryForGemini(history),
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text() || "Spider-Man está ocupado 🕷️";

      return res.status(200).json({ reply, modelUsed: modelName });
    } catch (error) {
      console.error(`Error con el modelo ${modelName}:`, error.message);
      lastError = error;

      // Si el error NO es transitorio (429 saturado / 503 sobrecargado),
      // no tiene sentido seguir probando otros modelos: es otro tipo de
      // problema (key inválida, mensaje mal formado, etc.) que va a
      // fallar igual en cualquier modelo.
      if (!isTransientError(error)) break;
      // Si SÍ es 429 o 503, el for continúa e intenta el siguiente modelo.
    }
  }

  // Si llegamos aquí, ningún modelo respondió con éxito.
  if (isTransientError(lastError)) {
    const retryInfo = lastError.errorDetails?.find((d) =>
      d["@type"]?.includes("RetryInfo")
    );

    return res.status(429).json({
      error: "Todos los modelos disponibles están saturados o no disponibles por ahora",
      retryDelay: retryInfo?.retryDelay || "60s",
    });
  }

  console.error("Error en /api/functions:", lastError);
  return res.status(500).json({
    error: "Error llamando a Gemini",
    details: lastError?.message,
  });
}