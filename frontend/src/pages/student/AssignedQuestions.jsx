import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api, { resetNetworkSession, getCurrentNetworkMetrics } from '../../services/api';

const AssignedQuestions = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [completedAssignments, setCompletedAssignments] = useState(new Set());
  const [hasAnyResponses, setHasAnyResponses] = useState(false);
  
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchAssignedQuestions();
    checkStudentResponses();
  }, []);

  const checkStudentResponses = async () => {
    try {
      const response = await api.get('/students/my-responses');
      setHasAnyResponses(response.data && response.data.length > 0);
    } catch (err) {
      setHasAnyResponses(false);
    }
  };

  const fetchAssignedQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students/assigned-questions');
      const questions = response.data;
      
      // Check if student is in any class (if questions array is empty, might be no class assigned)
      if (questions.length === 0 && user && (!user.classIds || user.classIds.length === 0)) {
        setError('');
        setAssignments([]);
        setLoading(false);
        return;
      }
      
      // Group questions by assignment and filter non-answered ones
      const groupedByAssignment = {};
      const completed = new Set();
      
      questions.forEach(q => {
        if (!groupedByAssignment[q.assignmentId]) {
          groupedByAssignment[q.assignmentId] = {
            assignmentId: q.assignmentId,
            title: q.assignmentTitle,
            description: q.assignmentDescription,
            className: q.className,
            classId: q.classId,
            isCompleted: q.assignmentCompleted,
            questions: []
          };
        }
        
        // Only add non-answered questions
        if (!q.isAnswered) {
          groupedByAssignment[q.assignmentId].questions.push(q);
        }
        
        // Track completed assignments
        if (q.assignmentCompleted) {
          completed.add(q.assignmentId);
        }
      });

      setAssignments(Object.values(groupedByAssignment).filter(a => a.questions.length > 0));
      setCompletedAssignments(completed);
      setError('');
    } catch (err) {
      setError('Failed to load assignments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (assignment) => {
    // Prevent opening completed quizzes
    if (completedAssignments.has(assignment.assignmentId)) {
      setError('This quiz has already been completed. You cannot attempt it again.');
      return;
    }
    
    // Reset network tracking for new quiz session
    resetNetworkSession();
    
    setActiveQuiz(assignment);
    setCurrentQuestionIndex(0);
    setResponses({});
    setElapsedTime(0);
    setQuizStartTime(Date.now());
    
    // Capture start time for FIRST question when quiz starts
    const times = {};
    times[assignment.questions[0].questionId] = Date.now();
    setStartTimes(times);
    
    // Scroll to top when starting quiz
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleSelectAnswer = (questionId, answerIndex) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleSubmitAnswer = async () => {
    if (submitting) return;
    
    const question = activeQuiz.questions[currentQuestionIndex];
    const selectedAnswer = responses[question.questionId];

    if (selectedAnswer === undefined) {
      setError('Please select an answer');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const startTime = startTimes[question.questionId];
      
      // Get current network metrics from session state (jitter/stability are accurate)
      // RTT will be from previous request (will be updated after this request completes)
      const currentMetrics = getCurrentNetworkMetrics();
      
      // Make the request - network metrics are included in request body
      const response = await api.post('/students/submit-answer', {
        questionId: question.questionId,
        selectedAnswer,
        classId: question.classId,
        startTime: startTime,
        assignmentId: activeQuiz.assignmentId,
        currentQuestionIndex: currentQuestionIndex,
        totalQuestions: activeQuiz.questions.length,
        // Include network metrics (jitter/stability from session, RTT from previous request)
        // After this request completes, metrics will be updated for next request
        networkMetrics: currentMetrics
      });

      // Move to next question
      if (currentQuestionIndex < activeQuiz.questions.length - 1) {
        // Set start time for NEXT question when clicking "Next"
        const nextQuestion = activeQuiz.questions[currentQuestionIndex + 1];
        setStartTimes(prev => ({
          ...prev,
          [nextQuestion.questionId]: Date.now()
        }));
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // Quiz completed
        setActiveQuiz(null);
        setError('');
        setQuizStartTime(null);
        fetchAssignedQuestions(); // Refresh to show updated status
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit answer';
      if (!errorMessage.includes('already answered')) {
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      // Set start time for NEXT question when skipping
      const nextQuestion = activeQuiz.questions[currentQuestionIndex + 1];
      setStartTimes(prev => ({
        ...prev,
        [nextQuestion.questionId]: Date.now()
      }));
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setActiveQuiz(null);
      setQuizStartTime(null);
      fetchAssignedQuestions();
    }
  };

  const handleQuitQuiz = () => {
    if (confirm('Are you sure you want to quit? Your progress will not be saved.')) {
      setActiveQuiz(null);
      setCurrentQuestionIndex(0);
      setResponses({});
      setStartTimes({});
      setQuizStartTime(null);
      setElapsedTime(0);
    }
  };

  // Scroll to top when question changes
  useEffect(() => {
    if (activeQuiz && currentQuestionIndex >= 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQuestionIndex, activeQuiz]);

  // Timer effect for quiz
  useEffect(() => {
    if (!activeQuiz || !quizStartTime) return;

    const timer = setInterval(() => {
      setElapsedTime(Date.now() - quizStartTime);
    }, 100);

    return () => clearInterval(timer);
  }, [activeQuiz, quizStartTime]);

  // Format time display
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // Quiz View
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;
    const selectedAnswer = responses[question.questionId];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Timer at Top */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 mb-6 border-t-4 border-purple-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{activeQuiz.title}</h2>
                <p className="text-gray-600 text-sm sm:text-base flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                  {activeQuiz.className}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Timer Display */}
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl px-4 py-2 text-center shadow-lg">
                  <div className="absolute inset-0 bg-white opacity-20 rounded-xl animate-pulse"></div>
                  <p className="text-xs text-purple-100 font-bold uppercase tracking-wide relative z-10">Time Elapsed</p>
                  <p className="text-2xl font-black text-white font-mono relative z-10">{formatTime(elapsedTime)}</p>
                </div>
                <button
                  onClick={handleQuitQuiz}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 whitespace-nowrap font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  ✕ Quit
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {currentQuestionIndex + 1}
                  </span>
                  of {activeQuiz.questions.length} Questions
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-bold text-purple-700">{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 h-full transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-pulse rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 border-l-4 border-purple-600">
            {/* Question Image */}
            {question.imageUrl && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img
                  src={question.imageUrl}
                  alt="Question"
                  className="w-full h-auto object-cover max-h-64 sm:max-h-96"
                />
              </div>
            )}

            {/* Question Text */}
            <div className="mb-6">
              <div className="inline-block px-4 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full text-sm font-bold text-purple-700 mb-4">
                Question {currentQuestionIndex + 1}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">{question.question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(question.questionId, index)}
                    disabled={submitting}
                    className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                      submitting 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    } ${
                      selectedAnswer === index
                        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-600 shadow-xl ring-4 ring-purple-100'
                        : 'bg-white border-gray-300 hover:border-purple-400 hover:bg-gray-50 hover:shadow-lg'
                    }`}
                  >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          selectedAnswer === index
                            ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                    </div>
                    <span className={`text-base sm:text-lg flex-1 ${selectedAnswer === index ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {option}
                    </span>
                    {selectedAnswer === index && (
                      <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>
                </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No options available for this question.</p>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={handleSkipQuestion}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              </svg>
              Skip
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={submitting || selectedAnswer === undefined}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : currentQuestionIndex === activeQuiz.questions.length - 1 ? (
                <>
                  Submit & Finish
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </>
              ) : (
                <>
                  Next Question
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Assignments List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🎯 My Assignments
          </h1>
          <p className="text-gray-700 text-lg">Let's ace these quizzes! 🚀</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              {hasAnyResponses ? (
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            {hasAnyResponses ? (
              <>
                <p className="text-gray-800 text-xl font-bold mb-2">🎉 All Caught Up!</p>
                <p className="text-gray-600">You've completed all available quizzes. Great job!</p>
              </>
            ) : user && (!user.classIds || user.classIds.length === 0) ? (
              <>
                <p className="text-gray-800 text-xl font-bold mb-2">👋 Welcome to Questify!</p>
                <p className="text-gray-600 mb-4">Your account is being set up.</p>
                <p className="text-gray-500 text-sm">Please wait for your instructor to add you to a class and assign quizzes.</p>
              </>
            ) : (
              <>
                <p className="text-gray-800 text-xl font-bold mb-2">👋 Welcome to Questify!</p>
                <p className="text-gray-600 mb-4">No assignments available at the moment.</p>
                <p className="text-gray-500 text-sm">Your instructor will assign quizzes soon. Please check back later!</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {assignments.map((assignment, idx) => (
              <div
                key={assignment.assignmentId}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-300 transform hover:-translate-y-1"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 text-white overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold">{assignment.title}</h3>
                      <span className="text-3xl">📝</span>
                    </div>
                    <p className="text-blue-50 text-sm sm:text-base flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      {assignment.className}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {assignment.description && (
                    <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">{assignment.description}</p>
                  )}

                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{assignment.questions.length}</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Total Questions</p>
                          <p className="text-sm text-gray-700 font-bold">Ready to start!</p>
                        </div>
                      </div>
                      <span className="text-3xl">🎯</span>
                    </div>
                  </div>

                  {completedAssignments.has(assignment.assignmentId) ? (
                    <div className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-center font-bold shadow-lg flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Completed! Well Done! 🎉
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(assignment)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 group"
                    >
                      <span>Start Quiz</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedQuestions;