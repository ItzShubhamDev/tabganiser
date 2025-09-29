import express from "express";
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import { Type } from "@google/genai";
import cors from "cors";
config({ path: ".env.local" });

const app = express();

const categories = [
    "Work",
    "Entertainment",
    "Social",
    "News",
    "Shopping",
    "Tech",
    "Tools",
    "Others",
];

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY,
    model: "gemini-2.5-flash",
});

const systemInstruction = `
You are an expert website classifier. Your task is to categorize the given website URL into one of the following predefined categories: ${categories.join(
    ", "
)}. You must only respond with a JSON object containing the determined category.`;

app.use(express.json());
app.use(
    cors({
        origin: process.env.EXTENSION_ID,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
    })
);

app.post("/category", async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Please categorize the website found at this URL: ${url}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.STRING,
                    enum: categories,
                },
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            const category = response.candidates[0].content.parts[0].text
                .trim()
                .replace(/["']/g, "");

            return res.json({ category });
        } else {
            return res.status(500).json({ error: "No response from AI" });
        }
    } catch (error) {
        console.error("Error classifying URL:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
