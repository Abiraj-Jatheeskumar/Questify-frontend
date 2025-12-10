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
    questionId: '',
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
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleExportJSON}
              disabled={!filters.assignmentId || exporting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
            >
              {exporting ? 'Exporting...' : 'Export as JSON'}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!filters.assignmentId || exporting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
            >
              {exporting ? 'Exporting...' : 'Export as CSV'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Select an assignment to enable exports</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Assignment
              </label>
              <select
                value={filters.assignmentId}
                onChange={(e) => setFilters({ ...filters, assignmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Assignments</option>
                {assignments.map((assignment) => (
                  <option key={assignment._id} value={assignment._id}>
                    {assignment.title || 'Quiz'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Class
              </label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Student
              </label>
              <select
                value={filters.studentId}
                onChange={(e) => setFilters({ ...filters, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Question ID
              </label>
              <input
                type="text"
                value={filters.questionId}
                onChange={(e) => setFilters({ ...filters, questionId: e.target.value })}
                placeholder="Question ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
          <div className="bg-white shadow rounded-lg overflow-x-auto">
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
        )}
      </div>
    </div>
  )
}

export default ViewResponses

