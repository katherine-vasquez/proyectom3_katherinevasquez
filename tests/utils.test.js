import { describe, it, expect, beforeEach } from "vitest";
import {
  formatMessage,
  isEmpty,
  resolveRoute,
  parseRetryDelaySeconds,
  saveHistory,
  loadHistory,
  clearHistory,
  hasStoredHistory,
} from "../public/utils.js";

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

// localStorage no existe en el entorno de Node donde corre Vitest, así que
// creamos una versión falsa en memoria, igual que hicimos con fetch.
function createFakeLocalStorage() {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

describe("Persistencia del historial (localStorage)", () => {
  beforeEach(() => {
    global.localStorage = createFakeLocalStorage();
  });

  it("no hay historial guardado al principio", () => {
    expect(hasStoredHistory()).toBe(false);
    expect(loadHistory()).toEqual([]);
  });

  it("guarda y luego carga el mismo historial", () => {
    const history = [{ role: "Usuario", text: "Hola" }];
    saveHistory(history);

    expect(hasStoredHistory()).toBe(true);
    expect(loadHistory()).toEqual(history);
  });

  it("borra el historial guardado", () => {
    saveHistory([{ role: "Usuario", text: "Hola" }]);
    clearHistory();

    expect(hasStoredHistory()).toBe(false);
    expect(loadHistory()).toEqual([]);
  });
});