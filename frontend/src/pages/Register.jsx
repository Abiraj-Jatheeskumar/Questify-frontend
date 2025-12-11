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

    // Dispatch register action - All users register as students
    const result = await dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'student' // Fixed role as student
    }));

    // If registration is successful, navigate to login
    if (result.payload && !error) {
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      // Navigate to login with success message
      navigate('/login', { state: { message: 'Registration successful! Please log in with your credentials.' } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-2xl shadow-2xl bg-white">

        {/* Left Side: Register Form */}
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
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
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
            </div>

            {/* Email Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
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
            </div>

            {/* Password Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
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
            </div>

            {/* Confirm Password Input */}
            <div className="relative transform transition-all duration-300 hover:scale-[1.01]">
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
            </div>

            {/* Role Information */}
            

            {/* Error Messages */}
            {(validationError || error) && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm animate-pulse">
                {validationError || error}
              </div>
            )}

            {/* Register Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Creating Student Account...' : 'Create Student Account'}
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                Sign in here
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