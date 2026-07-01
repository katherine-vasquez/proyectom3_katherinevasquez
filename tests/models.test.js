import { describe, it, expect } from "vitest";
import { MODEL_FALLBACK_LIST, isRateLimitError } from "../src/models.js";
 
describe("Lista de modelos de respaldo", () => {
  it("tiene al menos 2 modelos para poder hacer fallback", () => {
    expect(MODEL_FALLBACK_LIST.length).toBeGreaterThanOrEqual(2);
  });
 
  it("no tiene modelos repetidos", () => {
    const unique = new Set(MODEL_FALLBACK_LIST);
    expect(unique.size).toBe(MODEL_FALLBACK_LIST.length);
  });
});
 
describe("isRateLimitError", () => {
  it("detecta un error 429 como límite de velocidad", () => {
    expect(isRateLimitError({ status: 429 })).toBe(true);
  });
 
  it("no marca otros errores como límite de velocidad", () => {
    expect(isRateLimitError({ status: 500 })).toBe(false);
    expect(isRateLimitError(null)).toBe(false);
    expect(isRateLimitError(undefined)).toBe(false);
  });
});