import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendChatMessage } from "../public/utils.js";

// Mock global de fetch (FSM3L8): testeamos la función real que llama a fetch,
// no fetch "suelto" dentro del test (eso sería un test circular).
describe("sendChatMessage (fetch mockeado, sin red)", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("envía message + history y devuelve la respuesta de Spider-Man", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ reply: "¡Tu amigable Spider-Man de tu barrio! 🕷️" }),
    });

    const history = [{ role: "Usuario", text: "Hola" }];
    const reply = await sendChatMessage("¿Quién eres?", history);

    expect(fetch).toHaveBeenCalledWith(
      "/api/functions",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "¿Quién eres?",
          history: [{ role: "user", parts: [{ text: "Hola" }] }],
        }),
      })
    );
    expect(reply).toBe("¡Tu amigable Spider-Man de tu barrio! 🕷️");
  });

  it("lanza un error legible cuando el servidor responde con error", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "API key no configurada" }),
    });

    await expect(sendChatMessage("Hola", [])).rejects.toThrow(
      "API key no configurada"
    );
  });

  it("propaga errores de red (offline / fetch rechazado)", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(sendChatMessage("Hola", [])).rejects.toThrow("Network error");
  });
});