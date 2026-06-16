import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables (mostly handled by deployment, but good for local)
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "", 
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

type SafetyStatus = 'GREEN' | 'YELLOW' | 'RED';

interface InputPayload {
  alloy: string;
  thickness: number;
  amperage: number;
  voltage: number;
  speed: number;
}

// Assignment 2 Backend logic
app.post("/api/weld-predict", async (req, res) => {
  try {
    const { alloy, thickness, amperage, voltage, speed } = req.body as InputPayload;

    if (!thickness || !amperage || !voltage || !speed) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // 1. Calculate Heat Input (H = A * V / S)
    const H = (amperage * voltage) / speed;

    // 2. Cooling Rate Index Logic
    const heatToThicknessRatio = H / thickness;

    let status: SafetyStatus = 'GREEN';
    let message = 'Optimal Weld - Cooling rate is within ideal parameters.';

    if (heatToThicknessRatio < 60) {
      status = 'RED';
      message = 'High Cracking Risk - Cooling too fast. Increase Preheat or Current.';
    } else if (heatToThicknessRatio > 140) {
      status = 'YELLOW';
      message = 'Warping Risk - Metal will cool too slow (Blow-through risk). Reduce Heat or Increase Travel Speed.';
    }

    if (alloy === '7075' && heatToThicknessRatio < 80 && status !== 'RED') {
       status = 'RED';
       message = 'High Cracking Risk - 7075 Aluminum is highly crack-sensitive. Requires higher baseline preheat and controlled cooling.';
    }

    let aiConsultantAdvice = null;

    // Assignment 2 AI Trigger
    if (status === 'YELLOW' || status === 'RED') {
      const promptString = `Act as a Materials Science Engineer. An aluminum weld of alloy ${alloy} with thickness ${thickness}mm has a calculated heat input of ${H.toFixed(2)} J/mm and was flagged as ${status}. Give 2 precise, technical recommendations to fix the "${message}" issue on the shop floor. Please provide the response in a brief, actionable manner.`;
      
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptString,
        });

        aiConsultantAdvice = response.text || "No advice generated.";
      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
        aiConsultantAdvice = "AI Consultant unavailable due to an error.";
      }
    }

    return res.json({
      heatInput: H,
      status,
      message,
      aiConsultantAdvice
    });
  } catch (error) {
    console.error("Error processing weld prediction:", error);
    res.status(500).json({ error: "Failed to process weld prediction" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
