import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';

// Placeholder image URL for the visual element
const LOGIN_IMAGE_URL = "https://images.unsplash.com/photo-1593062095033-fd4840d2345d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";

// Define the Login component
const Login = () => {
  // --- MODIFIED LOGIC ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 💡 CHANGE MADE HERE: Default role is now 'student'
  const [role, setRole] = useState('student');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/students');
      } else {
        navigate('/student/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      // Clear error only when component unmounts
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Dispatch login action using the original Redux logic
    dispatch(login({ email, password, role }));
  };
  // ------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl bg-white">

        {/* Left Side: Animated Login Form (Enhanced Styling) */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center animate-fadeInLeft">
          <div className="text-center lg:text-left">
            <div className="text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">
              Questify
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-md text-gray-600">
              Sign in to manage your quizzes or continue learning.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

            {/* Role Selector */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Sign in as
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-150 ease-in-out"
              >
                <option value="student">Student</option>
                <option value="admin">Admin / Educator</option>
              </select>
            </div>

            {/* Email Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="Email address"
              />
            </div>

            {/* Password Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="Password"
              />
            </div>

            {/* Error Message (Uses original 'error' from Redux state) */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 shadow-md border border-red-200 animate-slideDown">
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}

            {/* Submit Button (Uses original 'loading' from Redux state) */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition duration-200 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign in'}
              </button>
            </div>

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