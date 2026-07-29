import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 image uploads (e.g. up to 50MB)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize Gemini API client if key exists
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing");
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      appName: "Document Scanner",
      author: "Nguyễn Trung Tín",
      time: new Date().toISOString()
    });
  });

  // AI OCR & Document Analysis Endpoint
  app.post("/api/ocr", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", promptType = "ocr", targetLanguage = "Vietnamese" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 input" });
      }

      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const ai = getAi();

      let promptText = "";
      if (promptType === "ocr") {
        promptText = "Perform high-accuracy Optical Character Recognition (OCR) on this scanned document image. Extract all text exactly as written in its original formatting. If formulas, tables, or lists are present, preserve their layout cleanly in Markdown. Do not add conversational filler.";
      } else if (promptType === "analyze") {
        promptText = `Analyze this scanned document image thoroughly.
Provide a JSON object response with:
1. "category": Classification (Receipt/Invoice, Contract, ID/Passport, Business Card, Note, Academic, Official Document, or Other)
2. "title": Suggested descriptive title for this document
3. "summary": Brief 2-3 sentence summary of the content
4. "keyData": Array of key extracted fields as objects { "label": string, "value": string } (e.g. Total Amount, Date, Vendor, Parties, Document ID)
5. "language": Main language detected
Format your output cleanly as Markdown with structured headers and bullet points.`;
      } else if (promptType === "translate") {
        promptText = `Extract the text from this document image and translate the extracted text into ${targetLanguage}. Maintain original structural line breaks and formatting.`;
      } else {
        promptText = "Extract all text from this image accurately.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          promptText,
        ],
      });

      const extractedText = response.text || "No text could be extracted from the document.";

      return res.json({
        success: true,
        text: extractedText,
        author: "Nguyễn Trung Tín - Document Scanner Engine"
      });
    } catch (error: any) {
      console.error("OCR API error:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to process image with AI OCR."
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Document Scanner by Nguyễn Trung Tín server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
