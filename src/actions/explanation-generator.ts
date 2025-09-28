"use server";

import engineeredPrompt from "@/prompts/prompt-explanation-generator";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export async function generateExplanationFromSchema(schema: string, explanationPart: string) {
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
  });

  const stream = await openai.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      ...engineeredPrompt as ChatCompletionMessageParam[],
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Overall SQL \n \`\`\`sql${schema}\`\`\` \n\n\n Section I want to know about:\n \`\`\`${explanationPart}\`\`\``,
          }
        ]
      }
    ],
    temperature: 1,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 1.5,
    response_format: {
      "type": "text"
    },
    stream: true,
  });

  return stream;
}