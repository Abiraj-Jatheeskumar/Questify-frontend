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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">View Responses</h1>
          <p className="text-gray-600">View and manage student responses</p>
        </div>

        {/* Stats Cards */}
        {responses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{responses.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Accuracy</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{calculateAccuracy()}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm font-semibold uppercase">Avg Response Time</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{calculateAverageResponseTime()}s</p>
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

