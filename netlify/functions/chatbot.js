export default async (req, context) => {
  try {
    const body = await req.json();
    const message = body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", 
        messages: [
          { role: "system", content: "You are the Obsidian Axis AI assistant." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // Check if OpenAI returned an error
    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI Error:", data);
      return new Response(JSON.stringify({ reply: "Server error: bad OpenAI response." }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({
      reply: "Server error: " + err.message
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
