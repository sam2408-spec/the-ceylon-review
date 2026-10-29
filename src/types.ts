export type Category = 'Politics' | 'Tech' | 'Science' | 'Opinion' | 'Culture' | 'Business';

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string[]; // split into paragraphs
  authorId: string;
  publishedAt: string; // e.g., "2026-06-20" or custom format
  category: Category;
  imageUrl: string;
  readTime: string;
  isCurrent: boolean; // True for current news, False for past news
  isFeatured?: boolean; // To highlight major news
  likes: number;
  comments: Comment[];
  views: number;
}

export interface Writer {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  email: string;
  twitter: string;
  location: string;
  joinedDate: string;
}
