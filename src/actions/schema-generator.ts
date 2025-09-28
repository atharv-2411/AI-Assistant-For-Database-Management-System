"use server";

import { Groq } from "groq-sdk";

import engineeredPrompt from "@/prompts/prompt-schema-generator";

export async function generateSchemaFromPrompt(prompt: string, previousPrompt?: string) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
  });

  const stream = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      ...engineeredPrompt, // Ensure this is an array of messages
      {
        role: "user",
        content: `Generate a SQL code based on this prompt ${previousPrompt ? `and on the previous model ${previousPrompt}` : ""} : ${prompt}`
      }
    ],
    temperature: 1,
    max_tokens: 4096, // Reduce if needed (5000 might be too high)
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: previousPrompt === undefined, // Don't stream on diff mode
  });

  return stream;
}
