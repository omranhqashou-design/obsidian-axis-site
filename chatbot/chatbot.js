const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");

/* ---------------------------
   ADD MESSAGE TO CHAT
---------------------------- */
function addMessage(text, sender = "bot", typing = false) {
  const msg = document.createElement("div");
  msg.className = sender === "user" ? "msg msg-user" : "msg msg-bot";

  // For streaming animation
  if (typing) {
    msg.setAttribute("data-typing", "true");
    msg.textContent = "";
  } else {
    msg.textContent = text;
  }

  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;

  return msg;
}

/* ---------------------------
   TYPING INDICATOR (THINKING…)
---------------------------- */
let thinkingBubble = null;

function showThinking() {
  // prevent duplicates
  if (thinkingBubble) return;

  thinkingBubble = document.createElement("div");
  thinkingBubble.className = "msg msg-bot typing-indicator";
  thinkingBubble.innerHTML = "<span></span><span></span><span></span>";
  chatLog.appendChild(thinkingBubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function hideThinking() {
  if (thinkingBubble) {
    thinkingBubble.remove();
    thinkingBubble = null;
  }
}

/* --------------------------------------------
   TYPE OUT AI RESPONSE (STREAMING EFFECT)
--------------------------------------------- */
async function typeText(element, text, speed = 18) {
  for (let i = 0; i < text.length; i++) {
    await new Promise((res) => setTimeout(res, speed));
    element.textContent += text[i];
    chatLog.scrollTop = chatLog.scrollHeight;
  }
}

/* ---------------------------
   SEND USER MESSAGE
---------------------------- */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Show user message
  addMessage(text, "user");
  userInput.value = "";
  userInput.disabled = true;

  // Show thinking bubble
  showThinking();

  try {
    const response = await fetch("/.netlify/functions/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    const data = await response.json();
    const reply = data.reply || "⚠️ No response from server.";

    hideThinking();

    // Create empty bubble for streaming
    const msgElement = addMessage("", "bot", true);

    // Stream reply
    await typeText(msgElement, reply);

    msgElement.removeAttribute("data-typing");

  } catch (err) {
    hideThinking();
    addMessage("❌ Error: " + err.message, "bot");
  }

  userInput.disabled = false;
  userInput.focus();
});

/* ---------------------------
   HINT BUTTONS
---------------------------- */
document.querySelectorAll(".hint-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    userInput.value = btn.dataset.hint;
    chatForm.dispatchEvent(new Event("submit"));
  });
});
