import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: prompt,
          negative_prompt: "low quality, blurry, bad anatomy",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      }
    ) as string[];

    return NextResponse.json({ imageUrl: output[0] });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
} 