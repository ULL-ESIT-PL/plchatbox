import Image from "next/image";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { Chat } from "@/components/chat";
import { TopicSelect } from "@/components/topic-select";
import { TopicProvider } from "@/components/topic-context";
import { useState } from "react";

export default function Home() {
  return (
    <TopicProvider>
      <main className="relative container flex min-h-screen flex-col">
        <div className=" p-4 flex h-14 items-center justify-between supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <span className="font-bold">PL Chatbot</span>
          <DarkModeToggle />
        </div>

        <div className="flex flexrow items-center gap-4 p-4">
          <TopicSelect />
        </div>

        <div className="flex flex-1 py4">
          <div className="w-full">
            <Chat />
        </div>

        </div>
      </main>
    </TopicProvider>
  );
}
