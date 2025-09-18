import { IMAGE_URL } from '@/constants';
import { UserProfile } from '@/types';
import { faPenToSquare, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTranslations } from 'next-intl';
import LinkWithProgress from '../../Link';
import Image from 'next/image';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  isMyProfile?: boolean;
  userId?: string;
}

export function ProfileHeader({ profile, isMyProfile, userId }: ProfileHeaderProps) {
  const t = useTranslations('sidebar');

  return (
    <div className="relative flex items-center space-x-4 mb-4">
      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        {profile?.avatar ? (
          <Image
            src={`${IMAGE_URL}/${profile.avatar}`}
            alt="Profile"
            width={64}
            height={64}
            className="h-16 w-16 object-cover rounded-full"
          />
        ) : (
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile?.name || t('user')}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          @
          {typeof profile?.user === 'object'
            ? profile.user.username
            : profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
        </p>
      </div>
      {isMyProfile && userId && (
        <LinkWithProgress
          href={`/profile/${userId}/edit`}
          className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Edit profile"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="text-base" />
        </LinkWithProgress>
      )}
    </div>
  );
}
