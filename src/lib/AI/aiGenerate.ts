import { OpenAI } from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }); // TODO: change

/**
 * Calls OpenAI's GPT-4o/gpt-4o-mini with a prompt.
 * If responseSchema is provided, it is stringified and appended to the prompt for guidance only.
 * The model is instructed to return ONLY a valid JSON array/object matching the description/schema.
 * @param prompt - The prompt to send to the model.
 * @param model - The model to use (defaults to "gpt-4o").
 * @param responseSchema - (Optional) An example JSON schema (object) to append to the prompt.
 * @returns The generated JSON-parsed object from the model.
 */
export async function openaiGenerate(
  prompt: string,
  model: string = "gpt-4.1-mini-2025-04-14",
  responseSchema?: object
): Promise<any> {
  // If schema is provided, append as instructions to the prompt.
  let fullPrompt = prompt.trim();
  if (responseSchema) {
    fullPrompt += `\n\nThe output MUST be a valid JSON schema:\n${JSON.stringify(responseSchema, null, 2)}\nRespond ONLY with valid JSON. Do not include markdown or explanations.`;
  } else {
    fullPrompt += `\n\nRespond ONLY with valid JSON. Do not include markdown or explanations.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.2,
    });
    const text = response.choices[0]?.message?.content ?? "";
    if (!text) throw new Error("No response from OpenAI.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
}