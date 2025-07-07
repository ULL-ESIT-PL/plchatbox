"use client";

import { createContext, useContext, useState } from "react";

type TopicContextType = {
  topic: string;
  setTopic: (value: string) => void;
};

const TopicContext = createContext<TopicContextType>({
  topic: "",
  setTopic: () => {},
});

export function TopicProvider({ children }: { children: React.ReactNode }) {
  const [topic, setTopic] = useState("");

  return (
    <TopicContext.Provider value={{ topic, setTopic }}>
      {children}
    </TopicContext.Provider>
  );
}

export const useTopic = () => useContext(TopicContext);