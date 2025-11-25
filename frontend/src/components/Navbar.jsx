import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { logout } from '../redux/slices/authSlice'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Define the consistent hover class
  const navHoverClass = "px-3 py-2 rounded hover:bg-blue-700 transition duration-150 ease-in-out";

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold" onClick={closeMenu}>
              Questify
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <div className="ml-8 flex space-x-4">
                {user.role === 'admin' ? (
                  <>
                    <Link to="/admin/students" className={navHoverClass}>
                      Students
                    </Link>
                    <Link to="/admin/classes" className={navHoverClass}>
                      Classes
                    </Link>
                    <Link to="/admin/questions" className={navHoverClass}>
                      Questions
                    </Link>
                    <Link to="/admin/assign" className={navHoverClass}>
                      Assign Questions
                    </Link>
                    <Link to="/admin/responses" className={navHoverClass}>
                      Responses
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/student/dashboard" className={navHoverClass}>
                      Dashboard
                    </Link>
                    <Link to="/student/responses" className={navHoverClass}>
                      My Responses
                    </Link>
                  </>
                )}
                <Link to="/leaderboard" className={navHoverClass}>
                  Leaderboard
                </Link>
                <Link to="/profile" className={navHoverClass}>
                  Profile
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm font-medium">Welcome, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {user && (
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && user && (
        <div className="md:hidden bg-blue-600 px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-500">
          {user.role === 'admin' ? (
            <>
              <Link
                to="/admin/students"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Students
              </Link>
              <Link
                to="/admin/classes"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Classes
              </Link>
              <Link
                to="/admin/questions"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Questions
              </Link>
              <Link
                to="/admin/assign"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Assign Questions
              </Link>
              <Link
                to="/admin/responses"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Responses
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/student/dashboard"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/student/responses"
                className="block px-3 py-2 rounded hover:bg-blue-700"
                onClick={closeMenu}
              >
                My Responses
              </Link>
            </>
          )}
          <Link
            to="/leaderboard"
            className="block px-3 py-2 rounded hover:bg-blue-700"
            onClick={closeMenu}
          >
            Leaderboard
          </Link>
          <Link
            to="/profile"
            className="block px-3 py-2 rounded hover:bg-blue-700"
            onClick={closeMenu}
          >
            Profile
          </Link>
          <div className="pt-4 pb-2 border-t border-blue-500">
            <div className="flex items-center px-3 mb-2">
              <span className="text-sm font-medium">Welcome, {user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left block px-3 py-2 rounded bg-red-500 hover:bg-red-600 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar