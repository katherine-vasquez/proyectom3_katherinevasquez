import { describe, it, expect } from "vitest";
import { formatMessage, isEmpty } from "../src/utils.js";

describe("Utils del Chat", () => {

  it("formatea mensajes correctamente", () => {
    expect(formatMessage("Usuario", "hola"))
      .toBe("Usuario: hola");
  });

  it("detecta texto vacío", () => {
    expect(isEmpty("")).toBe(true);
    expect(isEmpty("   ")).toBe(true);
  });

  it("detecta texto válido", () => {
    expect(isEmpty("hola")).toBe(false);
  });

});