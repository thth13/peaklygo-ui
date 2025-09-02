import { IMAGE_URL } from '@/constants';
import { UserProfile } from '@/types';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ProfileHeaderProps {
  profile: UserProfile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        {profile?.avatar ? (
          <img src={`${IMAGE_URL}/${profile.avatar}`} alt="Profile" className="h-16 w-16 object-cover rounded-full" />
        ) : (
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-white text-xl" />
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile?.name || 'Пользователь'}</h2>
        <p className="text-gray-500 dark:text-gray-400">
          @
          {typeof profile?.user === 'object'
            ? profile.user.username
            : profile?.name?.toLowerCase().replace(/\s+/g, '') || 'user'}
        </p>
      </div>
    </div>
  );
}
