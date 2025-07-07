import { PanelTopIcon } from 'lucide-react';
import z from 'zod';
import { SUBTOPIC_TEMPLATE_EXPRESIONES_REGULARES } from './prompt-templates';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().trim().min(1),
  PINECONE_API_KEY: z.string().trim().min(1),
  PINECONE_INDEX_NAME: z.string().trim().min(1),
  PDF_PATH: z.string().trim().min(1),
  MARKDOWN_PATH: z.string().trim().min(1),
  FILES_PATH: z.string().trim().min(1),
  INDEX_INIT_TIMEOUT: z.coerce.number().min(1),
  TOPICS_PATH: z.string().trim().min(1),
  DOCUMENT_INDEX_PATH: z.string().trim().min(1),
});

export const env = envSchema.parse(process.env);

export const DEFAULT_TOPIC = "general";

export const topicWithSubtopics = [
  "expresiones-regulares-y-analisis-lexico",
];

export const subtopicPrompts: Record<string, string> = {
  "expresiones-regulares-y-analisis-lexico": SUBTOPIC_TEMPLATE_EXPRESIONES_REGULARES,
};
