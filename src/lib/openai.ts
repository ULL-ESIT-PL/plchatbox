import axios from "axios";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const HEADER = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json",
}; 

export async function generateEmbedding(input: string): Promise<number[]> {
    const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
            input,
            model: "text-embedding-ada-002",
        },
        { headers: HEADER }
    );

    return response.data.data[0].embedding;
}

export async function generateChatCompletion(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  model: string = "gpt-3.5-turbo",
  temperature = 0.3
): Promise<string> {
    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model,
            messages,
            temperature,
        },
        { headers: HEADER }
    );

    return response.data.choices[0].message.content.trim();
}




