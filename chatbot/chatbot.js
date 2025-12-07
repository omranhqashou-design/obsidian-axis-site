const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

// Add message bubbles
function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "msg msg-user" : "msg msg-bot";
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// Submit handler
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  userInput.value = "";
  userInput.disabled = true;

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();
    addMessage(data.reply || "⚠️ No response from server.", "bot");

  } catch (err) {
    addMessage("❌ Error: " + err.message, "bot");
  }

  userInput.disabled = false;
  userInput.focus();
});

// Hint buttons
document.querySelectorAll(".hint-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    userInput.value = btn.dataset.hint;
    chatForm.dispatchEvent(new Event("submit"));
  });
});
