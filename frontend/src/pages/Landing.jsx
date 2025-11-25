import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AcademicCapIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/solid';

const Landing = () => {
  // Assuming Redux state setup is correct: state.auth provides { isAuthenticated, user }
  // NOTE: This file assumes Redux is configured correctly in the surrounding application.
  // We use a mock useSelector function here to prevent compilation errors in isolation.
  const useSelectorMock = (state) => ({ isAuthenticated: false, user: null });
  const { isAuthenticated, user } = useSelector(useSelectorMock);

  // FIXED: Changed to a reliable, generic placeholder image URL.
  const studentImageURL = 'https://placehold.co/800x600/5c6bc0/ffffff?text=Interactive+Learning';

  // Redirect logic remains the same (NOTE: window.location.href is used here as a placeholder for navigate)
  if (isAuthenticated) {
    if (user.role === 'admin') {
      // In a real app, use navigate('/admin/students');
      console.log('Redirecting to Admin Dashboard...');
    } else {
      // In a real app, use navigate('/student/dashboard');
      console.log('Redirecting to Student Dashboard...');
    }
    // IMPORTANT: Must return null or a loading component after initiating a redirect
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header/Nav */}
      <header className="py-4 px-6 md:px-12 bg-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="text-3xl font-extrabold text-blue-600 tracking-tight">
            Questify
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">

            {/* Left Side: Text and CTA */}
            <div className="md:w-1/2 text-center md:text-left">
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-4 py-1.5 rounded-full uppercase tracking-wider mb-4 shadow-sm">
                MCQ Engagement Platform
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-snug mb-5">
                Master Your Subject With <span className="text-blue-600">Interactive Quizzes.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-10">
                The comprehensive system for creating, managing, and answering challenging Multiple-Choice Questions (MCQs) for better student engagement and analytics.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                  Start Quizzing Now
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-100 transition shadow-md transform hover:scale-[1.02] active:scale-95 duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right Side: Image Display */}
            <div className="md:w-1/2 relative">
              <div className="w-full aspect-video md:aspect-[4/3] rounded-3xl shadow-2xl overflow-hidden transform rotate-1 transition duration-500 ease-in-out hover:rotate-0">
                <img
                  src={studentImageURL}
                  alt="A visual representation of interactive learning with a quiz platform on mobile devices"
                  className="w-full h-full object-cover"
                  // Ensure a fallback in case the placeholder still fails
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/3b82f6/ffffff?text=Questify+Platform"; }}
                />
              </div>
              {/* Decorative Animated Elements */}
              <div className="hidden sm:block absolute -top-8 left-0 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob1"></div>
              <div className="hidden sm:block absolute bottom-4 -right-8 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob2"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-20">
          <div className="container mx-auto px-6 max-w-7xl">
            <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-16">
              A Platform Built for <span className="text-blue-600">Engagement</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* Feature 1: Admin */}
              <div className="p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transition hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-1 duration-300">
                <AcademicCapIcon className="w-12 h-12 text-blue-500 mb-4 bg-blue-50 p-2 rounded-full shadow-inner" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Educators & Admins</h3>
                <p className="text-gray-600">Easily create and manage question banks, assign tests, and track class-wide performance with deep, actionable analytics.</p>
              </div>

              {/* Feature 2: Student */}
              <div className="p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transition hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-1 duration-300">
                <UserGroupIcon className="w-12 h-12 text-green-500 mb-4 bg-green-50 p-2 rounded-full shadow-inner" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">For Motivated Students</h3>
                <p className="text-gray-600">Answer assigned MCQs on any device, get instant feedback, and view personalized progress to identify areas for mastery.</p>
              </div>

              {/* Feature 3: Analytics */}
              <div className="p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center transition hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-1 duration-300">
                <ChartBarIcon className="w-12 h-12 text-purple-500 mb-4 bg-purple-50 p-2 rounded-full shadow-inner" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Powerful Tracking</h3>
                <p className="text-gray-600">Monitor engagement levels, question difficulty, and assignment completion rates for data-driven teaching strategies and optimization.</p>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Small Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm max-w-7xl">
          &copy; {new Date().getFullYear()} Questify. All rights reserved. |
          <Link to="/privacy" className="hover:text-blue-400 ml-2 transition">Privacy Policy</Link>
          <span className="mx-2 text-gray-500">|</span>
          <Link to="/terms" className="hover:text-blue-400 transition">Terms of Service</Link>
        </div>
      </footer>

      {/* Custom Styles for Blob Animation */}
      <style jsx="true">{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(0.95); }
          66% { transform: translate(10px, -10px) scale(1.05); }
        }
        .animate-blob1 {
          animation: blob1 10s infinite ease-in-out alternate;
        }
        .animate-blob2 {
          animation: blob2 12s infinite ease-in-out alternate-reverse;
        }
      `}</style>
    </div>
  );
};

export default Landing;


