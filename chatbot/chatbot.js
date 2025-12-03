const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const chatWindow = document.getElementById("chat-window");

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  chatInput.value = "";

  appendMessage("bot", "Thinking...");

  const res = await fetch("/.netlify/functions/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();

  chatWindow.removeChild(chatWindow.lastChild);
  appendMessage("bot", data.reply);
}

function appendMessage(author, text) {
  const div = document.createElement("div");
  div.className = `msg ${author}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
