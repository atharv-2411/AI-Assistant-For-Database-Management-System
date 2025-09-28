"use server";

import { Groq } from "groq-sdk";

export async function generateMockDataFromSchema(
  schema: string,
  numOfRows: number | undefined = 10
) {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
  });

  const engineeredPrompt = [
    {
      role: "system" as const,
      content: `You are a data generation specialist. Your task is to generate realistic mock data based on a provided SQL schema.

Instructions:

- Input: You will receive a PostgreSQL CREATE TABLE SQL statement.

- Task: Generate ${numOfRows} rows of mock data based on the schema.

- Requirements:

- Ensure that generated data matches the data types of each column.

- Use realistic values (e.g., names for VARCHAR, valid timestamps for TIMESTAMP columns).

- Foreign key relationships should be maintained.

- Output the data in a structured SQL INSERT format.

Example Output:

\`\`\`sql
INSERT INTO users (id, name, email, created_at) VALUES
(1, 'John Doe', 'johndoe@example.com', '2024-01-01 12:00:00'),
(2, 'Jane Smith', 'janesmith@example.com', '2024-01-02 15:30:00');
\`\`\`

Now, generate ${numOfRows} rows of mock data for the following SQL schema.`,
    },
  ];

  const MAX_TOKENS = 8192;
  const maxTokens =
    typeof numOfRows === "number"
      ? Math.min(2000 * numOfRows, MAX_TOKENS)
      : 2000 * 10;

  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        ...engineeredPrompt,
        {
          role: "user" as const,
          content: `Generate ${numOfRows} rows of mock data for this SQL schema: \n\n\`\`\`sql\n${schema}\n\`\`\``,
        },
      ],
      temperature: 1,
      max_tokens: maxTokens,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      response_format: { type: "text" },
    });

    return response.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error("Error generating mock data:", error);
    throw error;
  }
}
