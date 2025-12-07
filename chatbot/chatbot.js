const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// Append messages to chat window
function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "msg msg-user" : "msg msg-bot";
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Handle sending message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // add user message
  addMessage(text, "user");

  userInput.value = "";
  userInput.disabled = true;

  // send to backend
  try {
    const res = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    if (data.reply) {
      addMessage(data.reply, "bot");
    } else {
      addMessage("⚠️ No reply received from server.", "bot");
    }

  } catch (err) {
    addMessage("❌ Error: " + err.message, "bot");
  }

  userInput.disabled = false;
  userInput.focus();
});

// Hint button support
document.querySelectorAll(".hint-pill").forEach((hint) => {
  hint.addEventListener("click", () => {
    userInput.value = hint.dataset.hint;
    chatForm.dispatchEvent(new Event("submit"));
  });
});
