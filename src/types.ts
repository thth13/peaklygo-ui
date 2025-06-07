export interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export interface Book {
  _id: string;
  googleId: string;
  title: string;
  description: string;
  authors: string[];
  imageLinks: ImageLinks;
  categories: string[];
  publisher: string;
  publishedDate: Date;
  pageCount: number;
  language: string;
}

export interface BookNotes {
  _id: string;
  content: string;
  createdAt: Date;
}

export interface UserProfile {
  _id: string;
  name: string;
  avatar: string;
  description: string;
  views: number;
  following: string[];
  followers: string[];
  reading: string[];
  finished: string[];
  wantsToRead: string[];
  user: string;
}

export enum ReadCategory {
  READING = 'reading',
  FINISHED = 'finished',
  WANTS_READ = 'wantsToRead',
  DELETE = 'delete',
}
