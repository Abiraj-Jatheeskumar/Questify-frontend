import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllResponses, getAllClasses, getAllStudents } from '../../redux/slices/adminSlice'
import api from '../../services/api'

const ViewResponses = () => {
  const dispatch = useDispatch()
  const { responses, classes, students, loading, error } = useSelector((state) => state.admin)
  const [filters, setFilters] = useState({
    classId: '',
    studentId: '',
    assignmentId: ''
  })
  const [assignments, setAssignments] = useState([])
  const [exporting, setExporting] = useState(false)
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const [nonParticipants, setNonParticipants] = useState({})
  const [loadingNonParticipants, setLoadingNonParticipants] = useState({})
  const [liveProgress, setLiveProgress] = useState({})
  const [loadingLiveProgress, setLoadingLiveProgress] = useState({})
  const [autoRefresh, setAutoRefresh] = useState({})

  useEffect(() => {
    dispatch(getAllClasses())
    dispatch(getAllStudents())
    dispatch(getAllResponses({}))
    fetchAssignments()
  }, [dispatch])

  useEffect(() => {
    dispatch(getAllResponses(filters))
  }, [dispatch, filters])

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assignments')
      setAssignments(response.data)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    }
  }

  const fetchNonParticipants = async (assignmentId) => {
    try {
      setLoadingNonParticipants(prev => ({ ...prev, [assignmentId]: true }))
      const response = await api.get(`/admin/assignments/${assignmentId}/non-participants`)
      setNonParticipants(prev => ({ ...prev, [assignmentId]: response.data }))
    } catch (error) {
      console.error('Failed to fetch non-participants:', error)
      alert('Failed to load non-participating students')
    } finally {
      setLoadingNonParticipants(prev => ({ ...prev, [assignmentId]: false }))
    }
  }

  const handleExportNonParticipantsCSV = async (assignmentId) => {
    try {
      const response = await api.get(`/admin/assignments/${assignmentId}/non-participants/csv`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `non_participants_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export CSV. Please try again.')
    }
  }

  const handleExportNonParticipantsPDF = async (assignmentId) => {
    try {
      const response = await api.get(`/admin/assignments/${assignmentId}/non-participants/pdf`)
      
      // Open in new window to allow browser's print-to-PDF
      const printWindow = window.open('', '_blank')
      printWindow.document.write(response.data)
      printWindow.document.close()
      
      // Wait a bit for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (error) {
      console.error('Export PDF failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const handleExportNonParticipantsPDFSimple = async (assignmentId) => {
    try {
      const response = await api.get(`/admin/assignments/${assignmentId}/non-participants/pdf-simple`)
      
      // Open in new window to allow browser's print-to-PDF
      const printWindow = window.open('', '_blank')
      printWindow.document.write(response.data)
      printWindow.document.close()
      
      // Wait a bit for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } catch (error) {
      console.error('Export PDF failed:', error)
      alert('Failed to export PDF. Please try again.')
    }
  }

  const fetchLiveProgress = async (assignmentId) => {
    try {
      setLoadingLiveProgress(prev => ({ ...prev, [assignmentId]: true }))
      const response = await api.get(`/admin/assignments/${assignmentId}/live-progress`)
      setLiveProgress(prev => ({ ...prev, [assignmentId]: response.data }))
    } catch (error) {
      console.error('Failed to fetch live progress:', error)
      alert('Failed to load live progress')
    } finally {
      setLoadingLiveProgress(prev => ({ ...prev, [assignmentId]: false }))
    }
  }

  const toggleAutoRefresh = (assignmentId) => {
    setAutoRefresh(prev => {
      const newState = { ...prev, [assignmentId]: !prev[assignmentId] }
      
      // If enabling, start fetching immediately
      if (newState[assignmentId]) {
        fetchLiveProgress(assignmentId)
      }
      
      return newState
    })
  }

  // Auto-refresh effect for live progress
  useEffect(() => {
    const intervals = {}
    
    Object.keys(autoRefresh).forEach(assignmentId => {
      if (autoRefresh[assignmentId]) {
        // Refresh every 30 seconds
        intervals[assignmentId] = setInterval(() => {
          fetchLiveProgress(assignmentId)
        }, 30000)
      }
    })
    
    // Cleanup
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval))
    }
  }, [autoRefresh])

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A'
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const handleExportJSON = async () => {
    try {
      setExporting(true)
      const queryParams = new URLSearchParams(filters).toString()
      const response = await api.get(
        `/responses/export/json/${filters.assignmentId}${queryParams ? '?' + queryParams : ''}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quiz_responses_${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export JSON error:', error)
      alert(error.response?.data?.message || 'Failed to export JSON')
    } finally {
      setExporting(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const queryParams = new URLSearchParams(filters).toString()
      const response = await api.get(
        `/responses/export/csv/${filters.assignmentId}${queryParams ? '?' + queryParams : ''}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `quiz_responses_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export CSV error:', error)
      alert(error.response?.data?.message || 'Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const handleExportEdNetBasic = async () => {
    try {
      setExporting(true)
      const queryParams = new URLSearchParams(filters).toString()
      const response = await api.get(
        `/responses/export/ednet-basic/${filters.assignmentId}${queryParams ? '?' + queryParams : ''}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ednet_basic_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export EdNet Basic error:', error)
      alert(error.response?.data?.message || 'Failed to export EdNet Basic format')
    } finally {
      setExporting(false)
    }
  }

  const handleExportEdNetExtended = async () => {
    try {
      setExporting(true)
      const queryParams = new URLSearchParams(filters).toString()
      const response = await api.get(
        `/responses/export/ednet/${filters.assignmentId}${queryParams ? '?' + queryParams : ''}`,
        { responseType: 'blob' }
      )
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ednet_extended_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export EdNet Extended error:', error)
      alert(error.response?.data?.message || 'Failed to export EdNet Extended format')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAllBasic = async () => {
    try {
      setExporting(true)
      const response = await api.get('/responses/export/ednet-basic-all', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ednet_basic_all_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export All Basic error:', error)
      alert(error.response?.data?.message || 'Failed to export all data')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAllExtended = async () => {
    try {
      setExporting(true)
      const response = await api.get('/responses/export/ednet-all', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ednet_extended_all_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export All Extended error:', error)
      alert(error.response?.data?.message || 'Failed to export all data')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAllJSON = async () => {
    try {
      setExporting(true)
      const response = await api.get('/responses/export/json-all', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `all_responses_${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export All JSON error:', error)
      alert(error.response?.data?.message || 'Failed to export all data')
    } finally {
      setExporting(false)
    }
  }

  const handleExportAllCSV = async () => {
    try {
      setExporting(true)
      const response = await api.get('/responses/export/csv-all', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `all_responses_detailed_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export All CSV error:', error)
      alert(error.response?.data?.message || 'Failed to export all data')
    } finally {
      setExporting(false)
    }
  }

  const calculateAverageResponseTime = () => {
    if (responses.length === 0) return 0
    const total = responses.reduce((sum, r) => sum + (r.responseTime || 0), 0)
    const avgMs = total / responses.length
    return (avgMs / 1000).toFixed(2) // Convert milliseconds to seconds
  }

  const calculateAccuracy = () => {
    if (responses.length === 0) return 0
    const correct = responses.filter(r => r.isCorrect).length
    return Math.round((correct / responses.length) * 100)
  }

  // Group responses by quiz/assignment
  const groupResponsesByQuiz = () => {
    const grouped = {}
    responses.forEach(response => {
      const quizId = response.assignedQuestionId?._id || response.assignedQuestionId || 'unassigned'
      const quizTitle = response.assignedQuestionId?.title || 'Unassigned Quiz'
      const quizNumber = response.assignedQuestionId?.quizNumber || null
      
      if (!grouped[quizId]) {
        grouped[quizId] = {
          id: quizId,
          title: quizTitle,
          quizNumber: quizNumber,
          responses: [],
          questionIds: new Set(),
          studentIds: new Set()
        }
      }
      grouped[quizId].responses.push(response)
      if (response.questionId?._id) {
        grouped[quizId].questionIds.add(response.questionId._id.toString())
      }
      if (response.studentId?._id) {
        grouped[quizId].studentIds.add(response.studentId._id.toString())
      }
    })
    return Object.values(grouped)
  }

  // Calculate detailed analytics for a specific quiz
  const calculateDetailedQuizAnalytics = (quiz, assignment) => {
    if (quiz.responses.length === 0) {
      return {
        totalQuestions: assignment?.questionIds?.length || 0,
        totalResponses: 0,
        totalStudents: 0,
        completionRate: 0,
        accuracy: 0,
        avgResponseTime: 0,
        avgQuizTime: 0,
        correctCount: 0,
        incorrectCount: 0,
        questionStats: [],
        studentQuizTimes: []
      }
    }

    const totalQuestions = assignment?.questionIds?.length || quiz.questionIds.size
    const totalStudents = quiz.studentIds.size
    const totalResponses = quiz.responses.length
    const expectedResponses = totalQuestions * totalStudents
    const completionRate = expectedResponses > 0 
      ? Math.round((totalResponses / expectedResponses) * 100) 
      : 0

    const correct = quiz.responses.filter(r => r.isCorrect).length
    const accuracy = Math.round((correct / totalResponses) * 100)
    
    // Calculate average response time per question (convert ms to seconds)
    const totalTime = quiz.responses.reduce((sum, r) => sum + ((r.responseTime || 0) / 1000), 0)
    const avgTime = totalTime > 0 ? (totalTime / totalResponses).toFixed(2) : 0

    // Calculate total quiz time per student (from first to last question)
    const studentQuizTimesMap = {}
    quiz.responses.forEach(response => {
      const studentId = response.studentId?._id?.toString() || 'unknown'
      const answeredAt = new Date(response.answeredAt).getTime()
      
      if (!studentQuizTimesMap[studentId]) {
        studentQuizTimesMap[studentId] = {
          studentId: studentId,
          studentName: response.studentId?.name || 'Unknown',
          firstAnswerTime: answeredAt,
          lastAnswerTime: answeredAt,
          questionCount: 0
        }
      }
      
      studentQuizTimesMap[studentId].firstAnswerTime = Math.min(
        studentQuizTimesMap[studentId].firstAnswerTime,
        answeredAt
      )
      studentQuizTimesMap[studentId].lastAnswerTime = Math.max(
        studentQuizTimesMap[studentId].lastAnswerTime,
        answeredAt
      )
      studentQuizTimesMap[studentId].questionCount++
    })

    // Convert to array and calculate total quiz time for each student
    const studentQuizTimes = Object.values(studentQuizTimesMap).map(student => {
      const totalQuizTimeMs = student.lastAnswerTime - student.firstAnswerTime
      const totalQuizTimeSec = (totalQuizTimeMs / 1000).toFixed(2)
      return {
        ...student,
        totalQuizTimeMs,
        totalQuizTimeSec: parseFloat(totalQuizTimeSec),
        formattedTime: formatQuizTime(totalQuizTimeMs)
      }
    })

    // Calculate average quiz completion time across all students
    const totalQuizTimeSum = studentQuizTimes.reduce((sum, s) => sum + s.totalQuizTimeSec, 0)
    const avgQuizTime = studentQuizTimes.length > 0 
      ? (totalQuizTimeSum / studentQuizTimes.length).toFixed(2) 
      : 0

    // Per-question statistics
    const questionStatsMap = {}
    quiz.responses.forEach(response => {
      const qId = response.questionId?._id?.toString() || 'unknown'
      const questionText = response.questionId?.question || 'Unknown Question'
      
      if (!questionStatsMap[qId]) {
        questionStatsMap[qId] = {
          questionId: qId,
          questionText: questionText,
          totalResponses: 0,
          correctResponses: 0,
          incorrectResponses: 0,
          totalTime: 0,
          answerDistribution: { 0: 0, 1: 0, 2: 0, 3: 0 }
        }
      }
      
      questionStatsMap[qId].totalResponses++
      if (response.isCorrect) {
        questionStatsMap[qId].correctResponses++
      } else {
        questionStatsMap[qId].incorrectResponses++
      }
      questionStatsMap[qId].totalTime += (response.responseTime || 0) / 1000
      questionStatsMap[qId].answerDistribution[response.selectedAnswer] = 
        (questionStatsMap[qId].answerDistribution[response.selectedAnswer] || 0) + 1
    })

    // Convert to array and calculate percentages
    const questionStats = Object.values(questionStatsMap).map(stat => ({
      ...stat,
      accuracy: stat.totalResponses > 0 
        ? Math.round((stat.correctResponses / stat.totalResponses) * 100) 
        : 0,
      avgTime: stat.totalResponses > 0 
        ? (stat.totalTime / stat.totalResponses).toFixed(2) 
        : 0,
      difficulty: stat.totalResponses > 0 
        ? (stat.correctResponses / stat.totalResponses >= 0.7 ? 'Easy' :
           stat.correctResponses / stat.totalResponses >= 0.4 ? 'Medium' : 'Hard')
        : 'Unknown'
    })).sort((a, b) => a.accuracy - b.accuracy) // Sort by difficulty (hardest first)

    return {
      totalQuestions,
      totalResponses,
      totalStudents,
      completionRate,
      accuracy,
      avgResponseTime: avgTime,
      avgQuizTime: avgQuizTime,
      correctCount: correct,
      incorrectCount: totalResponses - correct,
      questionStats,
      studentQuizTimes: studentQuizTimes.sort((a, b) => a.totalQuizTimeSec - b.totalQuizTimeSec)
    }
  }

  // Format quiz time for display
  const formatQuizTime = (ms) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  const quizGroups = groupResponsesByQuiz()

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">View Responses</h1>
          <p className="text-gray-600">View and manage student responses</p>
        </div>

        {/* Detailed Quiz-Wise Analytics */}
        {quizGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Detailed Quiz Analytics (Research Data)</h2>
            <div className="space-y-6">
              {quizGroups.map((quiz) => {
                const assignment = assignments.find(a => a._id === quiz.id)
                const analytics = calculateDetailedQuizAnalytics(quiz, assignment)
                const isExpanded = expandedQuiz === quiz.id
                
                return (
                  <div key={quiz.id} className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 overflow-hidden">
                    {/* Quiz Header */}
                    <div 
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {quiz.quizNumber ? `Quiz #${quiz.quizNumber}: ` : ''}{quiz.title}
                          </h3>
                          {assignment?.classId && (
                            <p className="text-sm text-gray-600">Class: {assignment.classId.name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                            {analytics.totalQuestions} Questions
                          </span>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Students</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Responses</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalResponses}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Completion</p>
                          <p className="text-2xl font-bold text-blue-600">{analytics.completionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Accuracy</p>
                          <p className={`text-2xl font-bold ${
                            analytics.accuracy >= 80 ? 'text-green-600' :
                            analytics.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {analytics.accuracy}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Avg Question Time</p>
                          <p className="text-2xl font-bold text-purple-600">{analytics.avgResponseTime}s</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 text-xs font-semibold uppercase mb-1">Avg Quiz Time</p>
                          <p className="text-2xl font-bold text-indigo-600">{analytics.avgQuizTime}s</p>
                          <p className="text-xs text-gray-500 mt-1">per student</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detailed View */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-6">
                        {/* Live Progress Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-900">📊 Live Quiz Progress</h4>
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleAutoRefresh(quiz.id)}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2 ${
                                  autoRefresh[quiz.id]
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                              >
                                {autoRefresh[quiz.id] ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Auto-Refresh ON
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Auto-Refresh OFF
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => fetchLiveProgress(quiz.id)}
                                disabled={loadingLiveProgress[quiz.id]}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                              >
                                {loadingLiveProgress[quiz.id] ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                    </svg>
                                    Refresh Now
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {liveProgress[quiz.id] && (
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                              {/* Summary Cards */}
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">Not Started</p>
                                  <p className="text-2xl font-bold text-gray-600">{liveProgress[quiz.id].summary.notStarted}</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">In Progress</p>
                                  <p className="text-2xl font-bold text-yellow-600">{liveProgress[quiz.id].summary.inProgress}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">Completed</p>
                                  <p className="text-2xl font-bold text-green-600">{liveProgress[quiz.id].summary.completed}</p>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-500 mb-4">Last updated: {formatTimeAgo(liveProgress[quiz.id].lastUpdated)}</p>
                              
                              {/* In Progress Students */}
                              {liveProgress[quiz.id].inProgress.length > 0 && (
                                <div className="mb-4">
                                  <h5 className="text-sm font-bold text-gray-900 mb-3">🔄 Students Currently Taking Quiz:</h5>
                                  <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3 space-y-2">
                                    {liveProgress[quiz.id].inProgress.map((student) => (
                                      <div key={student._id} className={`bg-white p-3 rounded-lg border-2 transition-colors ${
                                        student.status === 'active' ? 'border-green-400' :
                                        student.status === 'slow' ? 'border-yellow-400' : 'border-red-400'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3 flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                                              student.status === 'active' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                                              student.status === 'slow' ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                                              'bg-gradient-to-br from-red-500 to-pink-500'
                                            }`}>
                                              {student.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                                              <p className="text-xs text-gray-500">
                                                {student.admissionNo && `ID: ${student.admissionNo} • `}
                                                Last active: {formatTimeAgo(student.lastActivityAt)}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="text-right">
                                              <p className="text-sm font-bold text-gray-900">
                                                Q{student.currentQuestionIndex + 1}/{student.totalQuestions}
                                              </p>
                                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                                <div
                                                  className={`h-2 rounded-full transition-all ${
                                                    student.status === 'active' ? 'bg-green-600' :
                                                    student.status === 'slow' ? 'bg-yellow-600' : 'bg-red-600'
                                                  }`}
                                                  style={{ width: `${student.progress}%` }}
                                                ></div>
                                              </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                              student.status === 'active' ? 'bg-green-100 text-green-800' :
                                              student.status === 'slow' ? 'bg-yellow-100 text-yellow-800' :
                                              'bg-red-100 text-red-800'
                                            }`}>
                                              {student.status === 'active' ? '🟢 Active' :
                                               student.status === 'slow' ? '🟡 Slow' : '🔴 Idle'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Completed Students */}
                              {liveProgress[quiz.id].completed.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 mb-3">✅ Completed ({liveProgress[quiz.id].completed.length}):</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {liveProgress[quiz.id].completed.map((student) => (
                                      <div key={student._id} className="bg-green-50 p-2 rounded border border-green-200 text-center">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                                        <p className="text-xs text-green-600 font-semibold mt-1">
                                          ⏱️ {Math.floor(student.timeTaken / 60)}:{(student.timeTaken % 60).toString().padStart(2, '0')}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Non-Participating Students Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-900">👥 Student Participation</h4>
                            <button
                              onClick={() => fetchNonParticipants(quiz.id)}
                              disabled={loadingNonParticipants[quiz.id]}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                            >
                              {loadingNonParticipants[quiz.id] ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                  </svg>
                                  Show Non-Participants
                                </>
                              )}
                            </button>
                          </div>
                          
                          {nonParticipants[quiz.id] && (
                            <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                              <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">Total Students</p>
                                  <p className="text-2xl font-bold text-blue-600">{nonParticipants[quiz.id].totalStudents}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">Participated</p>
                                  <p className="text-2xl font-bold text-green-600">{nonParticipants[quiz.id].participated}</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                  <p className="text-sm text-gray-600 font-semibold">Not Participated</p>
                                  <p className="text-2xl font-bold text-orange-600">{nonParticipants[quiz.id].notParticipated}</p>
                                </div>
                              </div>
                              
                              {nonParticipants[quiz.id].notParticipated > 0 && (
                                <div className="flex gap-2 mb-4 justify-end">
                                  <button
                                    onClick={() => handleExportNonParticipantsCSV(quiz.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    Export CSV
                                  </button>
                                  <button
                                    onClick={() => handleExportNonParticipantsPDF(quiz.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    </svg>
                                    Export PDF
                                  </button>
                                  <button
                                    onClick={() => handleExportNonParticipantsPDFSimple(quiz.id)}
                                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                    </svg>
                                    Export PDF (Name & ID Only)
                                  </button>
                                </div>
                              )}
                              
                              {nonParticipants[quiz.id].notParticipated > 0 ? (
                                <div>
                                  <h5 className="text-sm font-bold text-gray-900 mb-3">🚫 Students Who Haven't Attempted This Quiz:</h5>
                                  <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {nonParticipants[quiz.id].nonParticipants.map((student) => (
                                        <div key={student._id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-orange-400 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                              {student.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
                                              <p className="text-xs text-gray-500 truncate">{student.email}</p>
                                              {student.admissionNo && (
                                                <p className="text-xs text-gray-600 font-medium mt-1">
                                                  ID: {student.admissionNo}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6">
                                  <svg className="w-16 h-16 mx-auto text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                  </svg>
                                  <p className="text-green-600 font-bold">✅ All students have attempted this quiz!</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Overall Quiz Summary */}
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">📈 Quiz Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-gray-600 text-xs font-semibold mb-1">Total Questions</p>
                              <p className="text-2xl font-bold text-gray-900">{analytics.totalQuestions}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-gray-600 text-xs font-semibold mb-1">Correct Answers</p>
                              <p className="text-2xl font-bold text-green-600">{analytics.correctCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-gray-600 text-xs font-semibold mb-1">Incorrect Answers</p>
                              <p className="text-2xl font-bold text-red-600">{analytics.incorrectCount}</p>
                            </div>
                            <div className="bg-white p-4 rounded-lg">
                              <p className="text-gray-600 text-xs font-semibold mb-1">Completion Rate</p>
                              <p className="text-2xl font-bold text-blue-600">{analytics.completionRate}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Student Quiz Times */}
                        {analytics.studentQuizTimes.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-3">⏱️ Student Quiz Completion Times</h4>
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Average Quiz Time</p>
                                  <p className="text-2xl font-bold text-indigo-600">{analytics.avgQuizTime} seconds</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    ({formatQuizTime(analytics.avgQuizTime * 1000)})
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Fastest Completion</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {analytics.studentQuizTimes[0]?.formattedTime || 'N/A'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {analytics.studentQuizTimes[0]?.studentName || ''}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Student</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Questions</th>
                                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Total Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {analytics.studentQuizTimes.map((student, idx) => (
                                      <tr key={student.studentId} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-gray-900">{student.studentName}</td>
                                        <td className="px-3 py-2 text-gray-600">{student.questionCount}/{analytics.totalQuestions}</td>
                                        <td className="px-3 py-2 font-semibold text-gray-900">{student.formattedTime}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Per-Question Statistics with Individual Response Times */}
                        {analytics.questionStats.length > 0 && (
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-3">📋 Per-Question Analysis (Individual Question Response Times)</h4>
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {analytics.questionStats.map((qStat, index) => {
                                // Get all individual response times for this question
                                const questionResponses = quiz.responses.filter(
                                  r => r.questionId?._id?.toString() === qStat.questionId
                                )
                                const individualTimes = questionResponses.map(r => ({
                                  studentName: r.studentId?.name || 'Unknown',
                                  responseTime: (r.responseTime || 0) / 1000, // Convert ms to seconds
                                  isCorrect: r.isCorrect,
                                  answeredAt: r.answeredAt
                                })).sort((a, b) => a.responseTime - b.responseTime) // Sort by time (fastest first)
                                
                                return (
                                  <div key={qStat.questionId} className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900 mb-2">
                                          Q{index + 1}: {qStat.questionText.length > 100 
                                            ? qStat.questionText.substring(0, 100) + '...' 
                                            : qStat.questionText}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            qStat.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                            qStat.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {qStat.difficulty}
                                          </span>
                                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                            {qStat.accuracy}% Correct
                                          </span>
                                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                            Avg: {qStat.avgTime}s
                                          </span>
                                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold">
                                            Fastest: {individualTimes[0]?.responseTime.toFixed(2) || 0}s
                                          </span>
                                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                                            Slowest: {individualTimes[individualTimes.length - 1]?.responseTime.toFixed(2) || 0}s
                                          </span>
                                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">
                                            {qStat.totalResponses} responses
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Individual Student Response Times for This Question */}
                                    <div className="mt-4 pt-3 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-700 mb-2">⏱️ Individual Response Times (per student for this question):</p>
                                      <div className="max-h-48 overflow-y-auto bg-gray-50 rounded p-2">
                                        <table className="w-full text-xs">
                                          <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Student</th>
                                              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Time</th>
                                              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200">
                                            {individualTimes.map((time, idx) => (
                                              <tr key={idx} className="hover:bg-white">
                                                <td className="px-2 py-1 text-gray-900">{time.studentName}</td>
                                                <td className="px-2 py-1 font-semibold text-gray-900">{time.responseTime.toFixed(2)}s</td>
                                                <td className="px-2 py-1">
                                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                    time.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                  }`}>
                                                    {time.isCorrect ? '✓' : '✗'}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    
                                    {/* Answer Distribution */}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-700 mb-2">Answer Distribution:</p>
                                      <div className="grid grid-cols-4 gap-2">
                                        {[0, 1, 2, 3].map(opt => {
                                          const count = qStat.answerDistribution[opt] || 0
                                          const percentage = qStat.totalResponses > 0 
                                            ? Math.round((count / qStat.totalResponses) * 100) 
                                            : 0
                                          return (
                                            <div key={opt} className="text-center bg-gray-50 p-2 rounded">
                                              <p className="text-xs text-gray-600 font-semibold">Option {String.fromCharCode(65 + opt)}</p>
                                              <p className="text-sm font-bold text-gray-900">{count}</p>
                                              <p className="text-xs text-gray-500">{percentage}%</p>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Overall Stats Cards */}
        {responses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold uppercase">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{responses.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold uppercase">Overall Accuracy</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{calculateAccuracy()}%</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold uppercase">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{calculateAverageResponseTime()}s</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
          
          {/* Per-Assignment Exports */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Selected Assignment:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={handleExportJSON}
                disabled={!filters.assignmentId || exporting}
                className="px-2 py-2 sm:px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : 'JSON'}
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!filters.assignmentId || exporting}
                className="px-2 py-2 sm:px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : 'CSV'}
              </button>
              <button
                onClick={handleExportEdNetBasic}
                disabled={!filters.assignmentId || exporting}
                className="px-2 py-2 sm:px-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : 'EdNet Basic'}
              </button>
              <button
                onClick={handleExportEdNetExtended}
                disabled={!filters.assignmentId || exporting}
                className="px-2 py-2 sm:px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : 'EdNet Extended'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Select an assignment above to export that quiz's data</p>
          </div>

          {/* Export ALL Data */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Export ALL Responses (All Quizzes):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <button
                onClick={handleExportAllJSON}
                disabled={exporting}
                className="px-2 py-2 sm:px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : '📥 All JSON'}
              </button>
              <button
                onClick={handleExportAllCSV}
                disabled={exporting}
                className="px-2 py-2 sm:px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : '📥 All CSV'}
              </button>
              <button
                onClick={handleExportAllBasic}
                disabled={exporting}
                className="px-2 py-2 sm:px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : '📥 EdNet Basic'}
              </button>
              <button
                onClick={handleExportAllExtended}
                disabled={exporting}
                className="px-2 py-2 sm:px-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold text-xs sm:text-sm"
              >
                {exporting ? 'Wait...' : '📥 EdNet Extended'}
              </button>
            </div>
            <p className="text-xs text-orange-600 mt-2 font-medium">⚠️ These export ALL responses from ALL quizzes</p>
          </div>

          <div className="mt-3 text-xs text-gray-600 space-y-1 border-t pt-3 hidden sm:block">
            <p>• <strong>EdNet Basic:</strong> timestamp,solving_id,question_id,user_answer,elapsed_time</p>
            <p>• <strong>EdNet Extended:</strong> + correct_answer & is_correct for accuracy analysis</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter by Assignment
              </label>
              <select
                value={filters.assignmentId}
                onChange={(e) => setFilters({ ...filters, assignmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Assignments</option>
                {assignments.map((assignment) => {
                  const displayTitle = assignment.title && assignment.title !== 'Quiz' 
                    ? assignment.title 
                    : `Quiz #${assignment.quizNumber || '?'}`;
                  const date = new Date(assignment.assignedAt).toLocaleDateString();
                  return (
                    <option key={assignment._id} value={assignment._id}>
                      {displayTitle} ({date})
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter by Class
              </label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter by Student
              </label>
              <select
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading responses...</p>
            </div>
          </div>
        ) : responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">No responses found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Answer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Response Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {response.studentId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {response.questionId?.question || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {response.classId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String.fromCharCode(65 + response.selectedAnswer)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          response.isCorrect
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {response.isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(response.responseTime / 1000).toFixed(2)}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(response.answeredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {responses.map((response) => (
              <div key={response._id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{response.studentId?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{response.classId?.name || 'N/A'}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      response.isCorrect
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {response.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Question:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{response.questionId?.question || 'N/A'}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Answer</p>
                      <p className="text-sm font-semibold text-gray-900">{String.fromCharCode(65 + response.selectedAnswer)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Time</p>
                      <p className="text-sm font-semibold text-blue-600">{(response.responseTime / 1000).toFixed(2)}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(response.answeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
        )}
      </div>
    </div>
  )
}

export default ViewResponses

