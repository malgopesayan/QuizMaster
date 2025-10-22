// CORRECTED: The way we require the library is the main fix.
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require("fs");

// --- API Key Management ---
// Simple key rotation to distribute load and mitigate single-key failures.
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean); // Filter out any undefined keys

if (apiKeys.length === 0) {
  throw new Error("FATAL ERROR: No GEMINI_API_KEY found in .env file.");
}

let keyIndex = 0;
const getGenAI = () => {
  const apiKey = apiKeys[keyIndex];
  keyIndex = (keyIndex + 1) % apiKeys.length; // Rotate to the next key for the next call
  // Pass the API key directly to the constructor
  return new GoogleGenerativeAI(apiKey);
};


// --- Model Configuration ---
// Safety settings to reduce the chance of the API blocking responses.
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

/**
 * Converts a file to a base64 encoded string for the Gemini API.
 * This is the modern way to handle inline data.
 * @param {string} path - The path to the file.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {{inlineData: {data: string, mimeType: string}}}
 */
const fileToGenerativePart = (path, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
};

/**
 * Generates topics from a PDF file.
 * @param {string} filePath - Path to the PDF file.
 * @param {string} mimeType - Mime type of the file.
 * @returns {Promise<object>} - The generated topics.
 */
const generateTopics = async (filePath, mimeType) => {
  const genAI = getGenAI();
  // As requested: Use gemini-1.5-flash for topic extraction
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings }); 
  const filePart = fileToGenerativePart(filePath, mimeType);

  const prompt = `
    Analyze the content of the provided PDF document.
    Identify up to 10 main topics or chapters.
    For each topic, provide a concise "title" and a one-sentence "description".
    Return the output as a valid JSON array of objects. Example: [{"title": "Topic 1", "description": "A brief summary."}]
    Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();
    const topics = JSON.parse(responseText);
    console.log(`✅ Generated ${topics.length} topics.`);
    return topics;
  } catch (error) {
    console.error("❌ Error generating topics:", error.response ? error.response.text() : error);
    throw new Error("AI failed to generate topics from the document.");
  }
};

/**
 * Generates a quiz for a selected topic from a PDF file.
 * @param {string} topic - The title of the topic for the quiz.
 * @param {number} questionCount - The number of questions to generate.
 * @param {string} filePath - Path to the PDF file.
 * @param {string} mimeType - Mime type of the file.
 * @returns {Promise<object>} - The generated quiz object.
 */
const generateQuiz = async (topic, questionCount, filePath, mimeType) => {
  const genAI = getGenAI();
  // As requested: Use gemini-1.5-pro for question generation
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro", safetySettings });
  const filePart = fileToGenerativePart(filePath, mimeType);

  const prompt = `
    You are a Quiz Generator. Based on the provided document, create a quiz specifically about the topic: "${topic}".
    Generate exactly ${questionCount} multiple-choice questions.
    For each question, you must provide:
    1. A unique "id" (as a string, e.g., "q1").
    2. The "question" text.
    3. An array of exactly 4 string "options".
    4. The index (0-3) of the "correctAnswer".
    5. A concise "explanation" for why the correct answer is right.
    Return the output as a single, valid JSON object with a key "questions" that holds an array of these question objects.
    Do not include any markdown formatting like \`\`\`json.
  `;

  try {
    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();
    const quiz = JSON.parse(responseText);
    console.log(`✅ Generated a ${quiz.questions.length}-question quiz for topic: "${topic}"`);
    return quiz;
  } catch (error) {
    console.error("❌ Error generating quiz:", error.response ? error.response.text() : error);
    throw new Error("AI failed to generate the quiz.");
  }
};

/**
 * Analyzes a list of wrong answers to identify weak areas.
 * @param {Array<object>} wrongAnswers - Array of wrong answer objects.
 * @returns {Promise<object>} - AI-generated analysis of weak areas.
 */
const analyzeWeakAreas = async (wrongAnswers) => {
    if (!wrongAnswers || wrongAnswers.length === 0) {
        return { analysis: "No wrong answers submitted for analysis. Great job!" };
    }
    const genAI = getGenAI();
    // As requested: Use gemini-1.5-flash for weak area analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
    
    const prompt = `
        A user has submitted the following list of questions they answered incorrectly.
        Analyze these questions and identify the key themes or weak areas.
        Provide a concise, helpful summary (2-3 sentences) pointing out what the user should focus on studying.
        
        Incorrect Questions:
        ${JSON.stringify(wrongAnswers, null, 2)}
        
        Return your analysis as a valid JSON object with a single key "analysis".
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const analysis = JSON.parse(responseText);
        console.log(`✅ Generated weak area analysis.`);
        return analysis;
    } catch (error) {
        console.error("❌ Error analyzing weak areas:", error.response ? error.response.text() : error);
        throw new Error("AI failed to analyze weak areas.");
    }
};

module.exports = {
  generateTopics,
  generateQuiz,
  analyzeWeakAreas,
};