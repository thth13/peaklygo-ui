import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import LinkWithProgress from '../../Link';

interface ProfileActionsProps {
  isMyProfile?: boolean;
  userId?: string;
}

export function ProfileActions({ isMyProfile, userId }: ProfileActionsProps) {
  return (
    <div className="space-y-3">
      {isMyProfile && (
        <LinkWithProgress
          href="/goal/create"
          className="w-full bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-all text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
          <span>Добавить цель</span>
        </LinkWithProgress>
      )}
    </div>
  );
}
