export const CATEGORIES = [
  'Human Rights',
  'International Law',
  'Humanitarian',
  'Community',
  'Politics',
  'Opinion',
  'Culture',
  'Business',
  'Science',
  'Tech',
] as const;
export type Category = (typeof CATEGORIES)[number];

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
  regions?: string[]; // e.g. ['palestine', 'sri-lanka']; see src/data/regions.ts
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
