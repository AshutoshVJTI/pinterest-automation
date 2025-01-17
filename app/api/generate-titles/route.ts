import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const input = {
      top_p: 0.9,
      prompt: `Generate 5 engaging, attention-grabbing, and SEO-friendly Pinterest pin titles for the topic: ${prompt}.
Use numbers where appropriate and aim for catchy, click-worthy phrasing.
Include playful or surprising elements to entice readers (e.g., "You Won’t Believe #3!" or "Even Beginners Can Nail #7!").
Keep the titles concise and highlight benefits or emotions where possible.
Format the output as a numbered list.
This version maintains the focus on SEO-friendly, catchy titles while guiding the user to include engaging and playful elements for maximum appeal.`,
      min_tokens: 0,
      temperature: 0.6,
      prompt_template: "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
      presence_penalty: 1.15
    };

    let fullResponse = '';
    for await (const event of replicate.stream("meta/meta-llama-3-70b-instruct", { input })) {
      fullResponse += event;
    }

    // Process the response to extract only the titles
    const cleanResponse = fullResponse
      .split("\n") // Split response into lines
      .filter(line => /^\d+\./.test(line)) // Keep only lines starting with a number (e.g., "1.", "2.")
      .map(line => line.trim()) // Remove any extra whitespace
      .join("\n"); // Join the clean lines back into a string

    return NextResponse.json({ titles: cleanResponse });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: "Failed to generate titles" }, { status: 500 });
  }
}
