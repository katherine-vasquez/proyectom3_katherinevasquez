import { GoogleGenerativeAI } from "@google/generative-ai";
import { mapHistoryForGemini } from "../public/utils.js";
import { SYSTEM_PROMPT } from "../src/chat.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key no configurada en el servidor" });
    }

    const { message, history } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "El mensaje es requerido" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 200,
      },
    });

    // Le pasamos a Gemini todo el historial previo de la conversación,
    // para que el personaje mantenga contexto entre mensajes.
    const chat = model.startChat({
      history: mapHistoryForGemini(history),
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const reply = response.text() || "Spider-Man está ocupado 🕷️";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Error en /api/functions:", error);
    return res.status(500).json({
      error: "Error llamando a Gemini",
      details: error.message,
    });
  }
}