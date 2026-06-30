import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key missing" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const message = req.body?.message || "";

    const result = await model.generateContent(
      `Eres Spider-Man (Peter Parker). Responde corto, divertido y natural.\nUsuario: ${message}`
    );

    // ✅ FORMA CORRECTA Y ESTABLE (NO FALLA EN VERCEL)
    const response = await result.response;
    const reply = response.text() || "Spider-Man está ocupado 🕷️";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: "Error llamando Gemini",
      details: error.message
    });
  }
}