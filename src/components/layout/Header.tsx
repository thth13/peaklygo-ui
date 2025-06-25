export const Header = () => (
  <header id="header" className="bg-white shadow-sm py-4 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary-600">PeaklyGo</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700">
          <i className="fa-solid fa-bell"></i>
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <i className="fa-solid fa-envelope"></i>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden">
          <img
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg"
            alt="Profile"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  </header>
);
