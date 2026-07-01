import {
  resolveRoute,
  sendChatMessage,
  parseRetryDelaySeconds,
  saveHistory,
  loadHistory,
  clearHistory,
  hasStoredHistory,
} from "./utils.js";

const app = document.getElementById("app");
const navLinks = document.querySelectorAll("#navbar .navLink");

// Al cargar la app, recuperamos el historial guardado (si existe) en vez
// de empezar siempre desde cero. Extra credit: persistencia con localStorage.
let messages = loadHistory();

// -------------------- HOME --------------------
function renderHome() {
  app.innerHTML = `
    <div class="homeView">
      <div class="heroImage">
        <img src="./assets/spiderman.png" alt="Spider-Man" />
      </div>

      <h1>Spider-Man Chat 🕷️</h1>
      <p class="tagline">Tu amigable vecino Spider-Man, ahora en un chat.</p>

      <div class="infoCard">
        <h2>Sobre el personaje</h2>
        <p>
          Peter Parker es un joven de Queens, Nueva York, que tras un accidente
          con una araña radiactiva obtuvo poderes arácnidos. De día es un
          estudiante normal; de noche, protege la ciudad como Spider-Man,
          siempre con un chiste a flor de piel y un fuerte sentido de
          responsabilidad.
        </p>
      </div>

      <a class="navLink" href="/chat">Comenzar a chatear</a>
    </div>
  `;
}

// -------------------- ABOUT --------------------
function renderAbout() {
  app.innerHTML = `
    <div class="aboutView">
      <h1>About</h1>

      <div class="infoCard">
        <h2>El Personaje</h2>
        <p>
          Spider-Man (Peter Parker) es uno de los superhéroes más populares del
          universo Marvel. Combina humor, agilidad y un fuerte código moral
          resumido en su frase más conocida: "un gran poder conlleva una gran
          responsabilidad".
        </p>
      </div>

      <div class="infoCard">
        <h2>El Proyecto</h2>
        <p>
          Spider-Man Chat es una Single Page Application desarrollada como
          Proyecto Integrador del Módulo 3. Permite chatear con Spider-Man
          usando Google Gemini AI, con routing implementado mediante History
          API y un diseño mobile-first.
        </p>
      </div>

      <div class="infoCard">
        <h2>Tecnologías</h2>
        <ul>
          <li>HTML, CSS y JavaScript (Vanilla, ES Modules)</li>
          <li>Google Gemini AI</li>
          <li>Vercel Serverless Functions</li>
          <li>Vitest para testing</li>
        </ul>
      </div>

      <a class="navLink" href="/chat">Ir al chat</a>
    </div>
  `;
}

// -------------------- CHAT --------------------
function renderChat() {
  app.innerHTML = `
    <div class="chatView">
      <h1>Chat con Spider-Man 🕷️</h1>

      <div class="chat-header-row">
        <span id="historyBadge" class="historyBadge">💾 Historial guardado</span>
        <button id="clearHistoryBtn" class="clearBtn">Borrar historial</button>
      </div>

      <div id="chatBox" class="chat-box"></div>

      <div class="chat-input-row">
        <input id="inputMessage" placeholder="Escribe un mensaje..." />
        <button id="sendBtn">Enviar</button>
      </div>
    </div>
  `;

  renderMessages();

  const input = document.getElementById("inputMessage");
  document.getElementById("sendBtn").addEventListener("click", sendMessage);

  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    messages = [];
    clearHistory();
    renderMessages();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
}

// -------------------- 404 --------------------
function renderNotFound() {
  app.innerHTML = `
    <h1>404 - Página no encontrada</h1>
    <p>La ruta <code>${window.location.pathname}</code> no existe.</p>
  `;
}

// -------------------- RENDER MESSAGES --------------------
function renderMessages() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  chatBox.innerHTML = messages
    .map(
      (msg) => `
      <p class="msg msg-${msg.role === "Usuario" ? "user" : "bot"}">
        <b>${msg.role}:</b> ${msg.text}
      </p>
    `
    )
    .join("");

    chatBox.scrollTop = chatBox.scrollHeight;

  // Extra credit: guardamos el historial solo si hay mensajes de verdad.
  // Si está vacío (recién borrado, o nunca hubo conversación), lo borramos
  // de localStorage en vez de guardar un arreglo vacío — si no, el badge
  // "Historial guardado" se quedaría encendido después de borrar.
  if (messages.length > 0) {
    saveHistory(messages);
  } else {
    clearHistory();
  }
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const badge = document.getElementById("historyBadge");
  if (!badge) return;
  badge.classList.toggle("visible", hasStoredHistory());
}

// -------------------- SEND MESSAGE --------------------
async function sendMessage() {
  const input = document.getElementById("inputMessage");
  const sendBtn = document.getElementById("sendBtn");
  const text = input.value.trim();

  if (!text) return;

  // Guardamos el historial ANTES de agregar el mensaje actual,
  // para mandárselo a Gemini y que mantenga contexto.
  const historyForAPI = [...messages];

  messages.push({ role: "Usuario", text });
  renderMessages();
  input.value = "";

  // Bloqueamos input y botón mientras esperamos respuesta: evita que el
  // usuario mande varios mensajes en menos de un segundo y dispare un
  // 429 por exceso de solicitudes (sugerencia del profe en clase).
  input.disabled = true;
  sendBtn.disabled = true;

  messages.push({ role: "Spider-Man", text: "🕷️ escribiendo..." });
  renderMessages();

  try {
    const reply = await sendChatMessage(text, historyForAPI);
    messages.pop(); // quita "escribiendo..."
    messages.push({ role: "Spider-Man", text: reply });
    renderMessages();
    unlockChatInput();
  } catch (error) {
    console.error("Error al hablar con Spider-Man:", error);
    messages.pop(); // quita "escribiendo..."

    if (error.status === 429) {
      // Caso específico: límite de peticiones excedido. Mostramos un
      // contador visual y mantenemos el chat bloqueado hasta que termine.
      const seconds = parseRetryDelaySeconds(error.retryDelay);
      runRateLimitCountdown(seconds);
    } else {
      messages.push({ role: "Spider-Man", text: "Error conectando con Spider-Man 😢" });
      renderMessages();
      unlockChatInput();
    }
  }
}

function unlockChatInput() {
  const input = document.getElementById("inputMessage");
  const sendBtn = document.getElementById("sendBtn");
  if (!input || !sendBtn) return;
  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

// Muestra "Estoy ocupado... espera Ns" y va bajando el contador cada
// segundo. Al llegar a 0, desbloquea el chat para que se pueda escribir
// de nuevo. (Estrategia explicada por el profe para manejar el 429.)
function runRateLimitCountdown(seconds) {
  let remaining = seconds;

  const tick = () => {
    if (messages.length && messages[messages.length - 1].isCountdown) {
      messages.pop();
    }

    if (remaining <= 0) {
      messages.push({
        role: "Spider-Man",
        text: "¡Ya volví! Dime, ¿en qué te ayudo? 🕸️",
        isCountdown: true,
      });
      renderMessages();
      unlockChatInput();
      return;
    }

    messages.push({
      role: "Spider-Man",
      text: `Estoy esquivando muchas preguntas a la vez... dame ${remaining}s 🕸️`,
      isCountdown: true,
    });
    renderMessages();

    remaining -= 1;
    setTimeout(tick, 1000);
  };

  tick();
}

// -------------------- NAV ACTIVA --------------------
function updateActiveNavLink(route) {
  navLinks.forEach((link) => {
    const linkRoute = link.getAttribute("href").replace("/", "");
    link.classList.toggle("active", linkRoute === route);
  });
}

// -------------------- ROUTER --------------------
function router() {
  const route = resolveRoute(window.location.pathname);

  if (route === "chat") renderChat();
  else if (route === "about") renderAbout();
  else if (route === "home") renderHome();
  else renderNotFound(); // ruta desconocida → 404

  updateActiveNavLink(route);
}

function navigateTo(path) {
  history.pushState(null, "", path);
  router();
}

// -------------------- INTERCEPCIÓN SELECTIVA DE CLICKS --------------------
// Usamos <a href="/ruta"> reales (accesibilidad, SEO, click derecho, Ctrl-click)
// e interceptamos solo los clicks normales sobre enlaces internos.
document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Dejar pasar: Ctrl/Cmd/Shift-click (abrir en pestaña nueva), target=_blank,
  // links externos, anchors, mailto y tel.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target === "_blank") return;
  if (link.origin !== window.location.origin) return;
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
  if (!href.startsWith("/")) return;

  event.preventDefault();
  navigateTo(href);
});

window.addEventListener("popstate", router);

router(); // Render inicial según la URL actual