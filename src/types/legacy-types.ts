export interface Product {
  id: string;
  title: string;
  description: string;
  author: string;
  authorHandle: string;
  price: number;
  tags: string[];
  imageUrl: string;
  category: string;
  createdAt: string;
  isOriginal: boolean;
  promptSnippet?: string;
}

export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  PRICE_HIGH = 'PRICE_HIGH',
  PRICE_LOW = 'PRICE_LOW'
}