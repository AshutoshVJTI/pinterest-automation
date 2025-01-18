import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';

// Get all articles for the current user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Connect to MongoDB
    await connectDB();

    // Fetch articles for the user
    const articles = await Article.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// Save a new article
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { title, html, coverImage, images } = await request.json();

    if (!title || !html) {
      return NextResponse.json(
        { error: 'Title and HTML content are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create new article
    const article = await Article.create({
      userId,
      title,
      html,
      coverImage,
      images,
      createdAt: new Date()
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json(
      { error: 'Failed to save article' },
      { status: 500 }
    );
  }
} 