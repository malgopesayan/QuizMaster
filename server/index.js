const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

// Verify API keys are present
if (!process.env.GEMINI_API_KEY_1 || !process.env.GEMINI_API_KEY_2) {
  console.error("❌ FATAL ERROR: GEMINI_API_KEY_1 or GEMINI_API_KEY_2 not found in .env");
  process.exit(1);
}

const { generateTopics, generateQuiz, analyzeWeakAreas } = require("./services/pdfService.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

// Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer configuration for file uploads
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

/**
 * Endpoint 1: Upload PDF and generate topics
 */
app.post("/api/upload-and-analyze", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "No PDF file uploaded." });
  }

  const filePath = req.file.path;
  try {
    const topics = await generateTopics(filePath, req.file.mimetype);
    res.json({
      success: true,
      topics,
      // Send back the temporary filename for the next API call
      uploadedFileName: req.file.filename, 
    });
  } catch (error) {
    console.error("❌ Error in /api/upload-and-analyze:", error.message);
    // Clean up failed upload
    fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting failed upload file:", err);
    });
    res.status(500).json({
      success: false,
      error: "Failed to process PDF with Gemini AI.",
      details: error.message,
    });
  }
});

/**
 * Endpoint 2: Generate quiz for a selected topic
 */
app.post("/api/generate-quiz", async (req, res) => {
  const { topic, questionCount, uploadedFileName } = req.body;

  if (!topic || !questionCount || !uploadedFileName) {
    return res.status(400).json({ success: false, error: "Missing required parameters." });
  }

  const filePath = path.join(uploadDir, uploadedFileName);
  const mimeType = 'application/pdf'; // We know it's a PDF from the first step

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: "Uploaded file not found. Please upload again." });
  }

  try {
    const quiz = await generateQuiz(topic, questionCount, filePath, mimeType);
    res.json({ success: true, quiz });
  } catch (error) {
    console.error("❌ Error in /api/generate-quiz:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate quiz from Gemini AI.",
      details: error.message,
    });
  } finally {
      // Clean up the file after the quiz is generated
      fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
          else console.log(`🗑️ Cleaned up file: ${uploadedFileName}`);
      });
  }
});

/**
 * Endpoint 3: Analyze weak areas from wrong answers
 */
app.post("/api/analyze-weak-areas", async (req, res) => {
    const { wrongAnswers } = req.body;
    if (!wrongAnswers) {
        return res.status(400).json({ success: false, error: "Missing wrongAnswers data." });
    }
    try {
        const result = await analyzeWeakAreas(wrongAnswers);
        res.json({ success: true, result });
    } catch (error) {
        console.error("❌ Error in /api/analyze-weak-areas:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to analyze weak areas with Gemini AI.",
            details: error.message,
        });
    }
});

// --- Existing endpoints for local wrong answer storage (NO CHANGES) ---

app.post("/api/save-wrong-answer", async (req, res) => {
  const { question, userAnswer, correctAnswer, topic, explanation } = req.body;
  try {
    const wrongAnswersFile = path.join(__dirname, "wrong-answers.json");
    let wrongAnswers = [];
    if (fs.existsSync(wrongAnswersFile)) {
      const data = fs.readFileSync(wrongAnswersFile, 'utf8');
      if (data) wrongAnswers = JSON.parse(data);
    }
    const wrongAnswer = {
      id: Date.now().toString(),
      question,
      userAnswer,
      correctAnswer,
      topic,
      explanation,
      timestamp: new Date().toISOString(),
      reviewCount: 0
    };
    wrongAnswers.push(wrongAnswer);
    fs.writeFileSync(wrongAnswersFile, JSON.stringify(wrongAnswers, null, 2));
    res.json({ success: true, message: "Wrong answer saved" });
  } catch (error) {
    console.error("❌ Error saving wrong answer:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to save wrong answer",
      details: error.message,
    });
  }
});

app.get("/api/wrong-answers", (req, res) => {
  try {
    const wrongAnswersFile = path.join(__dirname, "wrong-answers.json");
    if (!fs.existsSync(wrongAnswersFile)) {
      return res.json({ success: true, wrongAnswers: [] });
    }
    const data = fs.readFileSync(wrongAnswersFile, 'utf8');
    const wrongAnswers = data ? JSON.parse(data) : [];
    res.json({ success: true, wrongAnswers });
  } catch (error) {
    console.error("❌ Error getting wrong answers:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to get wrong answers",
      details: error.message,
    });
  }
});

// --- Server Start ---

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);