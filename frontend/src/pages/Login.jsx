import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';

// Placeholder image URL for the visual element
const LOGIN_IMAGE_URL = "https://images.unsplash.com/photo-1593062095033-fd4840d2345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";

// Define the Login component
const Login = () => {
  // --- MODIFIED LOGIC ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  // 💡 CHANGE MADE HERE: Default role is now 'student'
  const [role, setRole] = useState('student');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Clear local error when user starts typing
  useEffect(() => {
    if (localError) {
      setLocalError('');
    }
  }, [email, password, role]);

  // Clear Redux error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/students');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic client-side validation
    if (!email.trim()) {
      setLocalError('Email is required');
      return;
    }

    if (!password.trim()) {
      setLocalError('Password is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Clear any previous errors
    setLocalError('');
    
    // Dispatch login action using the original Redux logic
    dispatch(login({ email, password, role }));
  };
  // ------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-6xl overflow-visible rounded-3xl shadow-2xl bg-white border-2 border-purple-100">

        {/* Left Side: Animated Login Form (Enhanced Styling) */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center animate-fadeInLeft">
          <div className="text-center lg:text-left mb-8">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
              🎯 Questify
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Welcome Back!
            </h2>
            <p className="text-md text-gray-600 leading-relaxed">
              Sign in to continue your learning journey 🚀
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Role Selector */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="role" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Sign in as
              </label>
              <div className="relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200 font-semibold text-sm sm:text-base appearance-none cursor-pointer pr-10"
                >
                  <option value="student">👨‍🎓 Student</option>
                  <option value="admin">👨‍🏫 Admin / Educator</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message (Shows both local and Redux errors) */}
            {(localError || error) && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-lg border-2 border-red-300 animate-slideDown">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">
                      {localError || error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button (Uses original 'loading' from Redux state) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-700">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                Sign up here →
              </Link>
            </p>

          </form>

        </div>

        {/* Right Side: Image and Decorative Text (Hidden on small screens) */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={LOGIN_IMAGE_URL}
            alt="Students studying on mobile devices"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x1200/5c6bc0/ffffff?text=Study+Visuals"; }}
          />
          <div className="absolute inset-0 bg-blue-600 opacity-80 mix-blend-multiply rounded-r-2xl"></div>

          <div className="absolute inset-0 p-16 flex flex-col justify-end text-white">
            <h3 className="text-4xl font-bold mb-4">
              Learn Anywhere, Anytime.
            </h3>
            <p className="text-xl opacity-90">
              Access your personalized learning path and challenging MCQs right from your mobile device.
            </p>
          </div>
        </div>
      </div>

      {/* Tailwind Custom CSS Animations (Inline Style Definition) */}
      <style jsx="true">{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.7s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;