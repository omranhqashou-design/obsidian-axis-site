// ====== DOM ELEMENTS ======
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const hintButtons = document.querySelectorAll(".hint-pill");

let isSending = false;

// ====== HELPERS ======

function createMessageElement(text, role = "bot") {
  const div = document.createElement("div");
  const cls =
    role === "user" ? "msg msg-user" : role === "error" ? "msg msg-error" : "msg msg-bot";
  div.className = cls;

  // support simple line breaks
  text.split(/\n+/).forEach((line, idx) => {
    const p = document.createElement("p");
    p.textContent = line;
    if (idx > 0) div.appendChild(document.createElement("br"));
    div.appendChild(p);
  });

  return div;
}

function addMessage(text, role = "bot") {
  const el = createMessageElement(text, role);
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function addTypingIndicator() {
  const wrapper = document.createElement("div");
  wrapper.className = "msg msg-bot";
  const typing = document.createElement("div");
  typing.className = "msg-typing";
  typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  wrapper.appendChild(typing);
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
  return wrapper;
}

function extractReply(data) {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (data.reply) return data.reply;
  if (data.answer) return data.answer;
  if (data.message) return data.message;
  if (Array.isArray(data.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }
  if (typeof data.body === "string") return data.body;
  return null;
}

function setSendingState(sending) {
  isSending = sending;
  if (!sendBtn) return;
  sendBtn.disabled = sending;
  sendBtn.textContent = sending ? "Sending…" : "Send";
}

// ====== MAIN SEND LOGIC ======

async function sendMessage(message) {
  if (!message || isSending) return;

  // show user message
  addMessage(message, "user");
  setSendingState(true);

  // typing indicator
  const typingEl = addTypingIndicator();

  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json().catch(() => null);
    const reply = extractReply(data);

    typingEl.remove();

    if (!res.ok || !reply) {
      console.error("Bad response from chatbot function:", data);
      addMessage(
        "Server error: I couldn’t generate a reply. Double-check your API key and function, then try again.",
        "error"
      );
      return;
    }

    addMessage(reply, "bot");
  } catch (err) {
    console.error("Network or function error:", err);
    typingEl.remove();
    addMessage(
      "Network error: I couldn’t reach the backend function. Check your Netlify function logs and try again.",
      "error"
    );
  } finally {
    setSendingState(false);
  }
}

// ====== EVENT LISTENERS ======

if (chatForm) {
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = (userInput.value || "").trim();
    if (!value) return;
    userInput.value = "";
    sendMessage(value);
  });
}

hintButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = btn.getAttribute("data-hint") || btn.textContent;
    if (!text) return;
    userInput.value = text;
    userInput.focus();
  });
});

// allow Enter key to send, Shift+Enter for newline (in case you swap to textarea later)
if (userInput) {
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm?.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });
}
