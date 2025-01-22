import { NextResponse } from "next/server";
import Replicate from "replicate";

async function streamToBase64(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const blob = new Blob(chunks);
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/png;base64,${base64}`;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const streams = await replicate.run(
      "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
      {
        input: {
          prompt: `Create a Pinterest-style image for: ${prompt}. Professional, modern, minimalist design, high quality, perfect for social media`,
          negative_prompt: "low quality, blurry, bad anatomy, text, watermark, ugly, deformed",
          width: 640,
          height: 1024,
          num_outputs: 3,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        }
      }
    ) as ReadableStream[];

    if (!streams || streams.length === 0) {
      throw new Error("No images generated");
    }

    // Convert all streams to base64 URLs
    const imageUrls = await Promise.all(
      streams.map(stream => streamToBase64(stream))
    );

    console.log("Generated image URLs count:", imageUrls.length);

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error('Error details:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate image",
      details: error
    }, { status: 500 });
  }
} 