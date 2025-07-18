import dotenv from "dotenv";
import axios from "axios";
import { Pinecone } from "@pinecone-database/pinecone";
import { TOPIC_TEMPLATE, ANSWER_TEMPLATE} from "./prompt-templates";
import { generateEmbedding, generateChatCompletion } from "./openai";
import { TemplateContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { topicWithSubtopics, subtopicPrompts } from "./config";
import OpenAI from "openai";
import { StreamingTextResponse, OpenAIStream, LangChainStream, experimental_StreamData } from "ai";
import { ChatCompletionChunk } from "openai/resources/index.mjs";
import crypto from "crypto";


dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,});


async function seleccionarSubtemaMasRelevante(query: string, topic_selected: string): Promise<string> {
  const pinecone = new Pinecone();
  const index = await pinecone.Index(PINECONE_INDEX_NAME);
  const embedding = await embedQuery(query);

  const results = await index.query({
    vector: embedding,
    topK: 10, // Obtener más resultados para agrupar
    includeMetadata: true,
  });

  if (results.matches.length === 0) {
    return "Ninguno";
  }

  // Agrupar resultados por subtema
  const subtopicCounts: Record<string, number> = {};
  const subtopicHigherScore: Record<string, number> = {};
  const subtopicNUmberOfMatches: Record<string, number> = {};

  results.matches.forEach((match: any) => {
    const subtopic = match.metadata?.filename;
    if (subtopicCounts[subtopic]) {
      subtopicCounts[subtopic] += match.score || 0; 
      subtopicNUmberOfMatches[subtopic] += 1; 
      if (match.score > (subtopicHigherScore[subtopic] || 0)) {
        subtopicHigherScore[subtopic] = match.score;
      }
    } else {
      subtopicCounts[subtopic] = match.score || 0; 
      subtopicHigherScore[subtopic] = match.score || 0; 
      subtopicNUmberOfMatches[subtopic] = 1; 
    }
  });

  let selectedSubtopic = "Ninguno";
  let maxScore = -Infinity;
  let maxMatches = 0;
  for (const subtopic in subtopicCounts) {
    const score = subtopicCounts[subtopic];
    const matches = subtopicNUmberOfMatches[subtopic];
    if (matches < 3) {
      continue;
    }
    if (score > maxScore || (score === maxScore && matches > maxMatches)) {
      selectedSubtopic = subtopic;
      maxScore = score;
      maxMatches = matches;
    }
  }

  console.log(`Subtema seleccionado: ${selectedSubtopic}`);

  // Si el subtema seleccionado es "Ninguno", devolver "Ninguno"
  if (selectedSubtopic === "Ninguno") {
    return "Ninguno";
  }

  // Devolver el subtema seleccionado
  return selectedSubtopic;
}
// Nota: Este código asume que los metadatos de los chunks contienen un campo "filename" que representa el subtema. 



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

async function detectarSubtema(input: string, topic_selected: string) {
  const prompt = subtopicPrompts[topic_selected];
  if (!prompt) {
    throw new Error(`No se encontró un prompt para detectar los subtemas de: ${topic_selected}`);
  }
  const formattedPrompt = prompt.replace("{input}", input);
  try {
    const response = await generateChatCompletion([
      { role: "user", content: formattedPrompt }
    ], "gpt-3.5-turbo", 0.3);

    console.log("Subtema detectado en detectarsubtema():", response);

    return response.trim();

  } catch (error) {
    console.error("Error al detectar el subtema:", error);
    throw new Error("No se pudo detectar el subtema. Inténtalo de nuevo.");
  }
}


// Paso 2: Obtener embedding del query
async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

// Paso 3: Buscar en Pinecone por tema, en los metadatos de los chunks hay un campo "tema"
async function search(query: string, topic_selected: string, topK = 5) {
  const pinecone = new Pinecone();
  const index = await pinecone.Index(PINECONE_INDEX_NAME);
  const embedding = await embedQuery(query);

  const hasSubtopic = topicWithSubtopics.includes(topic_selected);
  const isTemaConMuchosSubtemas = topic_selected === "introduction-to-javascript";

  const filter = isTemaConMuchosSubtemas
    ? { filename : { $eq: await seleccionarSubtemaMasRelevante(query, topic_selected) } }
    : hasSubtopic
      ? { filename: { $eq: await detectarSubtema(query, topic_selected) } }
      : { tema: { $eq: topic_selected } }; 
  
  //const filter = hasSubtopic
  //  ? { filename : { $eq:await detectarSubtema(query, topic_selected) } }
  //  : { tema: { $eq: topic_selected } };

  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
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
  //generar url usando los metadatos de los chunks y que comienze por https://ull-pl.vercel.app/topics/ y que le siga el tema y luego el filename sin .md o .mdx
  const baseUrl = "https://ull-pl.vercel.app/topics/";
  const topic = matches[0]?.metadata?.tema || "general";
  const filename = matches[0]?.metadata?.filename || "general";
  const url = `${baseUrl}${topic}/${filename.replace(/\.mdx?$/, "")}`;

  const context = matches.map((m: any) => m.metadata?.text || "").join("\n\n");
  console.log(`Contexto encontrado: ${context.slice(0, 200)}...`);  
  if (!context) {
        return "No tengo suficiente información para responder a tu pregunta.";
    }

  const prompt = ANSWER_TEMPLATE.replace("{context}", context).replace("{query}", query).replace("{url}", url);

  const response = await generateChatCompletion([
    { role: "user", content: prompt }
  ], "gpt-3.5-turbo", 0.3);

  return response.trim();
}





// Ejecutar búsqueda completa
export async function handleQuery(query: string, topic: string): Promise<string> {
  console.log(`Procesando consulta: ${query}`);
  const matches = await search(query, topic);
  const answer = await generateAnswer(query, matches);
  return answer;
}

