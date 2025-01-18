export interface Article {
  _id?: string;
  userId: string;
  title: string;
  keyword: string;
  content: string;
  coverImage: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
} 