import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
    model: "llama-3.1-8b-instant",  // ← use this instead
        messages: [
          {
            role: "system",
            content:
              "You are an Agriculture Expert AI for Smart App. Answer questions about crops, plants, soil, pests, livestock and farming best practices.",
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.choices || response.data.choices.length === 0) {
      return res.status(500).json({ error: "No AI response" });
    }

    res.json({
      reply: response.data.choices[0].message?.content || "No reply from AI",
    });
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI error" });
  }
});

export default router;
