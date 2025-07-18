"use client";

import { ChatLine } from "./chat-bubble";
import { useChat, Message } from "ai-stream-experimental/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { scrollToBottom, initialMessages } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { use, useEffect, useRef, useState } from "react";
import { useTopic } from "./topic-context";

//import { Select } from "@radix-ui/react-select";
const STORAGE_KEY = "chatMessages";

export function Chat() {
  const { topic } = useTopic();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: Message[] = JSON.parse(saved);
        setStoredMessages(parsed);
      } catch (err) {
        console.error("Error al leer mensajes del localStorage:", err);
      }
    } else {
      setStoredMessages(initialMessages);
    }
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      initialMessages: storedMessages,
      body: {
        topic,
      }
    });

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => scrollToBottom(containerRef), 100);
  }, [messages]);

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto" ref={containerRef}>
        {messages.map(({ id, role, content }: Message, index) => (
          <ChatLine
            key={id}
            role={role}
            content={content}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          placeholder={"Type to chat with AI..."}
          onChange={handleInputChange}
          className="mr-2"
        />

        <Button type="submit" className="w-24">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}