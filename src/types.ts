export interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
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

enum PrivaciyStatus {
  Private = 'private',
  Friends = 'friends',
  Public = 'public',
}

export interface Step {
  id: string;
  text: string;
  isCompleted?: boolean;
}

export interface Goal {
  _id: string;
  goalName: string;
  category: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  noDeadline?: boolean;
  image?: string;
  steps: Step[];
  reward?: string;
  consequence?: string;
  privacy: PrivaciyStatus;
  isCompleted: boolean;
  value: number;
  userId: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReadCategory {
  READING = 'reading',
  FINISHED = 'finished',
  WANTS_READ = 'wantsToRead',
  DELETE = 'delete',
}

export interface ProgressEntry {
  _id: string;
  goalId: string;
  userId: string;
  content: string;
  day: number;
  likes: { _id: string }[];
  comments: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
}

export interface CreateProgressEntryDto {
  goalId: string;
  content: string;
}

export interface Comment {
  _id: string;
  progressEntryId: string;
  userId: string;
  content: string;
  likes: { _id: string }[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateCommentDto {
  content: string;
}
