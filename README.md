# Spider-Man Chat 🕷️

Single Page Application que permite chatear con **Spider-Man (Peter Parker)** usando
Google Gemini AI, con la API key protegida mediante una Vercel Serverless Function.

> Proyecto Integrador del Módulo 3 — Full Stack Development.

## Personaje elegido

**Spider-Man / Peter Parker.** Se eligió por ser un personaje muy reconocible, con una
personalidad distintiva (ingenioso, bromista, pero responsable) que se presta bien para
un chat dinámico y entretenido. El system prompt completo que define su personalidad
está en [`src/chat.js`](./src/chat.js).

## Demo

- **URL desplegada:** https://proyectom3-katherinevasquez.vercel.app
- Capturas de pantalla: _agregar aquí_ (`/home`, `/chat` con conversación, `/about`,
  vista mobile y vista desktop).

## Stack técnico

- HTML / CSS (mobile-first) / JavaScript (Vanilla, ES Modules)
- Google Gemini AI (`@google/generative-ai`, modelo `gemini-2.5-flash`)
- Vercel Serverless Functions (proxy seguro hacia Gemini)
- Vitest (testing unitario)
- History API (routing SPA sin recarga de página)

## Estructura del proyecto
proyectom3_katherinevasquez/
├── api/
│ └── functions.js # Serverless Function: proxy seguro hacia Gemini
├── public/
│ ├── index.html
│ ├── styles.css # Mobile-first + media queries (tablet/desktop)
│ ├── app.js # Routing SPA, render de vistas y lógica de chat
│ └── utils.js # Funciones compartidas navegador + servidor
├── src/
│ └── chat.js # Nombre del personaje + system prompt (solo servidor)
├── tests/
│ ├── utils.test.js
│ └── app.test.js
├── .env.example
├── vercel.json
├── vitest.config.js
└── package.json


> Nota sobre la estructura: `index.html`, `styles.css`, `app.js` y `utils.js` viven en
> `public/` porque es la carpeta que Vercel publica al navegador. `src/chat.js` queda
> afuera porque solo lo usa la Serverless Function — el navegador nunca necesita verlo.

## Requisitos

- Node.js 18+
- Cuenta de Vercel y Vercel CLI (`npm i -g vercel`)
- Una API key de Google Gemini: https://aistudio.google.com/app/apikey

## Instalación y ejecución local

1. Clonar el repositorio y entrar a la carpeta:
```bash
   git clone https://github.com/katherine-vasquez/proyectom3_katherinevasquez.git
   cd proyectom3_katherinevasquez
```

2. Instalar dependencias:
```bash
   npm install
```

3. Configurar las variables de entorno: copiar `.env.example` a `.env` y pegar tu API
   key real:
```bash
   cp .env.example .env
```
GEMINI_API_KEY=tu_api_key_aquí

   El archivo `.env` **no se sube al repositorio** (está en `.gitignore`).

4. Levantar el proyecto en local con Vercel CLI (necesario para que la serverless
   function funcione igual que en producción):
```bash
   vercel dev
```

5. Abrir `http://localhost:3000` en el navegador.

## Cómo ejecutar los tests

```bash
npm test
```

Esto corre los 10 tests unitarios con Vitest (transformación de mensajes, parseo de
la respuesta de la API con `fetch` mockeado, y resolución de rutas del router SPA).

## Cómo desplegar a Vercel

1. Conectar el repositorio de GitHub en https://vercel.com/new.
2. En **Project Settings → Environment Variables**, agregar:
   - `GEMINI_API_KEY` = tu API key real (en Production, Preview y Development).
3. Desplegar (automático en cada push a `main`, o manual con):
```bash
   vercel --prod
```
4. Si algo no funciona en producción, revisar en el dashboard de Vercel:
   **Functions → Runtime Logs**, ahí aparece el error real de la serverless function.

## Funcionalidad implementada

- Routing SPA (`/home`, `/chat`, `/about`) con History API, enlaces `<a>` reales,
  manejo de `popstate`, vista 404 para rutas desconocidas, y soporte de los botones
  back/forward del navegador.
- Diseño mobile-first con media queries para tablet (768px) y desktop (1024px).
- Chat con diferenciación visual entre mensajes del usuario y de Spider-Man, indicador
  de "escribiendo...", scroll automático y manejo de errores de red.
- El historial completo de la conversación se envía en cada request a Gemini (vía
  `model.startChat`), para que el personaje mantenga contexto durante la sesión.
- La API key de Gemini nunca se expone en el frontend: toda llamada a Gemini pasa por
  la Serverless Function en `/api/functions`, que valida método HTTP y body antes de
  procesar.

## Registro de uso de IA en el proyecto

Se utilizó Claude (Anthropic) como asistente durante el desarrollo para:

- Diseñar y redactar el system prompt que define la personalidad de Spider-Man en
  `src/chat.js`, siguiendo el checklist de la clase FSM3L6 (rol, tono, límites,
  longitud de respuesta).
- Diagnosticar y corregir el fallo del despliegue en producción: el modelo
  `gemini-1.5-flash` usado originalmente fue retirado por Google, lo que causaba que
  toda llamada a la API devolviera error 404. Se migró a `gemini-2.5-flash`, el modelo
  recomendado en la clase FSM3L7.
- Revisar el proyecto completo contra la rúbrica de calificación y las 8 clases del
  módulo, corrigiendo brechas como: falta de envío de historial de conversación a
  Gemini, incompatibilidad entre ES Modules y la configuración del `package.json`,
  ausencia de `vercel.json` (necesaria para que el routing SPA no diera 404 al
  recargar en `/chat` o `/about`), configuración rota de Vitest, y documentación
  incompleta.
- Detectar y corregir un bug de estructura: parte del código compartido vivía fuera
  de la carpeta que Vercel publica al navegador, lo que habría roto la app en
  producción.
- Ampliar la suite de tests de 4 a 10, agregando mocking real de `fetch` sobre una
  función exportada (evitando el antipatrón de "test circular" señalado en la clase
  FSM3L8).

## Mejoras futuras (extra credit no implementado)

- Persistencia del historial con `localStorage`.
- Galería de selección de múltiples personajes.
- Modo oscuro/claro con toggle.