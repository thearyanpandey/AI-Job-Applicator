import express, { response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import {GenerateImagesResponse, GoogleGenAI} from "@google/genai";

const app = express();
app.use(cors());
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

    res.json({ fieldMapping : {}});
});

app.listen(3000, () => console.log('AI Backend running on port 3000'))
