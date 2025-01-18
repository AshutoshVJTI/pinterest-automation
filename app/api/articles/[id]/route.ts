import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Fetch the specific article
    const article = await Article.findOne({
      _id: params.id,
      userId
    }).lean();

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
} 