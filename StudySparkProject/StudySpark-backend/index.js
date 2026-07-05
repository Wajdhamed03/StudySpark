const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// إعداد مكتبة الذكاء الاصطناعي بمفتاحك السري
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// إعداد نظام مؤقت لاستقبال الملفات المرفوعة في الذاكرة
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// المسار الأساسي للتأكد من عمل السيرفر
app.get('/', (req, res) => {
  res.send('StudySpark Engine is Running! 🚀');
});

// المسار السحري لاستقبال النصوص أو الملفات وتوليد المحتوى بالذكاء الاصطناعي
app.post('/api/generate', upload.single('file'), async (req, res) => {
  try {
    let contents = [];

    // إذا قام المستخدم برفع ملف، نمرره مباشرة لجيميناي ليقرأه بأعلى دقة
    if (req.file) {
      contents.push({
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      });
    }

   // إضافة النص والتوجيه الذكي المرن لتقييم المحتوى وتغطيته بالكامل
    let textPrompt = `Analyze the provided study material thoroughly as an expert university professor. 
    Your goal is to ensure comprehensive coverage of ALL important concepts, definitions, details, and core topics within the material.
    
    CRITICAL INSTRUCTIONS:
    1. Do NOT limit yourself to a fixed number of flashcards or quiz questions.
    2. Dynamically adjust the quantity based on the depth and length of the material. If the material is dense or contains multiple chapters/topics, generate a large, comprehensive set of flashcards and questions to fully test the student's knowledge.
    3. Ensure every crucial concept that is essential for a university exam is represented in either a flashcard or a quiz question.
    4. You MUST respond with a valid JSON object ONLY. Do not include markdown code blocks like \`\`\`json.

    Expected JSON Structure:
    {
      "summary": "Detailed summary paragraphs explaining the material completely",
      "key_concepts": ["concept 1", "concept 2", "concept 3"],
      "formulas": ["formula 1 if any"],
      "definitions": [{"term": "word", "definition": "meaning"}],
      "flashcards": [{"question": "Q1", "answer": "A1"}, {"question": "Q2", "answer": "A2"}],
      "quiz_questions": [
        {
          "type": "multiple_choice",
          "question": "Q1",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Detailed explanation of why this is correct and why others are wrong"
        }
      ]
    }`;

    if (req.body.text) {
      textPrompt += `\n\nAdditional Text Provided:\n${req.body.text}`;
    }

    contents.push(textPrompt);

    // استدعاء نموذج جيميناي المطور والأحدث لقراءة الملفات وهيكلتها كـ JSON
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });

    let responseText = response.text;
    
    // تنظيف نص الـ JSON المستلم من أي علامات دبل كوتس زائدة أو مارك داون
    responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

    const cleanJson = JSON.parse(responseText);
    res.json(cleanJson);

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to process material with AI' });
  }
});

// مسار خاص بالـ AI Tutor لاستقبال الأسئلة النصية والإجابة عليها
app.post('/api/tutor', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const prompt = `
      You are an expert, friendly AI Study Tutor named StudySpark Tutor. 
      Your goal is to help university students understand technical and complex computer science concepts easily.
      Explain the concepts simply, give clear real-world examples.
      Always respond using a supportive, encouraging, witty, and clear tone.

      User Question: ${question}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("Error in AI Tutor:", error);
    res.status(500).json({ error: "Failed to process tutor request" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 StudySpark Backend is happily listening on port ${PORT}`);
});