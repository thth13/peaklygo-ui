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
  user: { username: string; _id: string };
  following: string[];
  followers: string[];
  rating: number;
}

export enum PrivacyStatus {
  Private = 'private',
  Friends = 'friends',
  Public = 'public',
}

export interface Step {
  id: string;
  text: string;
  isCompleted?: boolean;
}

export enum ActivityType {
  ProgressEntry = 'progressEntry',
  MarkStep = 'markStep',
  UnmarkStep = 'unmarkStep',
  UpdatedDeadline = 'updatedDeadline',
  EditedGoal = 'editedGoal',
  CompletedGoal = 'completedGoal',
}

export const getActivityTypeLabel = (activityType: ActivityType, t: (key: string) => string): string => {
  const labelKeys: Record<ActivityType, string> = {
    [ActivityType.ProgressEntry]: 'activities.progressEntry',
    [ActivityType.MarkStep]: 'activities.markStep',
    [ActivityType.UnmarkStep]: 'activities.unmarkStep',
    [ActivityType.UpdatedDeadline]: 'activities.updatedDeadline',
    [ActivityType.EditedGoal]: 'activities.editedGoal',
    [ActivityType.CompletedGoal]: 'activities.completedGoal',
  };

  return t(labelKeys[activityType]);
};

export const ActivityTypeColors: Record<ActivityType, { light: string; dark: string }> = {
  [ActivityType.ProgressEntry]: { light: 'bg-blue-500', dark: 'dark:bg-blue-400' },
  [ActivityType.MarkStep]: { light: 'bg-green-500', dark: 'dark:bg-green-400' },
  [ActivityType.UnmarkStep]: { light: 'bg-orange-500', dark: 'dark:bg-orange-400' },
  [ActivityType.UpdatedDeadline]: { light: 'bg-purple-500', dark: 'dark:bg-purple-400' },
  [ActivityType.EditedGoal]: { light: 'bg-yellow-500', dark: 'dark:bg-yellow-400' },
  [ActivityType.CompletedGoal]: { light: 'bg-emerald-500', dark: 'dark:bg-emerald-400' },
};

export interface Activity {
  activityType: ActivityType;
  date: Date;
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
  activity: Activity[];
  reward?: string;
  consequence?: string;
  privacy: PrivacyStatus;
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
  content: string;
  likes: { _id: string }[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    _id: string;
    name: string;
    avatar?: string;
  };
}

export interface CreateCommentDto {
  content: string;
}

export interface ProfileStats {
  goalsCreatedThisMonth: number;
  activeGoalsNow: number;
  completedGoals: number;
  closedTasks: number;
  blogPosts: number;
  rating: number;
}

export interface GetGoalsPaginationDto {
  page?: number;
  limit?: number;
}

export interface PaginatedGoalsResponse {
  goals: Goal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
