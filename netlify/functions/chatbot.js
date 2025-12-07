import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ reply: "Missing message." }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are the Obsidian Axis AI assistant." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
      headers: { "Content-Type": "application/json" }
    };

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "Server error: " + error.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
