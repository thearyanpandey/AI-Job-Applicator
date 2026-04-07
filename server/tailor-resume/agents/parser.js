import pdfParse from "pdf-parse";
import { generateWithGemini } from "../providers/aiClient.js";
import { getParserPrompt } from "../prompts/resumePrompts.js";

export const parsePdfToJson = async (pdfBuffer) => {
    console.log("---Agent C (Parser) Starting----");

    try {
        console.log("Extracting text from PDF...");
        const pdfData = await pdfParse(pdfBuffer);
        const rawText = pdfData.text;

        if(!rawText || rawText.trim() === ""){
            throw new Error("Could not extract text from the provided PDF.");
        }

        console.log("Structuring data with AI....");
        const prompt = getParserPrompt(rawText);

        const aiResponseText = await generateWithGemini(prompt);

        const cleanText = aiResponseText.replace(/```json/g, "").replace(/```/g, "");
        const parsedJson = JSON.parse(cleanText);

        console.log("---Agent C Finish----");
        return parsedJson;

    } catch (error) {
        console.error("Parser Agent Error:", error);
        throw new Error("Failed to parse PDF into JSON.");
    }
}