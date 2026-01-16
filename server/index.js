import {RESUME_PARSER_PROMPT} from "./prompt.js";
import express, { response } from "express";
import {PDFParse } from "pdf-parse";
import fs from "fs";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import {GoogleGenAI} from "@google/genai";

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
    const {domSimplified} = req.body;

    if(!domSimplified || domSimplified.length === 0){
        return res.status(400).json({success: false, error: "No inputs found on page"});
    }

    console.log(`Analyzing ${domSimplified.length} inputs from unknown site...`);

    try {
        const prompt = `You are an intelligent HTML form parser. 
        I have a list of HTML input fields from a job application site. 
        Your goal is to map these fields to my standard User Profile keys.

        My Standard Keys: 
        - first_name, last_name, full_name
        - email, phone
        - linkedin, github, portfolio
        - cover_letter
        - resume (this is for file inputs)

        Here are the Input Fields from the website:
        ${JSON.stringify(domSimplified)}

        INSTRUCTIONS:
        1. Return a JSON object where the KEY is my "Standard Key" and the VALUE is the "id" or "selector" from the input list.
        2. Only include fields you are confident about.
        3. If a field matches "Full Name" but I only have "first_name" and "last_name", map it to "full_name".
        4. Return ONLY the JSON object. No markdown, no text.
        `;

        const completion = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{role: "user", parts: [{text: prompt}]}],
        config: {
                responseMimeType: "application/json",
            }
        });

        const aiResponse = JSON.parse(completion.candidates[0].content.parts[0].text);
        console.log("AI Mapping Found:", aiResponse);
        
        res.json({success: true, fieldMappings : aiResponse});

    } catch (error) {
        console.error("AI Analysis Failed: ", error);
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
