import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { env } from "../lib/config";

const IDEX_PATH = env.DOCUMENT_INDEX_PATH;
const TOPICS_WITH_SUBTOPICS_INDEX_PATH = env.TOPICS_WITH_SUBTOPICS_INDEX_PATH;

type IndexEntry = {
  filename: string;
  tema: string;
  path: string;
  chunks: number;
};

const indexData: IndexEntry[] = JSON.parse(
  readFileSync(IDEX_PATH, "utf-8")
);

const topicsWithSubtopicsIndex: Record<string, number> = {};

//contar los subtemas por tema
indexData.forEach((entry) => {
  const tema = entry.tema;
  if (topicsWithSubtopicsIndex[tema]) {
    topicsWithSubtopicsIndex[tema] += 1;
  } else {
    topicsWithSubtopicsIndex[tema] = 1;
  }
});


const topics = Object.keys(topicsWithSubtopicsIndex).map((tema) => ({
  value: tema,
  label: tema.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()),
}));

const topicsWithSubtopics = Object.entries(topicsWithSubtopicsIndex)
  .filter(([_, count]) => count > 1)
  .map(([tema]) => tema);

const indexContent = `export const topicWithSubtopics = ${JSON.stringify(topicsWithSubtopics, null, 2)};\n\n` +
  `export const topics = ${JSON.stringify(topics, null, 2)};\n\n`;

writeFileSync(TOPICS_WITH_SUBTOPICS_INDEX_PATH, indexContent, "utf-8");

console.log("Índice de temas con subtemas guardado en:", TOPICS_WITH_SUBTOPICS_INDEX_PATH);