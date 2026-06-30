const app = document.getElementById("app");

let messages = [];

// -------------------- HOME --------------------
function renderHome() {
  app.innerHTML = `
    <h1>Spider-Man Chat 🕷️</h1>
    <p>Habla con Peter Parker en tiempo real.</p>
    <button onclick="navigate('/chat')">Ir al chat</button>
  `;
}

// -------------------- ABOUT --------------------
function renderAbout() {
  app.innerHTML = `
    <h1>About</h1>
    <p>Proyecto integrador: Chat con Spider-Man usando IA (Gemini + Vercel Functions).</p>
    <button onclick="navigate('/home')">Volver</button>
  `;
}

// -------------------- CHAT --------------------
function renderChat() {
  app.innerHTML = `
    <h1>Chat con Spider-Man 🕷️</h1>

    <div id="chatBox" style="
      height: 300px;
      overflow-y: auto;
      border: 1px solid #444;
      padding: 10px;
      margin-bottom: 10px;
      background: #111;
      color: white;
    "></div>

    <input id="inputMessage" placeholder="Escribe un mensaje..." />
    <button onclick="sendMessage()">Enviar</button>

    <br/><br/>
    <button onclick="navigate('/home')">Volver</button>
  `;

  renderMessages();

  const input = document.getElementById("inputMessage");

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
}

// -------------------- RENDER MESSAGES --------------------
function renderMessages() {
  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  chatBox.innerHTML = messages
    .map(
      (msg) => `
      <p><b>${msg.role}:</b> ${msg.text}</p>
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

  // Usuario
  messages.push({
    role: "Usuario",
    text,
  });

  renderMessages();

  input.value = "";

  // Loading
  messages.push({
    role: "Spider-Man",
    text: "🕷️ escribiendo...",
  });

  renderMessages();

  try {
    const res = await fetch("/api/functions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: text }),
    });

    const data = await res.json();

    // quitar "escribiendo..."
    messages.pop();

    messages.push({
      role: "Spider-Man",
      text: data.reply || "No tengo respuesta 😅",
    });

    renderMessages();
  } catch (error) {
    messages.pop();

    messages.push({
      role: "Spider-Man",
      text: "Error conectando con Spider-Man 😢",
    });

    renderMessages();
  }
}

// -------------------- ROUTER --------------------
function router() {
  const path = window.location.pathname;

  if (path === "/" || path === "/home") {
    renderHome();
  } else if (path === "/chat") {
    renderChat();
  } else if (path === "/about") {
    renderAbout();
  } else {
    renderHome();
  }
}

function navigate(path) {
  window.history.pushState({}, "", path);
  router();
}

window.addEventListener("popstate", router);

router();