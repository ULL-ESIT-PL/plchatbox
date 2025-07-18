import { NextRequest, NextResponse } from "next/server";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { handleQuery } from "@/lib/handle-query";

const formatMessage = (message: Message) => {
    return `${message.role === "user" ? "Human" : "Assistant"}: ${
        message.content
        }`;
};

export async function POST(req: NextRequest) {
    const body = await req.json();
    const messages: Message[] = body.messages ?? [];
    const topic = body.topic ?? "general";
    //console.log("Messages ", messages);
    console.log("topic", topic);
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const question = messages[messages.length - 1].content;
  
    //console.log("Chat history ", formattedPreviousMessages.join("\n"));
  
    if (!question) {
      return NextResponse.json("Error: No question in the request", {
        status: 400,
      });
    }
  
    try {
      const answer = await handleQuery(question, topic);
      return new Response(answer);


    } catch (error) {
      console.error("Internal server error ", error);
      return NextResponse.json("Error: Something went wrong. Try again!", {
        status: 500,
      });
    }
  }