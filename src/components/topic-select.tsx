"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTopic } from "./topic-context";

const topics = [
  { value: "type-checking", label: "Type checking" },
  { value: "code-generation", label: "Code generation" },
  { value: "translation", label: "Translation" },
  { value: "expresiones-regulares-y-analisis-lexico", label: "Expresiones regulares y análisis léxico" },
  { value: "introduction-to-javascript", label: "Introduction to JavaScript" },
  { value: "syntax-analysis", label: "Syntax analysis" },
  { value: "language-design", label: "Language design" },
  { value: "tree-transformations", label: "Tree transformations" },
  { value: "scope-analysis", label: "Scope analysis" },
  { value: "interpretation", label: "Interpretation" },
  { value: "introduction-to-pl", label: "Introduction to PL" }
]; 

export function TopicSelect() {
  const { topic, setTopic} = useTopic();
  return (
    <Select value={topic} onValueChange={setTopic}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecciona un tema" />
      </SelectTrigger>
      <SelectContent>
        {topics.map((topic) => (
          <SelectItem key={topic.value} value={topic.value}>
            {topic.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}