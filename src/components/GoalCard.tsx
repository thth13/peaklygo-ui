'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons';
import { LandingGoal } from '@/types';
import { IMAGE_URL } from '@/constants';

interface GoalCardProps {
  goal: LandingGoal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const t = useTranslations('home');
  const completedSteps = goal.steps.filter((step) => step.isCompleted).length;
  const totalSteps = goal.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const liked = false;
  const statusColor = goal.isCompleted
    ? 'bg-green-100 text-green-700'
    : progressPercentage > 70
    ? 'bg-green-100 text-green-700'
    : 'bg-primary-100 text-primary-700';
  const status = goal.isCompleted
    ? t('status.completed')
    : progressPercentage > 70
    ? t('status.almostDone')
    : t('status.inProgress');

  // generate mock likes and comments based on goal ID
  const getLikesAndComments = (goalId: string) => {
    const hash = goalId.slice(-3);
    const num = parseInt(hash, 16) || 42;
    return {
      likes: (num % 80) + 15,
      comments: (num % 25) + 3,
    };
  };

  const { likes, comments } = getLikesAndComments(goal._id);

  return (
    <a
      href={`/goal/${goal._id}`}
      id={goal._id}
      className="block bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="flex items-start space-x-4 mb-4">
        <div className="h-12 w-12 rounded-full overflow-hidden">
          <Image
            src={`${IMAGE_URL}/${goal.userId.profile?.avatar}` || '/public/next.svg'}
            alt="Profile"
            width={48}
            height={48}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{goal.userId.profile?.name || t('communityGoals.user')}</h3>
          <p className="text-sm text-gray-500">@{goal.userId.username}</p>
        </div>
        <button className={liked ? 'text-red-500' : 'text-primary-600 hover:text-primary-700'}>
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>

      <div className="mb-4">
        {goal.image && (
          <div className="w-full h-48 rounded-lg overflow-hidden mb-3">
            <Image
              src={`${IMAGE_URL}/${goal.image}`}
              alt={goal.goalName}
              width={400}
              height={192}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{goal.goalName}</h4>
        <p className="text-gray-600 text-sm">{goal.description || t('communityGoals.noDescription')}</p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{t('communityGoals.progress')}</span>
          <span className="text-sm text-gray-500">
            {completedSteps}/{totalSteps} {t('communityGoals.tasks')}
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className={`h-2 rounded-full ${
              goal.isCompleted || progressPercentage > 80 ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>
            <FontAwesomeIcon icon={faHeart} className="mr-1" />
            {likes}
          </span>
          <span>
            <FontAwesomeIcon icon={faComment} className="mr-1" />
            {comments}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{status}</span>
      </div>
    </a>
  );
}
