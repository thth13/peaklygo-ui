import { UserProfile } from '@/types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center space-x-4 mb-4">
      <div className="h-16 w-16 rounded-full overflow-hidden">
        <img
          src={profile?.avatar || 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg'}
          alt="Profile"
          className="h-full w-full object-cover"
        />
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
