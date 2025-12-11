import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';

const REGISTER_IMAGE_URL = "https://images.unsplash.com/photo-1523521256529-9b7f9b8f7c9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNo: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (!formData.name.trim()) {
      setValidationError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setValidationError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Validate admission number
    if (!formData.admissionNo.trim()) {
      setValidationError('Student ID / Admission Number is required');
      return;
    }

    // Dispatch register action - All users register as students
    const result = await dispatch(register({
      name: formData.name,
      email: formData.email,
      admissionNo: formData.admissionNo,
      password: formData.password,
      role: 'student' // Fixed role as student
    }));

    // If registration is successful, navigate to login
    // Check if the action was fulfilled (not rejected) by checking result.type
    if (result.type === 'auth/register/fulfilled' && result.payload) {
      // Reset form
      setFormData({
        name: '',
        email: '',
        admissionNo: '',
        password: '',
        confirmPassword: '',
      });
      // Navigate to login with success message
      navigate('/login', { state: { message: 'Registration successful! Please log in with your credentials.' } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-6xl overflow-visible rounded-3xl shadow-2xl bg-white border-2 border-purple-100">

        {/* Left Side: Register Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center animate-fadeInLeft">
          <div className="text-center lg:text-left mb-6">
            <div className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
              🎯 Questify
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Join the Journey!
            </h2>
            <p className="text-md text-gray-600 leading-relaxed">
              Create your account and start learning today 🚀
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Name Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="name" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="John Doe"
              />
            </div>

            {/* Email Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Admission Number Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="admissionNo" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                Student ID / Admission Number
              </label>
              <input
                id="admissionNo"
                name="admissionNo"
                type="text"
                required
                value={formData.admissionNo}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="e.g., AI2024015"
              />
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                Use your student ID card number
              </p>
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 shadow-sm text-sm sm:text-base"
                placeholder="••••••••"
              />
            </div>

            {/* Role Information */}
            

            {/* Error Messages */}
            {(validationError || error) && (
              <div className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-lg border-2 border-red-300">
                <div className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">
                      {validationError || error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            {/* Register Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 hover:from-purple-700 hover:via-blue-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Your Account...
                  </>
                ) : (
                  <>
                    Create Student Account
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-700">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                Sign in here →
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side: Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden items-center justify-center">
          <img
            src={REGISTER_IMAGE_URL}
            alt="Register illustration"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-blue-600 opacity-40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
            <h3 className="text-4xl font-bold mb-4">Join as a Student</h3>
            <p className="text-lg opacity-90">
              Start your learning journey with our interactive quiz platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;