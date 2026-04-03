import {RESUME_PARSER_PROMPT} from "./prompt.js";
import express, { response } from "express";
import {PDFParse } from "pdf-parse";
import fs from "fs";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import {GoogleGenAI} from "@google/genai";
import { error } from "console";

const app = express();
const upload = multer({dest: 'uploads/'})  // temp storage for files
app.use(cors({
    origin: '*', // Allow ALL origins (including chrome-extension://)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
dotenv.config({path: "./config/config.env"});

const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY})

app.get("/" , (req, res) => {
    res.send("Hey");
})

app.post('/generate-cover-letter', async (req, res) => {
    try {
        const {resumeText, jobDescription} = req.body;

    const prompt = `Write a cover letter for this job: ${jobDescription}. Use my resume: ${resumeText}. Keep it under 150 words, professional. Do not use flowery AI words like 'delve' or 'textament'.`

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{role: "user", parts: [{text: prompt}]}]
    });

    const responseText = result.candidates[0].content.parts[0].text;
    console.log(responseText);
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong generating the letter" });
    }
});

app.post('/analyze-dom', async (req, res) => {
    // Destructure the new 3-part payload
    const { domSkeleton, jobDescription, userProfile } = req.body;

    console.log("🕵️‍♂️ TRIPWIRE 2 - Node Backend Received userProfile:", userProfile);

    if(!domSkeleton || domSkeleton.length === 0){
        return res.status(400).json({success: false, error: "No inputs found on page"});
    }

    console.log(`🤖 Analyzing ${domSkeleton.length} complex custom fields...`);

    const hasFullResume = !!userProfile?.full_resume_data;
    console.log(`👤 CANDIDATE: ${userProfile?.first_name || 'UNKNOWN'} ${userProfile?.last_name || 'UNKNOWN'}`);
    console.log(`📄 FULL RESUME ATTACHED: ${hasFullResume ? '✅ YES' : '❌ NO (AI will hallucinate!)'}`);

    if(!domSkeleton || domSkeleton.length === 0){
        console.log("❌ Error: No form inputs received.");
        return res.status(400).json({success: false, error: "No inputs found on page"});
    }

    // 2. Print the exact questions the AI is about to read
    console.log(`\n❓ QUESTIONS TO ANSWER (${domSkeleton.length}):`);
    domSkeleton.forEach(el => {
        console.log(`   [${el.domId}] -> "${el.label}"`);
    });
    console.log("-------------------------------------------------------");

    try {
        const prompt = `You are an intelligent Job Application Assistant. 
        I have a list of leftover HTML form fields from a job application that standard scripts couldn't autofill. 
        These are usually custom questions (e.g., "Why do you want to work here?", "Portfolio link", "Sponsorship needs").

        CANDIDATE PROFILE (Use this to answer questions about the applicant):
        ${JSON.stringify(userProfile)}

        JOB DESCRIPTION (Use this to tailor specific answers to the company):
        ${jobDescription || "No job description provided."}

        FORM FIELDS TO ANSWER:
        ${JSON.stringify(domSkeleton)}

        INSTRUCTIONS:
        1. Return a JSON object where the KEY is the "domId" of the field, and the VALUE is the exact string you want to type into that field.
        2. If a field asks for a portfolio, GitHub, or LinkedIn, pull the exact URL from the Candidate Profile.
        3. If it is a complex text question (e.g., "Tell me about a time you improved a design system..."), write a concise, professional 1-3 sentence answer. Base the answer on the Candidate Profile and tailor it to the Job Description.
        4. If it's a Yes/No or dropdown question (e.g., "Require sponsorship?"), infer the best answer from the profile or default to standard safe answers.
        5. DO NOT use flowery AI vocabulary like 'delve', 'testament', or 'tapestry'. Keep it highly professional and human.
        6. Return ONLY valid JSON. No markdown formatting blocks.
        
        Example Output:
        {
          "ai_ref_4": "https://github.com/myusername",
          "ai_ref_5": "In my previous role, I migrated our legacy codebase to a modern React architecture, which improved rendering speeds by 30%. I would bring this same focus on efficiency to your engineering team.",
          "ai_ref_6": "No"
        }
        `;

        const completion = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{role: "user", parts: [{text: prompt}]}],
            config: {
                responseMimeType: "application/json",
            }
        });

        const aiResponse = JSON.parse(completion.candidates[0].content.parts[0].text);
        console.log("✅ AI Custom Answers Generated:", aiResponse);
        for (const [key, value] of Object.entries(aiResponse)) {
             // Find the original question label to pair it with the answer
             const originalQuestion = domSkeleton.find(el => el.domId === key)?.label || "Unknown Question";
             console.log(`   Q: "${originalQuestion}"`);
             console.log(`   A: "${value}"\n`);
        }
        
        res.json({success: true, fieldMappings : aiResponse});

    } catch (error) {
        console.error("❌ AI Analysis Failed: ", error);
        res.status(500).json({success: false, error: error.message});
    }
});


app.post('/parse-resume', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // Read file as base64
        const fileData = fs.readFileSync(req.file.path);
        const base64Data = fileData.toString('base64');
        const mimeType = req.file.mimetype;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: RESUME_PARSER_PROMPT }, // The instructions
                        { 
                          inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                          }
                        }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        fs.unlinkSync(req.file.path);
        
        const responseText = result.text;
        //console.log("AI Response:", responseText);
        
        res.json({ success: true, data: JSON.parse(responseText) });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Parsing failed" });
    }
});

app.listen(3000,'127.0.0.1', () => console.log('AI Backend running on port 3000'))
