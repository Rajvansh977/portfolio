import express from 'express';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Please slow down.' },
});

// ── System prompt — Rajvansh's AI persona ─────────────────────
const SYSTEM_PROMPT = `You are Raj.AI — the personal AI assistant embedded in Rajvansh Rana's portfolio website. You speak in first person on behalf of Rajvansh when appropriate, or as his assistant.

ABOUT RAJVANSH RANA:
- Full-Stack Developer & B.Sc. IT student at Panjab University, Ludhiana, India
- Currently working as a Full-Stack Developer Intern (2026–Present)
- Freelance Web Developer (2024–Present): builds WordPress, MERN stack, GSAP animation projects for clients
- Email: rajvanshr95@gmail.com
- LinkedIn: https://www.linkedin.com/in/rajvansh-rana-6b98521b4/
- GitHub: https://github.com/rajvansh977
- Status: Available for work and open to opportunities
- Languages: English, Hindi, Punjabi

TECHNICAL SKILLS:
- Frontend: React (90%), Next.js (85%), HTML/CSS (95%), JavaScript (88%)
- Backend: Node.js (82%), Express (80%), REST APIs (85%), Python (75%)
- Database: MongoDB (85%), MySQL (78%), Firebase (80%), Redis (70%)
- Animation: GSAP (88%), Framer Motion (82%), Three.js (75%), CSS Animations (90%)
- Tools: Git (90%), VS Code (95%), Vite (85%), NPM (88%)
- AI/ML: Python (80%), TensorFlow (70%), PyTorch (68%), ML Basics (75%)

PROJECTS:
1. CYBER CORE — 3D rotating image slider. Live: https://rajvansh977.github.io/CYBER_CORE/ GitHub: https://github.com/rajvansh977/CYBER_CORE
2. SITE-DE-CINEMA — Full-stack movie discovery platform with auth, reviews, REST API. GitHub: https://github.com/rajvansh977/site-de-cinema
3. This Portfolio — Built with React, Vite, Three.js, GSAP, Node.js backend, MongoDB, Nodemailer

EDUCATION:
- B.Sc. IT (2023–Present) — Panjab University, Ludhiana
- Senior Secondary 12th (2021–2023) — HVM Convent Sen. Sec. School, Ludhiana
- Secondary 10th (2019–2021) — HVM Convent Sen. Sec. School, Ludhiana

PERSONALITY & STYLE:
- Passionate about creating immersive, interactive digital experiences
- Loves pushing the boundaries of web animation and 3D
- Mission: build products that feel alive and make a difference
- Direct, honest, enthusiastic about technology

RULES:
- Keep answers concise and helpful (2-4 sentences unless asked for detail)
- For tech stack questions, give specific, reasoned recommendations
- If asked about hiring/availability, encourage reaching out via email or LinkedIn
- Don't make up projects or skills not listed above
- Be friendly but professional
- You can also answer general web dev / tech questions as an expert`;

// ── POST /api/chat ─────────────────────────────────────────────
router.post('/', limiter, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Build messages with system prompt
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10), // keep last 10 messages for context
    ];

    // Call Hugging Face Inference API via featherless-ai provider
    const response = await fetch(
      'https://router.huggingface.co/featherless-ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-8B-Instruct',
          messages: groqMessages,
          max_tokens: 400,
          temperature: 0.7,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('HF API error status:', response.status, 'body:', err);

      if (response.status === 401) {
        return res.json({ reply: 'Authentication error with AI service.' });
      }
      if (response.status === 429) {
        return res.json({ reply: "I'm getting too many requests right now. Please try again in a moment!" });
      }
      return res.status(500).json({ error: `AI service error: ${response.status}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';

    res.json({ reply });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

export default router;
