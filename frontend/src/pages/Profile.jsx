import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import { updateProfile, changePassword, clearStatus } from '../redux/slices/authSlice'

const Profile = () => {
  const dispatch = useDispatch()
  const { user, loading, error, profileSuccess, passwordSuccess } = useSelector((state) => state.auth)

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordError, setPasswordError] = useState(null)

  // Sync user data when it changes
  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    })
  }, [user])

  // Clear status messages on unmount
  useEffect(() => {
    return () => {
      dispatch(clearStatus())
    }
  }, [dispatch])

  // Handlers (Original logic preserved)
  const handleProfileSubmit = (e) => {
    e.preventDefault()
    dispatch(updateProfile(profileForm))
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match')
      return
    }

    setPasswordError(null)
    dispatch(changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    })
  }

  // Common input classes for consistent styling
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out";

  // Common button class structure
  const baseButtonClass = "w-full flex justify-center items-center py-3 px-4 border border-transparent text-lg font-semibold rounded-xl shadow-md transition duration-200 ease-in-out transform hover:scale-[1.005] disabled:opacity-50 disabled:cursor-not-allowed";

  // Loading spinner SVG
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  // Status message container component
  const StatusMessage = ({ type, message }) => {
    if (!message) return null;
    const colors = {
      error: {
        bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-800', icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )
      },
      success: {
        bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        )
      },
    };

    const style = colors[type];
    return (
      <div className={`mb-6 p-4 ${style.bg} border ${style.border} rounded-xl ${style.text} flex items-center font-medium shadow-sm transition duration-300`}>
        {style.icon}
        {message}
      </div>
    );
  };

  // Helper function to get initials for the avatar placeholder
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Placeholder image URL using name initials
  const avatarUrl = user?.name
    ? `https://placehold.co/100x100/3B82F6/FFFFFF?text=${getInitials(user.name)}`
    : `https://placehold.co/100x100/3B82F6/FFFFFF?text=U`;


  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full">

        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 sm:mb-10 border-b-2 border-blue-100 pb-3">
          Account Settings
        </h1>

        {/* Global Error/Status Messages */}
        <StatusMessage type="error" message={error} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">

          {/* 1. Profile Details Card (Now includes Avatar) */}
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              {/* Profile Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              My Information
            </h2>

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center mb-6 border-b pb-6 border-gray-100">
              <img
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                src={avatarUrl}
                alt={`${user?.name}'s avatar`}
                // Fallback in case placeholder generation fails
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100/6B7280/FFFFFF?text=ERR";
                }}
              />
              <p className="mt-3 text-lg font-medium text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.role || 'User'}</p>
              <button
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 transition duration-150"
                disabled // Placeholder for actual upload logic
              >
                Change Photo (Disabled)
              </button>
            </div>

            <StatusMessage type="success" message={profileSuccess} />

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed opacity-80`}
                />
                <p className="mt-2 text-xs text-gray-500">Email cannot be changed here.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${baseButtonClass} text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300`}
              >
                {loading ? <LoadingSpinner /> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* 2. Change Password Card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              {/* Lock Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Security Settings
            </h2>

            <StatusMessage type="success" message={passwordSuccess} />
            <StatusMessage type="error" message={passwordError} />

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${baseButtonClass} text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300`}
              >
                {loading ? <LoadingSpinner /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-10 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Questify. All rights reserved.</p>
          <p className="mt-1">Built for educational excellence and achievement.</p>
        </div>
      </footer>
    </div>
  )
}

export default Profile