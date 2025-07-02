import dotenv from "dotenv";
import axios from "axios";
import { Pinecone } from "@pinecone-database/pinecone";
import { TOPIC_TEMPLATE, ANSWER_TEMPLATE } from "./prompt-templates";
import { generateEmbedding, generateChatCompletion } from "./openai";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;


// Paso 1: Detectar tema con OpenAI
async function detectarTema(input: string) {
  const prompt = TOPIC_TEMPLATE.replace("{input}", input);

  try {
    const response = await generateChatCompletion([
      { role: "user", content: prompt }
    ], "gpt-3.5-turbo", 0.3);
    return response.trim();
  } catch (error) {
    console.error("Error al detectar el tema:", error);
    throw new Error("No se pudo detectar el tema. Inténtalo de nuevo.");
  }
}


// Paso 2: Obtener embedding del query
async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

// Paso 3: Buscar en Pinecone por tema, en los metadatos de los chunks hay un campo "tema"
async function search(query: string, topK = 5) {
  const pinecone = new Pinecone();
  const index = await pinecone.Index(PINECONE_INDEX_NAME);
  const tema = await detectarTema(query);
  //console.log(`Tema detectado: ${tema}`);

  const embedding = await embedQuery(query);

  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter: {
      tema: { $eq: tema }
    }
  });
  //console.log(`Resultados encontrados: ${results.matches.length} coincidencias`);
  // Mostrar los primeros 3 resultados
  //results.matches.slice(0, 3).forEach((match: any, index: number) => {
  //  console.log(`Resultado ${index + 1}:`, match.metadata?.text || "Sin texto");
  //});
  return results.matches;
}

// Generar respuesta desde chunks
async function generateAnswer(query: string, matches: any[]) {
  const context = matches.map((m: any) => m.metadata?.text || "").join("\n\n");
  console.log(`Contexto encontrado: ${context.slice(0, 200)}...`);  
  if (!context) {
        return "No tengo suficiente información para responder a tu pregunta.";
    }

  const prompt = ANSWER_TEMPLATE.replace("{context}", context).replace("{query}", query);

  const response = await generateChatCompletion([
    { role: "user", content: prompt }
  ], "gpt-3.5-turbo", 0.3);

  return response.trim();
}

// Ejecutar búsqueda completa
export async function handleQuery(query: string): Promise<string> {
  console.log(`Procesando consulta: ${query}`);
  const matches = await search(query);
  const answer = await generateAnswer(query, matches);
  return answer;
}

