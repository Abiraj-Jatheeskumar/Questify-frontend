import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../redux/slices/authSlice';

const REGISTER_IMAGE_URL = "https://images.unsplash.com/photo-1523521256529-9b7f9b8f7c9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    admissionNo: '',
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

    if (!formData.admissionNo.trim()) {
      setValidationError('Student card number is required');
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

    // Dispatch register action - All users register as students
    const result = await dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student', // Fixed role as student
      admissionNo: formData.admissionNo.trim()
    }));

    // If registration is successful, navigate to login
    if (result.payload && !error) {
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        admissionNo: '',
      });
      // Navigate to login with success message
      navigate('/login', { state: { message: 'Registration successful! Please log in with your credentials.' } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl bg-white">

        {/* Left Side: Registration Disabled Message */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center animate-fadeInLeft">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">
              Questify
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Student Registration
            </h2>
            
            {/* Registration Disabled Message */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Registration Currently Unavailable</h3>
              <p className="text-gray-700 mb-4">
                Student registration is temporarily disabled. All student accounts are being managed by administrators.
              </p>
              <div className="bg-white rounded-lg p-4 border border-yellow-300">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>If you are a student:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Your account has been created by your administrator</li>
                  <li>• You should have received your login credentials</li>
                  <li>• Please use the login page to access your account</li>
                  <li>• Contact your administrator if you need assistance</li>
                </ul>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out shadow-lg hover:shadow-xl"
              >
                Go to Login Page
              </Link>
            </div>
          </div>
        </div>

        {/* COMMENTED OUT: Registration Form - Will be enabled later when needed */}
        {/* 
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-16 flex flex-col justify-center animate-fadeInLeft">
          <div className="text-center lg:text-left">
            <div className="text-3xl font-extrabold text-blue-600 mb-2 tracking-tight">
              Questify
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Student Registration
            </h2>
            <p className="mt-2 text-md text-gray-600">
              Join as a student and start learning today
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

            {/* Name Input */}
            {/* <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="John Doe"
              />
            </div> */}

            {/* Email Input */}
            {/* <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="your.email@example.com"
              />
            </div> */}

            {/* Student Card Number Input */}
            {/* <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="admissionNo" className="block text-sm font-medium text-gray-700 mb-2">
                Student Card Number
              </label>
              <input
                id="admissionNo"
                name="admissionNo"
                type="text"
                autoComplete="off"
                required
                value={formData.admissionNo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="Enter your student card number"
              />
            </div> */}

            {/* Password Input */}
            {/* <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-600 mt-1">Minimum 6 characters</p>
            </div> */}

            {/* Confirm Password Input */}
            {/* <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                placeholder="••••••••"
              />
            </div> */}

            {/* Error Messages */}
            {/* {(validationError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm animate-pulse">
                {validationError || error}
              </div>
            )} */}

            {/* Register Button */}
            {/* <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating Student Account...' : 'Create Student Account'}
              </button>
            </div> */}

            {/* Login Link */}
            {/* <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign in here
              </Link>
            </p> */}
          {/* </form>
        </div> */}
        {/* END OF COMMENTED OUT FORM */}

        {/* Right Side: Image (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-700 relative overflow-hidden items-center justify-center">
          <img
            src={REGISTER_IMAGE_URL}
            alt=""
            className="w-full h-full object-cover opacity-80"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-blue-600 opacity-40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8">
            <h3 className="text-4xl font-bold mb-4">Questify Learning Platform</h3>
            <p className="text-lg opacity-90 mb-4">
              Interactive quiz platform for enhanced learning experiences
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 max-w-md">
              <p className="text-sm">
                All student accounts are managed by administrators to ensure secure and organized access to the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;