const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

const corsMiddleware = cors((req, callback) => {
  const origin = req.headers.origin;
  let corsOptions;
  if (origin === allowedOrigin || origin === allowedOriginDev) {
    corsOptions = { origin: true }; // Allow this origin
  } else {
    corsOptions = { origin: false }; // Block this origin
  }
  callback(null, corsOptions);
});

const handler = async (req, res) => {
    if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json({});
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body; // Vercel automatically parses JSON
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful assistant. Answer: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ answer: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
};

module.exports = (req, res) => {
  corsMiddleware(req, res, () => {
    return handler(req, res);
  });
};