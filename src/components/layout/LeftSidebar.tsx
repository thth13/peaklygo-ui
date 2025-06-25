import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBullseye,
  faTrophy,
  faUsers,
  faEnvelope,
  faChartLine,
  faPeopleGroup,
} from '@fortawesome/free-solid-svg-icons';
import LinkWithProgress from '../Link';

export const LeftSidebar = () => {
  return (
    <div id="left-sidebar" className="w-1/4 pr-6">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden">
            <img
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Alex Johnson</h2>
            <p className="text-gray-500">@alexjohnson</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 font-medium">Рейтинг</span>
            <span className="text-primary-600 font-bold text-xl">785</span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="bg-primary-500 h-2 rounded-full" style={{ width: '78.5%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="text-center">
            <div className="text-green-500 font-bold text-lg">18</div>
            <div className="text-gray-500 text-xs">Достигнуто</div>
          </div>
          <div className="text-center">
            <div className="text-primary-500 font-bold text-lg">7</div>
            <div className="text-gray-500 text-xs">В процессе</div>
          </div>
          <div className="text-center">
            <div className="text-red-500 font-bold text-lg">3</div>
            <div className="text-gray-500 text-xs">Провалено</div>
          </div>
        </div>

        <LinkWithProgress
          href="/goal/create"
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-all text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="w-4 mr-2 text-base" />
          <span>Добавить цель</span>
        </LinkWithProgress>
      </div>

      <div id="navigation-menu" className="bg-white rounded-lg shadow-sm p-4">
        <nav>
          <ul className="space-y-1">
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-primary-600 bg-primary-50 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faBullseye} className="w-4 mr-3 text-base" />
                <span>Мои цели</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faTrophy} className="w-4 mr-3 text-base" />
                <span>Мои челленджи</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-base" />
                <span>Подписки</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 mr-3 text-base" />
                <span>Сообщения</span>
                <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faChartLine} className="w-4 mr-3 text-base" />
                <span>Прогресс</span>
              </span>
            </li>
            <li>
              <span className="flex items-center py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 font-medium cursor-pointer text-sm">
                <FontAwesomeIcon icon={faPeopleGroup} className="w-4 mr-3 text-base" />
                <span>Групповые цели</span>
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
