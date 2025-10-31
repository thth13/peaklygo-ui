export interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

export type PremiumType = 'monthly' | 'year';

export type PlanType = 'monthly' | 'annual';

interface User {
  _id: string;
  username: string;
  isPro: boolean;
  tutorialCompleted: boolean;
  proExpires?: string;
  proType?: 'monthly' | 'year';
}

export interface UserProfile {
  _id: string;
  name: string;
  avatar: string;
  description: string;
  views: number;
  user: User;
  following: string[];
  followers: string[];
  rating: number;
}

export enum PrivacyStatus {
  Private = 'private',
  Friends = 'friends',
  Public = 'public',
}

export enum GoalType {
  Regular = 'regular',
  Habit = 'habit',
}

export enum DayOfWeek {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
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
  MarkHabitDay = 'markHabitDay',
  UnmarkHabitDay = 'unmarkHabitDay',
  UpdatedDeadline = 'updatedDeadline',
  EditedGoal = 'editedGoal',
  CompletedGoal = 'completedGoal',
}

export const getActivityTypeLabel = (
  activityType: ActivityType | undefined | null,
  t: (key: string) => string,
): string => {
  if (!activityType) {
    return t('activities.unknownActivity');
  }

  const labelKeys: Record<ActivityType, string> = {
    [ActivityType.ProgressEntry]: 'activities.progressEntry',
    [ActivityType.MarkStep]: 'activities.markStep',
    [ActivityType.UnmarkStep]: 'activities.unmarkStep',
    [ActivityType.MarkHabitDay]: 'activities.markHabitDay',
    [ActivityType.UnmarkHabitDay]: 'activities.unmarkHabitDay',
    [ActivityType.UpdatedDeadline]: 'activities.updatedDeadline',
    [ActivityType.EditedGoal]: 'activities.editedGoal',
    [ActivityType.CompletedGoal]: 'activities.completedGoal',
  };

  const labelKey = labelKeys[activityType];
  return labelKey ? t(labelKey) : t('activities.unknownActivity');
};

export const ActivityTypeColors: Record<ActivityType, { light: string; dark: string }> = {
  [ActivityType.ProgressEntry]: { light: 'bg-blue-500', dark: 'dark:bg-blue-400' },
  [ActivityType.MarkStep]: { light: 'bg-green-500', dark: 'dark:bg-green-400' },
  [ActivityType.UnmarkStep]: { light: 'bg-orange-500', dark: 'dark:bg-orange-400' },
  [ActivityType.MarkHabitDay]: { light: 'bg-teal-500', dark: 'dark:bg-teal-400' },
  [ActivityType.UnmarkHabitDay]: { light: 'bg-red-500', dark: 'dark:bg-red-400' },
  [ActivityType.UpdatedDeadline]: { light: 'bg-purple-500', dark: 'dark:bg-purple-400' },
  [ActivityType.EditedGoal]: { light: 'bg-yellow-500', dark: 'dark:bg-yellow-400' },
  [ActivityType.CompletedGoal]: { light: 'bg-emerald-500', dark: 'dark:bg-emerald-400' },
};

export interface Activity {
  activityType: ActivityType;
  date: Date;
}

export interface HabitDay {
  date: Date;
  isCompleted: boolean;
}

export enum ParticipantRole {
  Owner = 'owner',
  Admin = 'admin',
  Member = 'member',
}

export enum InvitationStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Declined = 'declined',
}

export interface GroupSettings {
  allowMembersToInvite: boolean;
  requireApproval: boolean;
  maxParticipants?: number | null;
}

export type CheckInStatus = 'completed' | 'missed' | 'pending';

export interface CheckIn {
  userId: string;
  date: Date;
  status: CheckInStatus;
  createdAt: Date;
}

export interface Participant {
  userId: string | { _id: string; username?: string };
  role?: ParticipantRole | string;
  invitationStatus?: InvitationStatus | string;
  joinedAt?: Date;
  contributionScore?: number;
}

export interface Goal extends Document {
  _id: string;
  goalName: string;
  category: string;
  description?: string;
  goalType: GoalType;
  startDate: Date;
  endDate?: Date;
  completedDate?: Date;
  noDeadline?: boolean;
  habitDuration?: number;
  habitDaysOfWeek?: DayOfWeek[];
  habitCompletedDays?: HabitDay[];
  image?: string;
  steps: Step[];
  activity: Activity[];
  reward?: string;
  consequence?: string;
  privacy: PrivacyStatus;
  isCompleted: boolean;
  isArchived: boolean;
  value: number;
  userId: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GoalParticipant = Participant;

export interface GroupGoal {
  _id: string;
  goalName: string;
  category: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  habitDuration?: number;
  habitDaysOfWeek?: DayOfWeek[];
  image?: string;
  isCompleted: boolean;
  isArchived: boolean;
  userId: string;
  participants: Participant[];
  checkIns: CheckIn[];
  groupSettings: GroupSettings;
  reward?: string;
  consequence?: string;
  value?: number;
  progress?: number;
  privacy?: PrivacyStatus;
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
  goalId?: string;
  groupGoalId?: string;
  userId?: {
    _id: string;
    username: string;
    avatar?: string;
    user: string;
  };
  profile?: {
    _id: string;
    name: string;
    avatar?: string;
    user: string;
  };
  content: string;
  day: number;
  likes: { _id: string }[];
  comments?: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  commentCount?: number;
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
    user: string;
  };
}

export interface CreateCommentDto {
  content: string;
}

export interface MarkHabitDayDto {
  date: string; // YYYY-MM-DD format
  isCompleted: boolean;
}

export interface ProfileStats {
  goalsCreatedThisMonth: number;
  activeGoalsNow: number;
  completedGoals: number;
  closedTasks: number;
  blogPosts: number;
  rating: number;
}

export enum GoalFilterType {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface GetGoalsPaginationDto {
  page?: number;
  limit?: number;
  filter?: GoalFilterType;
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

export interface PaginatedGroupGoalsResponse {
  goals: GroupGoal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GroupGoalStats {
  totalParticipants: number;
  activeParticipants: number;
  pendingInvitations: number;
  topContributors: Array<{
    userId: string | { _id: string; username?: string };
    contributionScore: number;
  }>;
}

export interface LandingGoal {
  _id: string;
  goalName: string;
  category: string;
  description?: string;
  goalType?: GoalType;
  startDate: Date;
  endDate?: Date;
  noDeadline?: boolean;
  habitDuration?: number;
  habitDaysOfWeek?: DayOfWeek[];
  image?: string;
  steps: Step[];
  activity: Activity[];
  reward?: string;
  consequence?: string;
  privacy: PrivacyStatus;
  isCompleted: boolean;
  isArchived: boolean;
  value: number;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  userId: {
    _id: string;
    username: string;
    profile?: {
      _id: string;
      name: string;
      avatar?: string;
    };
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'upcoming';
  currentDay: number;
  totalDays: number;
  participantsCount: number;
  activeParticipantsCount: number;
  overallSuccessRate: number;
  createdAt: Date;
}

export interface ChallengeParticipant {
  id: string;
  name: string;
  avatar: string;
  completedDays: number;
  totalDays: number;
  successRate: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}

export interface ChallengeDayProgress {
  date: Date;
  dayNumber: number;
  isCompleted: boolean;
  isPending: boolean;
  isFailed: boolean;
}

export interface ChallengeMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: Date;
}

export enum NotificationType {
  GroupInvite = 'group_invite',
  Subscription = 'subscription',
  Message = 'message',
}

export interface NotificationMetadata {
  goalId?: string;
  inviterId?: string;
  subscriptionType?: string;
  messageId?: string;
  avatarUrl?: string;
  senderAvatar?: string;
  inviterAvatar?: string;
  senderName?: string;
  [key: string]: any;
}

export interface UserNotification {
  _id: string;
  user: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: NotificationMetadata;
  read: boolean;
  readAt?: string | Date;
  isResponded?: 'accepted' | 'declined';
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface NotificationsResponse {
  items: UserNotification[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
}

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
}
