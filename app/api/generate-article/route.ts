import { NextResponse } from 'next/server';
import Replicate from 'replicate';
import { auth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';

// Helper function to wait for prediction
async function waitForPrediction(replicate: Replicate, prediction: any) {
  let result = await replicate.predictions.get(prediction.id);

  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    result = await replicate.predictions.get(prediction.id);
  }

  if (result.status === 'failed') {
    throw new Error(`Prediction failed: ${result.error}`);
  }

  return result;
}

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const DEBUG = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    // Add authentication check
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.substring('Bearer '.length);
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { keyword, title } = await request.json();

    if (!keyword || !title) {
      return NextResponse.json(
        { error: 'Keyword and title are required' },
        { status: 400 }
      );
    }

    const articlePrompt = `You are a professional Pinterest article writer. Write an article about "${title}" related to "${keyword}".

Your response must be a properly formatted HTML article with exactly 5 sections. Follow this exact format and structure:

<article>
  <h1>${title}</h1>
  <div class="content">
    <section class="point">
      <h2>1. First Key Point</h2>
      <p>Write 2-3 engaging sentences explaining this point. Include specific details and actionable advice. Make it practical and easy to understand.</p>
    </section>
    <section class="point">
      <h2>2. Second Key Point</h2>
      <p>Write 2-3 engaging sentences explaining this point. Include specific details and actionable advice. Make it practical and easy to understand.</p>
    </section>
    <section class="point">
      <h2>3. Third Key Point</h2>
      <p>Write 2-3 engaging sentences explaining this point. Include specific details and actionable advice. Make it practical and easy to understand.</p>
    </section>
    <section class="point">
      <h2>4. Fourth Key Point</h2>
      <p>Write 2-3 engaging sentences explaining this point. Include specific details and actionable advice. Make it practical and easy to understand.</p>
    </section>
    <section class="point">
      <h2>5. Fifth Key Point</h2>
      <p>Write 2-3 engaging sentences explaining this point. Include specific details and actionable advice. Make it practical and easy to understand.</p>
    </section>
  </div>
</article>

Guidelines:
1. Each section must be properly wrapped in HTML tags
2. Each point should be a complete, actionable tip
3. Use clear, engaging language
4. Include specific examples and practical advice
5. Maintain proper HTML structure throughout
6. Do not include any markdown or other formatting
7. Do not include numbering in the actual content
8. Keep the HTML structure exactly as shown

Remember: Only output the HTML structure with your content. No additional text or explanations.`;

    let articleHtml = '';
    try {
      for await (const event of replicate.stream(
        "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3",
        {
          input: {
            prompt: articlePrompt,
            temperature: 0.7,
            max_tokens: 2000,
            top_p: 0.9,
            system_prompt: "You are a professional content writer who always responds with clean, properly formatted HTML only."
          }
        }
      )) {
        articleHtml += event;
      }

      // Clean up the response
      articleHtml = articleHtml.trim();
      articleHtml = articleHtml.replace(/```html/g, '').replace(/```/g, '');
      
      // Extract article content
      const articleMatch = articleHtml.match(/<article>[\s\S]*?<\/article>/);
      if (!articleMatch) {
        console.error('Raw response:', articleHtml);
        throw new Error('Invalid article format received');
      }
      
      articleHtml = articleMatch[0];

      // Validate the structure
      const sections = articleHtml.match(/<section class="point">/g) || [];
      if (
        !articleHtml.includes('<h1>') ||
        !articleHtml.includes('<div class="content">') ||
        sections.length !== 5
      ) {
        throw new Error('Article structure is incomplete');
      }

      // Clean up any potential formatting issues
      articleHtml = articleHtml
        .replace(/\n\s*/g, '\n')  // Normalize whitespace
        .replace(/>\s+</g, '>\n<')  // Add proper line breaks
        .replace(/\s+/g, ' ')  // Remove extra spaces
        .trim();

    } catch (error) {
      console.error('Error in text generation:', error);
      throw new Error('Failed to generate article content');
    }

    // Generate cover image using a more reliable configuration
    let coverImage = '';
    try {
      const coverImagePrediction = await replicate.predictions.create({
        version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
        input: {
          prompt: `High quality Pinterest style image about ${title}, modern minimal design, clean composition, professional photography style`,
          negative_prompt: "text, watermark, logo, ugly, deformed, noisy, blurry, low contrast, oversaturated",
          width: 768,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: "K_EULER",
        }
      });

      const result = await waitForPrediction(replicate, coverImagePrediction);
      if (!result.output || !result.output[0]) {
        throw new Error('No image generated');
      }
      coverImage = result.output[0];
    } catch (error) {
      if (DEBUG) {
        console.error('Full error details:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
      // Return a default/placeholder image URL instead of throwing an error
      coverImage = 'https://via.placeholder.com/768x1024?text=Article+Cover';
    }

    // Generate section images with similar reliable configuration
    const sectionMatches = articleHtml.match(/<section class="point">[\s\S]*?<\/section>/g) || [];
    const sectionImages = [];

    for (const section of sectionMatches) {
      try {
        const headingMatch = section.match(/<h2>(.*?)<\/h2>/);
        const heading = headingMatch ? headingMatch[1] : '';

        const prediction = await replicate.predictions.create({
          version: "db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
          input: {
            prompt: `High quality Pinterest style image about ${heading}, modern minimal design, clean composition, professional photography style`,
            negative_prompt: "text, watermark, logo, ugly, deformed, noisy, blurry, low contrast, oversaturated",
            width: 768,
            height: 768,
            num_outputs: 1,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            scheduler: "K_EULER",
          }
        });

        const result = await waitForPrediction(replicate, prediction);
        if (!result.output || !result.output[0]) {
          throw new Error('No image generated');
        }
        sectionImages.push(result.output[0]);
      } catch (error) {
        console.error('Error generating section image:', error);
        // Use a placeholder image for failed section image generation
        sectionImages.push('https://via.placeholder.com/768x768?text=Section+Image');
      }
    }

    // Clean up the title before saving
    const cleanTitle = title
      .replace(/\*\*/g, '')
      .replace(/\[|\]/g, '')
      .replace(/^\d+\.\s*/, '');

    if (!articleHtml) {
      return NextResponse.json(
        { error: 'Failed to generate article content' },
        { status: 500 }
      );
    }

    // Save article directly to MongoDB
    try {
      await connectDB();

      const article = await Article.create({
        userId,
        title: cleanTitle,
        html: articleHtml, // Use the generated HTML content
        coverImage,
        images: sectionImages,
        createdAt: new Date()
      });

      if (!article) {
        throw new Error('Failed to save article');
      }

      return NextResponse.json({ article });
    } catch (error) {
      console.log('Error saving article:', error);
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate article' },
      { status: 500 }
    );
  }
}
  