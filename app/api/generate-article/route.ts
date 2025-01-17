import { NextResponse } from "next/server";
import Replicate from "replicate";
import { headers } from 'next/headers';

async function waitForPrediction(replicate: Replicate, prediction: any) {
  let result = await replicate.predictions.get(prediction.id);
  
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    result = await replicate.predictions.get(prediction.id);
    console.log('Prediction status:', result.status);
  }

  if (result.status === 'failed') {
    throw new Error(`Prediction failed: ${result.error}`);
  }

  return result;
}

export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    
    // Clean up the title - remove any markdown or extra formatting
    const cleanTitle = title.replace(/\*\*/g, '').split('!')[0].trim();
    
    // Extract number and clean title separately
    let numberOfPoints = 5; // default value
    let displayTitle = cleanTitle;
    
    // Check for numeric numbers (e.g., "5 Best...")
    const numberMatch = cleanTitle.match(/(\d+)\s+/);
    if (numberMatch) {
        numberOfPoints = parseInt(numberMatch[1]);
        displayTitle = cleanTitle.replace(/^\d+\s+/, '');
    } else {
        // Check for written numbers
        const writtenNumbers = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        };
        for (const [word, num] of Object.entries(writtenNumbers)) {
            const regex = new RegExp(`^(?:the\\s+)?${word}\\s+`, 'i');
            if (cleanTitle.toLowerCase().match(regex)) {
                numberOfPoints = num;
                displayTitle = cleanTitle.replace(regex, '');
                break;
            }
        }
    }
    
    // Remove "Top" if it exists at the start
    displayTitle = displayTitle.replace(/^(?:the\s+)?top\s+/i, '');
    
    // Ensure minimum of 3 points
    numberOfPoints = Math.max(numberOfPoints, 3);

    const replicateLLM = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const input = {
      top_p: 0.9,
      prompt: `Create a Pinterest article about: "${displayTitle}"

Generate EXACTLY ${numberOfPoints} tips/points (no more, no less) in this HTML format:

<article>
  <h1>${displayTitle}</h1>
  
  <div class="content">
    <!-- Generate exactly ${numberOfPoints} sections, numbered 1 through ${numberOfPoints} -->
    <section class="point">
      <h2>1. First Point</h2>
      <p>Detailed explanation in 2-3 engaging sentences. Make it specific and actionable.</p>
    </section>
    <!-- Continue until you have exactly ${numberOfPoints} points -->
  </div>

  <div class="hashtags">
    <span>#Inspiration</span> <span>#SelfDevelopment</span> <span>#PersonalGrowth</span>
  </div>
</article>

Critical Requirements:
1. You MUST generate exactly ${numberOfPoints} points - no more, no less
2. Number each point sequentially from 1 to ${numberOfPoints}
3. Each point must have a clear title starting with its number
4. Each point must have 2-3 detailed, actionable sentences
5. Use proper HTML tags as shown above
6. Include relevant hashtags at the end`,
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 1.15
    };

    let fullResponse = '';
    try {
      for await (const event of replicateLLM.stream("meta/meta-llama-3-70b-instruct", { input })) {
        fullResponse += event;
      }
    } catch (error) {
      console.error('Error in LLM generation:', error);
      throw new Error('Failed to generate article content');
    }

    // Extract the article HTML and ensure it's not empty
    const articleMatch = fullResponse.match(/<article>([\s\S]*?)<\/article>/);
    if (!articleMatch) {
      console.error('No article HTML found in response:', fullResponse);
      throw new Error('Invalid article format received');
    }
    
    const articleHtml = articleMatch[1].trim();

    // Generate cover image
    let coverImage = '';
    try {
      if (!process.env.REPLICATE_API_TOKEN) {
        throw new Error('REPLICATE_API_TOKEN is not configured');
      }

      const replicateImg = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      console.log('Generating cover image for:', displayTitle);

      const prediction = await replicateImg.predictions.create({
        version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: `Create a stunning Pinterest cover image for: "${displayTitle}". Make it eye-catching and professional.`,
          negative_prompt: "low quality, blurry, bad anatomy, text, watermark",
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "K_EULER",
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      });

      // Wait for the prediction to complete
      const result = await waitForPrediction(replicateImg, prediction);
      console.log('Cover image generation completed:', result);

      if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
        throw new Error('No image URL in output');
      }

      coverImage = result.output[0];
      console.log('Successfully generated cover image:', coverImage);

    } catch (error) {
      console.error('Detailed error generating cover image:', error);
      throw new Error(`Failed to generate cover image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate images for each point
    const pointMatches = articleHtml.match(/<section class="point">([\s\S]*?)<\/section>/g) || [];
    const images: string[] = [];

    for (const pointHtml of pointMatches) {
      try {
        const textContent = pointHtml.replace(/<[^>]+>/g, ' ').trim();
        console.log('Generating image for point:', textContent.substring(0, 100) + '...');

        const prediction = await replicateImg.predictions.create({
          version: "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
          input: {
            prompt: `Create a Pinterest-style image for this tip: "${textContent.substring(0, 200)}". Make it visually appealing and professional.`,
            negative_prompt: "low quality, blurry, bad anatomy, text, watermark",
            width: 1024,
            height: 1024,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 50,
            guidance_scale: 7.5,
          }
        });

        // Wait for the prediction to complete
        const result = await waitForPrediction(replicateImg, prediction);
        console.log('Point image generation completed:', result);

        if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
          throw new Error('No image URL in output');
        }

        const imageUrl = result.output[0];
        images.push(imageUrl);
        console.log('Successfully generated point image:', imageUrl);

      } catch (error) {
        console.error('Error generating point image:', error);
        images.push(''); // Use empty string for failed images
      }
    }

    if (!coverImage) {
      throw new Error('Failed to generate cover image');
    }

    if (images.length === 0) {
      throw new Error('Failed to generate any point images');
    }

    return NextResponse.json({
      article: {
        title: displayTitle,
        html: articleHtml,
        coverImage,
        images,
      },
    });

  } catch (error) {
    console.error('Error in article generation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate article" },
      { status: 500 }
    );
  }
}

