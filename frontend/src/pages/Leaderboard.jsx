import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import api from '../services/api'

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState([])

  const fetchLeaderboard = async (selectedClassId = '') => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/leaderboard', {
        params: selectedClassId ? { classId: selectedClassId } : {}
      })
      setLeaderboard(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes')
      setClasses(response.data)
    } catch (err) {
      console.error('Failed to load classes', err)
    }
  }

  useEffect(() => {
    fetchClasses()
    fetchLeaderboard()
  }, [])

  const handleClassChange = (e) => {
    const selectedClassId = e.target.value
    setClassId(selectedClassId)
    fetchLeaderboard(selectedClassId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-700 text-lg">Top performers of the class!</p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex justify-center">
          <div className="relative inline-block">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              Filter by Class
            </label>
            <select
              value={classId}
              onChange={handleClassChange}
              className="block w-full min-w-[200px] px-4 py-2.5 border-2 border-purple-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 transition-all duration-200 font-semibold text-sm appearance-none cursor-pointer pr-10"
            >
              <option value="">🌟 All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-purple-600 mt-7">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 p-4 shadow-lg border-2 border-red-300">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-bold text-red-800">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-gray-600 font-semibold">Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <p className="text-gray-800 text-xl font-bold mb-2">No Students Yet</p>
            <p className="text-gray-600">Complete quizzes to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 Winners - Special Cards */}
            {leaderboard.slice(0, 3).map((entry, index) => {
              const rank = index + 1;
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
              const gradientColors = rank === 1 
                ? 'from-yellow-400 via-yellow-500 to-orange-500' 
                : rank === 2 
                ? 'from-gray-300 via-gray-400 to-gray-500' 
                : 'from-orange-400 via-orange-500 to-amber-600';
              const bgGradient = rank === 1 
                ? 'from-yellow-50 to-orange-50' 
                : rank === 2 
                ? 'from-gray-50 to-slate-50' 
                : 'from-orange-50 to-amber-50';
              const accuracy = Math.round((entry.correctAnswers / entry.totalAnswers) * 100);
              
              return (
                <div
                  key={entry.studentId}
                  className={`relative bg-gradient-to-r ${bgGradient} rounded-2xl shadow-2xl p-6 border-2 ${rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-gray-400' : 'border-orange-400'} transform hover:scale-105 transition-all duration-300`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${gradientColors} rounded-full flex items-center justify-center shadow-xl border-4 border-white`}>
                    <span className="text-3xl">{medal}</span>
                  </div>
                  
                  <div className="ml-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Student Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {entry.studentName?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{entry.studentName}</h3>
                            <p className="text-sm text-gray-600">{entry.studentEmail}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg text-center min-w-[80px]">
                          <p className="text-xs text-gray-500 font-semibold uppercase">Score</p>
                          <p className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{entry.score}</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg text-center min-w-[80px]">
                          <p className="text-xs text-gray-500 font-semibold uppercase">Accuracy</p>
                          <p className="text-2xl sm:text-3xl font-black text-green-600">{accuracy}%</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-700">Correct: {entry.correctAnswers}/{entry.totalAnswers}</span>
                        <span className="text-xs font-semibold text-gray-700">Avg: {(entry.averageResponseTime / 1000).toFixed(2)}s</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full bg-gradient-to-r ${gradientColors} transition-all duration-1000 ease-out rounded-full`}
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Remaining Students - Compact Cards */}
            {leaderboard.slice(3).map((entry, index) => {
              const rank = index + 4;
              const accuracy = Math.round((entry.correctAnswers / entry.totalAnswers) * 100);
              
              return (
                <div
                  key={entry.studentId}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl p-4 sm:p-5 border border-gray-200 hover:border-purple-300 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-300">
                        <span className="text-lg sm:text-xl font-black text-gray-700">#{rank}</span>
                      </div>
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {entry.studentName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">{entry.studentName}</h4>
                          <p className="text-xs text-gray-500 truncate">{entry.studentEmail}</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 rounded-full"
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                      <div className="bg-purple-50 rounded-lg p-2 sm:p-3 text-center min-w-[60px] sm:min-w-[70px]">
                        <p className="text-xs text-purple-600 font-semibold">Score</p>
                        <p className="text-lg sm:text-xl font-black text-purple-700">{entry.score}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center min-w-[60px] sm:min-w-[70px]">
                        <p className="text-xs text-green-600 font-semibold">Accuracy</p>
                        <p className="text-lg sm:text-xl font-black text-green-700">{accuracy}%</p>
                      </div>
                      <div className="hidden sm:block bg-blue-50 rounded-lg p-2 sm:p-3 text-center min-w-[70px]">
                        <p className="text-xs text-blue-600 font-semibold">Time</p>
                        <p className="text-lg sm:text-xl font-black text-blue-700">{(entry.averageResponseTime / 1000).toFixed(1)}s</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
