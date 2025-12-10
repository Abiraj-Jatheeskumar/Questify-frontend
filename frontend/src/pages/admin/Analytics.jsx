import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllResponses, getAllClasses, getAllStudents, getAllQuestions } from '../../redux/slices/adminSlice';

const Analytics = () => {
  const dispatch = useDispatch();
  const { responses, classes, students, questions, loading } = useSelector((state) => state.admin);
  const [selectedClass, setSelectedClass] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    dispatch(getAllResponses({}));
    dispatch(getAllClasses());
    dispatch(getAllStudents());
    dispatch(getAllQuestions());
  }, [dispatch]);

  // Filter responses
  const filteredResponses = responses.filter(r => {
    if (selectedClass && r.classId?._id !== selectedClass) return false;
    
    if (timeRange !== 'all') {
      const responseDate = new Date(r.answeredAt);
      const now = new Date();
      const daysDiff = (now - responseDate) / (1000 * 60 * 60 * 24);
      
      if (timeRange === '7days' && daysDiff > 7) return false;
      if (timeRange === '30days' && daysDiff > 30) return false;
      if (timeRange === '90days' && daysDiff > 90) return false;
    }
    
    return true;
  });

  // Calculate statistics
  const totalResponses = filteredResponses.length;
  const correctResponses = filteredResponses.filter(r => r.isCorrect).length;
  const accuracy = totalResponses > 0 ? ((correctResponses / totalResponses) * 100).toFixed(1) : 0;
  const avgResponseTime = totalResponses > 0 
    ? (filteredResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / totalResponses / 1000).toFixed(2)
    : 0;
  const uniqueStudents = new Set(filteredResponses.map(r => r.studentId?._id)).size;

  // Question difficulty analysis
  const questionStats = {};
  filteredResponses.forEach(r => {
    const qId = r.questionId?._id;
    if (!qId) return;
    
    if (!questionStats[qId]) {
      questionStats[qId] = {
        question: r.questionId?.question || 'Unknown',
        total: 0,
        correct: 0,
        totalTime: 0
      };
    }
    questionStats[qId].total++;
    if (r.isCorrect) questionStats[qId].correct++;
    questionStats[qId].totalTime += r.responseTime || 0;
  });

  const questionDifficulty = Object.entries(questionStats).map(([id, stats]) => ({
    id,
    question: stats.question.substring(0, 50) + '...',
    accuracy: ((stats.correct / stats.total) * 100).toFixed(1),
    avgTime: (stats.totalTime / stats.total / 1000).toFixed(1),
    attempts: stats.total,
    difficulty: stats.correct / stats.total < 0.4 ? 'Hard' : 
                stats.correct / stats.total < 0.7 ? 'Medium' : 'Easy'
  })).sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));

  // Response time distribution
  const timeDistribution = {
    'Very Fast (<5s)': 0,
    'Fast (5-10s)': 0,
    'Normal (10-20s)': 0,
    'Slow (20-30s)': 0,
    'Very Slow (>30s)': 0
  };

  filteredResponses.forEach(r => {
    const timeInSeconds = (r.responseTime || 0) / 1000;
    if (timeInSeconds < 5) timeDistribution['Very Fast (<5s)']++;
    else if (timeInSeconds < 10) timeDistribution['Fast (5-10s)']++;
    else if (timeInSeconds < 20) timeDistribution['Normal (10-20s)']++;
    else if (timeInSeconds < 30) timeDistribution['Slow (20-30s)']++;
    else timeDistribution['Very Slow (>30s)']++;
  });

  // Student performance
  const studentStats = {};
  filteredResponses.forEach(r => {
    const sId = r.studentId?._id;
    if (!sId) return;
    
    if (!studentStats[sId]) {
      studentStats[sId] = {
        name: r.studentId?.name || 'Unknown',
        admissionNo: r.studentId?.admissionNo || 'N/A',
        total: 0,
        correct: 0,
        totalTime: 0
      };
    }
    studentStats[sId].total++;
    if (r.isCorrect) studentStats[sId].correct++;
    studentStats[sId].totalTime += r.responseTime || 0;
  });

  const topStudents = Object.entries(studentStats)
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      admissionNo: stats.admissionNo,
      accuracy: ((stats.correct / stats.total) * 100).toFixed(1),
      avgTime: (stats.totalTime / stats.total / 1000).toFixed(1),
      attempts: stats.total
    }))
    .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy))
    .slice(0, 10);

  // Performance over time (last 30 days)
  const dailyPerformance = {};
  filteredResponses.forEach(r => {
    const date = new Date(r.answeredAt).toLocaleDateString();
    if (!dailyPerformance[date]) {
      dailyPerformance[date] = { total: 0, correct: 0 };
    }
    dailyPerformance[date].total++;
    if (r.isCorrect) dailyPerformance[date].correct++;
  });

  const performanceTrend = Object.entries(dailyPerformance)
    .map(([date, stats]) => ({
      date,
      accuracy: ((stats.correct / stats.total) * 100).toFixed(1),
      responses: stats.total
    }))
    .slice(-30); // Last 30 days

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Filter by Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analytics...</div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{totalResponses}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Overall Accuracy</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-1 sm:mt-2">{accuracy}%</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-2 sm:p-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1 sm:mt-2">{avgResponseTime}s</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-2 sm:p-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Active Students</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">{uniqueStudents}</p>
                  </div>
                  <div className="bg-orange-100 rounded-full p-2 sm:p-3">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time Distribution */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Response Time Distribution</h2>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(timeDistribution).map(([label, count]) => {
                  const percentage = totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question Difficulty Analysis */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Question Difficulty Analysis</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Avg Time</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questionDifficulty.slice(0, 10).map((q, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-xs truncate">{q.question}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${
                            q.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
                            q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-900">{q.accuracy}%</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{q.avgTime}s</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{q.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Performing Students */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Top Performing Students</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">ID</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Avg Time</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Attempts</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-900">
                          {idx < 3 ? (
                            <span className="text-xl sm:text-2xl">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            `#${idx + 1}`
                          )}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{student.admissionNo}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-green-600">{student.accuracy}%</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{student.avgTime}s</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{student.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Trend */}
            {performanceTrend.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Performance Trend (Last 30 Days)</h2>
                <div className="space-y-3">
                  {performanceTrend.slice(-10).map((day, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{day.date}</span>
                        <span className="text-sm text-gray-600">{day.responses} responses | {day.accuracy}% accuracy</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${day.accuracy}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;

