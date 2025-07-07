import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "../lib/config";
import { generateEmbedding } from "@/lib/openai";

//dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/*
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME!;
*/

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const PINECONE_INDEX_NAME = env.PINECONE_INDEX_NAME || "default-index";

const documentIndex: any[] = [];

// Text splitter básico
function splitText(text: string, chunkSize = 500, overlap = 50): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

// Embedding directo con OpenAI
async function embedTexts(texts: string[]): Promise<number[][]> {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: texts,
      model: "text-embedding-ada-002",
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data.map((obj: any) => obj.embedding);
}

async function processFile(filePath: string, tema: string, index: any) {
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath);
  const chunks = splitText(content);

  const embeddings = await embedTexts(chunks);

  const vectors = embeddings.map((embedding, i) => ({
    id: uuidv4(),
    values: embedding,
    metadata: {
      text: chunks[i],
      filename: fileName,
      tema: tema,
      chunk_index: i,
    },
  }));

  await index.upsert(vectors);
  console.log(` Subido: ${fileName} en tema "${tema}" (${chunks.length} chunks)`);

  documentIndex.push({
    filename: fileName,
    tema,
    path: filePath,
    chunks: chunks.length,
  });
}

async function processAll(index: any) {
  const temas = fs.readdirSync(env.TOPICS_PATH).filter(dir =>
    fs.statSync(path.join(env.TOPICS_PATH, dir)).isDirectory()
  );

  console.log(`Temas encontrados: ${temas.length}`);
  // mostrar los temas
  console.log("Temas:", temas.join(", "));

  for (const tema of temas) {
    const dirPath = path.join(env.TOPICS_PATH, tema);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".mdx") || f.endsWith(".md"));
    console.log(`Procesando tema: ${tema} con ${files.length} archivos`);
    if (files.length === 0) {
      console.log(`No hay archivos .mdx en el tema "${tema}"`);
      continue;
    }
    // Mostrar los archivos encontrados
    console.log(`Archivos en "${tema}":`, files.join(", "));

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      console.log(`Procesando archivo: ${fullPath} en tema "${tema}"`);
      await processFile(fullPath, tema, index);
    }
  }

  fs.writeFileSync(
    env.DOCUMENT_INDEX_PATH,
    JSON.stringify(documentIndex, null, 2)
  );

  console.log("Todo cargado y documentIndex.json guardado.");
}

// Punto de entrada principal
async function main() {
  const pinecone = new Pinecone(
    {
      apiKey: process.env.PINECONE_API_KEY!
    }
  );
  const index = await pinecone.Index(PINECONE_INDEX_NAME);
  await processAll(index);
}

main().catch(console.error);
