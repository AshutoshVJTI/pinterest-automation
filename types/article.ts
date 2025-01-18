export interface Article {
  _id?: string;
  userId: string;
  title: string;
  keyword: string;
  html: string;
  coverImage: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
} 