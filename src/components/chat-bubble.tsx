import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Message } from "ai/react";
import ReactMarkdown from "react-markdown";


export function ChatLine({ role = "assistant", content = "" }) {
  if (!content) return null;

  const isUser = role !== "assistant";

  return (
    <div className={`mb-2 flex ${isUser ? "justify-end" : "justify-start"}`}>
    <Card className={`inline-block ${isUser ? "bg-blue-100 dark:bg-blue-600" : "bg-amber-100 dark:bg-amber-600"}`}>
      <CardHeader className={`${isUser ? "items-end text-right" : "items-start text-left"}`}>
        <CardTitle
          className={
            role !== "assistant"
              ? "text-amber-500 dark:text-amber-200"
              : "text-blue-500 dark:text-blue-200"
          }
        >
          {role === "assistant" ? "PL Chatbot" : "Usuario"}
        </CardTitle>
      </CardHeader>
        <CardContent className={`text-sm ${isUser ? "text-right" : "text-left"}`}>
          <p
            className={`font-semibold mb-1 ${
              isUser
                ? "text-amber-500 dark:text-amber-200"
                : "text-blue-500 dark:text-blue-200"
            }`}
          >
          </p>
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    </div>
  );
}
