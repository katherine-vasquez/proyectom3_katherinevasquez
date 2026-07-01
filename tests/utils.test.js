
import { describe, it, expect } from "vitest";
import { formatMessage, isEmpty, resolveRoute, parseRetryDelaySeconds } from "../public/utils.js";
 
describe("Utils del Chat", () => {
  it("formatea mensajes correctamente", () => {
    expect(formatMessage("Usuario", "hola")).toBe("Usuario: hola");
  });
 
  it("detecta texto vacío", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("   ")).toBe(true);
  });
 
  it("detecta texto válido", () => {
    expect(isEmpty("hola")).toBe(false);
  });
});
 
describe("Router SPA (resolveRoute)", () => {
  it("resuelve '/' y '/home' como home", () => {
    expect(resolveRoute("/")).toBe("home");
    expect(resolveRoute("/home")).toBe("home");
  });
 
  it("resuelve '/chat' correctamente", () => {
    expect(resolveRoute("/chat")).toBe("chat");
  });
 
  it("resuelve '/about' correctamente", () => {
    expect(resolveRoute("/about")).toBe("about");
  });
 
  it("usa null en rutas desconocidas (para mostrar la vista 404)", () => {
    expect(resolveRoute("/no-existe")).toBe(null);
  });
});
 
describe("Manejo del límite de peticiones (parseRetryDelaySeconds)", () => {
  it("extrae los segundos de un string como '8s'", () => {
    expect(parseRetryDelaySeconds("8s")).toBe(8);
  });
 
  it("usa 60s por defecto si no viene retryDelay", () => {
    expect(parseRetryDelaySeconds(undefined)).toBe(60);
    expect(parseRetryDelaySeconds(null)).toBe(60);
  });
 
  it("usa 60s por defecto si el formato no se puede leer", () => {
    expect(parseRetryDelaySeconds("formato-raro")).toBe(60);
  });
});