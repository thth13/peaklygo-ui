import { faBullseye, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Header = () => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center">
            <FontAwesomeIcon icon={faBullseye} className="text-blue-600 text-2xl mr-2" />
            <span className="text-xl font-semibold text-gray-900">Goal Accomplishment</span>
          </div>
          <nav className="hidden md:ml-8 md:flex md:space-x-6">
            <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
              Goal Placement
            </span>
            <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
              Progress Blog
            </span>
            <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
              Word Value
            </span>
            <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
              Challenges
            </span>
            <span className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium cursor-pointer">
              Group Goals
            </span>
          </nav>
        </div>
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-400 hover:text-gray-500">
            <FontAwesomeIcon icon={faBell} className="text-lg" />
          </button>
          <div className="ml-3 relative">
            <div className="flex items-center">
              {/* <Image
                    className="h-8 w-8 rounded-full"
                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg"
                    alt="User avatar"
                    width={32}
                    height={32}
                  /> */}
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">Анна К.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);
