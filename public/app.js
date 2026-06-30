import { resolveRoute, sendChatMessage } from "./utils.js";
 
const app = document.getElementById("app");
const navLinks = document.querySelectorAll("#navbar .navLink");
 
let messages = [];
 
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
// -------------------- ABOUT --------------------
function renderAbout() {
  app.innerHTML = `
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
        Esta aplicación nació como mi Proyecto Integrador del Módulo 3 de Full
        Stack Development. La idea fue simple: tomar todo lo aprendido durante
        el módulo (routing sin recargar la página, consumo de APIs de IA, y
        protección de credenciales en el backend) y aplicarlo a algo
        divertido — hablar con Spider-Man como si estuviera realmente ahí.
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
  `;
}

// -------------------- CHAT --------------------
function renderChat() {
  app.innerHTML = `
    <h1>Chat con Spider-Man 🕷️</h1>
 
    <div id="chatBox" class="chat-box"></div>
 
    <div class="chat-input-row">
      <input id="inputMessage" placeholder="Escribe un mensaje..." />
      <button id="sendBtn">Enviar</button>
    </div>
  `;
 
  renderMessages();
 
  const input = document.getElementById("inputMessage");
  document.getElementById("sendBtn").addEventListener("click", sendMessage);
 
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
}
 
// -------------------- SEND MESSAGE --------------------
async function sendMessage() {
  const input = document.getElementById("inputMessage");
  const text = input.value.trim();
 
  if (!text) return;
 
  // Guardamos el historial ANTES de agregar el mensaje actual,
  // para mandárselo a Gemini y que mantenga contexto.
  const historyForAPI = [...messages];
 
  messages.push({ role: "Usuario", text });
  renderMessages();
  input.value = "";
 
  messages.push({ role: "Spider-Man", text: "🕷️ escribiendo..." });
  renderMessages();
 
  try {
    const reply = await sendChatMessage(text, historyForAPI);
    messages.pop(); // quita "escribiendo..."
    messages.push({ role: "Spider-Man", text: reply });
    renderMessages();
  } catch (error) {
    console.error("Error al hablar con Spider-Man:", error);
    messages.pop();
    messages.push({ role: "Spider-Man", text: "Error conectando con Spider-Man 😢" });
    renderMessages();
  }
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