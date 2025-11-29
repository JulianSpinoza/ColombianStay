import React, { useState } from "react";

const Navbar = ({ user, onLogout, onLoginClick, onSignupClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleLoginClick = () => {
    setIsProfileMenuOpen(false);
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleSignupClick = () => {
    setIsProfileMenuOpen(false);
    if (onSignupClick) {
      onSignupClick();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16 gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏠</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                ColombianStay
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 hidden sm:block max-w-md">
            <div className="relative">
              <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-text">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1 placeholder-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            {/* Become a Host Link */}
            <button className="hidden sm:block text-gray-700 font-medium hover:bg-gray-100 px-4 py-2 rounded-full transition-colors">
              Become a host
            </button>

            {/* Language/Currency */}
            <button className="hidden sm:block p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 6a3 3 0 013-3h10a1 1 0 01.82 1.573l-7 10.666A1 1 0 018.903 16H5a3 3 0 01-3-3V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-full hover:shadow-md transition-shadow"
              >
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.5 1.5H.5v2h10V1.5zM.5 6.5h10v2H.5v-2zm0 5h10v2H.5v-2z" />
                </svg>
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm border-b border-gray-200">
                        <p className="font-semibold text-gray-900">{user.firstName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your trips
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Saved
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Account
                      </a>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleLoginClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Log in
                      </button>
                      <button
                        type="button"
                        onClick={handleSignupClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign up
                      </button>
                      <hr className="my-2" />
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Become a host
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Help
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
