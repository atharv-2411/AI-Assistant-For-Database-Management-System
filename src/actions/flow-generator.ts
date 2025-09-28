"use server";

import { Groq } from "groq-sdk";

import engineeredPrompt from "@/prompts/prompt-flow-generator";

export async function generateFlowDataFromSchema(schema: string) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
  });

  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      ...engineeredPrompt,
      {
        role: "user",
        content: [
          { type: "text", text: `Generate Nodes and Edges based on this SQL schema: ${schema}` }
        ],
      },
    ],
    temperature: 1,
    max_tokens: 4096,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    response_format: { type: "json_object" }, // ✅ Correct type
  });

  return response;
}
