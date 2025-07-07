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


dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,});


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

  const filter = hasSubtopic
    ? { filename : { $eq:await detectarSubtema(query, topic_selected) } }
    : { tema: { $eq: topic_selected } };

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




async function generateAnswerWithOpenAI(query: string, matches: any[]) {
  const context = matches.map((m: any) => m.metadata?.text || "").join("\n\n");
  console.log(`Contexto encontrado: ${context.slice(0, 200)}...`);  
  
  const prompt = ANSWER_TEMPLATE.replace("{context}", context).replace("{query}", query);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return response;
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    throw new Error("No se pudo generar una respuesta. Inténtalo de nuevo.");
  }
}

export async function handleQueryWithOpenAI(query: string, topic: string) {
  console.log(`Procesando consulta con OpenAI: ${query}`);
  const matches = await search(query, topic);
  const context = matches.map((m: any) => m.metadata?.text || "").join("\n\n");
  const prompt = ANSWER_TEMPLATE.replace("{context}", context).replace("{query}", query);
  
  const { stream, handlers } = LangChainStream({
    experimental_streamData: true,});
  
  const data = new experimental_StreamData();
  const runId = crypto.randomUUID(); // Generar runId manual
  
  openai.chat.completions
    .create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        { role: "system", content: "Eres un asistente útil." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    })
    .then(async (res: AsyncIterable<ChatCompletionChunk>) => {
      for await (const chunk of res) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) handlers.handleLLMNewToken(delta);
      }
      handlers.handleLLMEnd("",runId);
    })
    .catch(err => {
      handlers.handleLLMError(err, runId);
    });

  // Extraer las fuentes del match (ejemplo: metadatos)
  const sources = matches.slice(0, 2).map((m: any) => m.metadata?.source || m.metadata?.text || "Fuente no disponible");

  // Agregamos las fuentes al streamData
  data.append({ sources });
  data.close();

  // Devolvemos la respuesta como en `callChain`
  return new StreamingTextResponse(stream, {}, data);
}

