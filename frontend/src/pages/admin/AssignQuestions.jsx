import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllClasses,
  getAllQuestions,
  assignQuestions,
  getAllAssignments
} from '../../redux/slices/adminSlice'

const AssignQuestions = () => {
  const dispatch = useDispatch()
  const { classes, questions, assignments, loading, error } = useSelector((state) => state.admin)
  const [formData, setFormData] = useState({
    classId: '',
    questionIds: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [assignmentTitle, setAssignmentTitle] = useState('')
  const [showSelectAll, setShowSelectAll] = useState(false)

  useEffect(() => {
    dispatch(getAllClasses())
    dispatch(getAllQuestions())
    dispatch(getAllAssignments())
  }, [dispatch])

  // Track which questions have been used in previous quizzes for this class (for tagging only)
  const usedQuestionIds = useMemo(() => {
    if (!formData.classId) return new Set()
    const classAssignments = assignments.filter(a => a.classId?._id === formData.classId)
    const usedIds = new Set()
    classAssignments.forEach(assignment => {
      assignment.questionIds?.forEach(qId => usedIds.add(qId))
    })
    return usedIds
  }, [formData.classId, assignments])

  // Filter by search query (show all questions, no filtering by usage)
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions
    return questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [questions, searchQuery])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.classId || formData.questionIds.length === 0) {
      alert('Please select a class and at least one question')
      return
    }
    
    try {
      const assignmentData = {
        ...formData,
        title: assignmentTitle.trim() || undefined // Send title if provided
      }
      await dispatch(assignQuestions(assignmentData))
      setSuccessMessage(`✓ Successfully assigned ${formData.questionIds.length} question(s) to the class!`)
      setFormData({ classId: '', questionIds: [] })
      setSearchQuery('')
      setAssignmentTitle('')
      setShowSelectAll(false)
      dispatch(getAllAssignments())
      
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Error assigning questions:', err)
    }
  }

  const toggleQuestion = (questionId) => {
    const questionIds = formData.questionIds.includes(questionId)
      ? formData.questionIds.filter(id => id !== questionId)
      : [...formData.questionIds, questionId]
    setFormData({ ...formData, questionIds })
  }

  const toggleSelectAll = () => {
    if (showSelectAll) {
      setFormData({ ...formData, questionIds: [] })
    } else {
      setFormData({ ...formData, questionIds: filteredQuestions.map(q => q._id) })
    }
    setShowSelectAll(!showSelectAll)
  }

  const assignedCount = assignments.filter(a => a.classId?._id === formData.classId).length
  const totalQuestionsInClass = assignments
    .filter(a => a.classId?._id === formData.classId)
    .reduce((sum, a) => sum + (a.questionIds?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Create Quiz Assignment</h1>
          <p className="text-gray-600 text-lg">
            Assign questions to your class. All questions are available. Previously used questions are tagged.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 animate-pulse">
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Class Selection Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  🎯 Select Class
                </label>
                <select
                  required
                  value={formData.classId}
                  onChange={(e) => {
                    setFormData({ ...formData, classId: e.target.value })
                    setSearchQuery('')
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 text-gray-700 font-medium"
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} ({cls.students?.length || 0} students)
                    </option>
                  ))}
                </select>

                {/* Class Info Card */}
                {formData.classId && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase">Total Quizzes</p>
                        <p className="text-2xl font-bold text-blue-900">{assignedCount}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-600 uppercase">Total Questions</p>
                        <p className="text-2xl font-bold text-blue-900">{totalQuestionsInClass}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Title (Optional) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                  📌 Quiz Title (Optional)
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g., Quiz #1 - Chapter 1"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200"
                />
              </div>

              {/* Questions Selection */}
              {formData.classId && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">📚 Question Bank</h3>
                      <p className="text-sm text-gray-600">
                        {filteredQuestions.length} {searchQuery ? 'matching' : 'total'} question{filteredQuestions.length !== 1 ? 's' : ''}
                        {formData.classId && usedQuestionIds.size > 0 && (
                          <span className="ml-2 text-amber-600">
                            ({usedQuestionIds.size} previously used)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formData.questionIds.length}</p>
                      <p className="text-xs text-gray-600">selected</p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder="🔍 Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 mb-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-200"
                  />

                  {/* Select All Checkbox */}
                  {filteredQuestions.length > 0 && (
                    <div className="mb-4 pb-4 border-b-2 border-gray-200">
                      <label className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={showSelectAll}
                          onChange={toggleSelectAll}
                          className="w-5 h-5 text-blue-600 cursor-pointer"
                        />
                        <span className="font-semibold text-gray-700">
                          {showSelectAll ? 'Deselect All' : 'Select All Filtered'}
                        </span>
                      </label>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin">⏳</div>
                        <p className="text-gray-600 mt-2">Loading questions...</p>
                      </div>
                    ) : filteredQuestions.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">
                          {searchQuery ? '❌ No questions match your search' : 'No questions available'}
                        </p>
                      </div>
                    ) : (
                      filteredQuestions.map((question, index) => {
                        const isUsed = formData.classId && usedQuestionIds.has(question._id)
                        return (
                          <label
                            key={question._id}
                            className={`flex items-start space-x-3 cursor-pointer p-3 rounded-lg transition duration-200 border ${
                              isUsed 
                                ? 'border-amber-300 bg-amber-50 hover:bg-amber-100' 
                                : 'border-gray-200 hover:bg-blue-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.questionIds.includes(question._id)}
                              onChange={() => toggleQuestion(question._id)}
                              className="w-5 h-5 text-blue-600 cursor-pointer mt-1 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                                  Q{index + 1}
                                </span>
                                {isUsed && (
                                  <span className="inline-block bg-amber-200 text-amber-800 px-2 py-1 rounded text-xs font-semibold border border-amber-300">
                                    🔄 Previously Used
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900 break-words mt-1">
                                {question.question}
                              </p>
                              {question.options && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Options: {question.options.length}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!formData.classId || formData.questionIds.length === 0}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition duration-200 text-lg shadow-lg"
              >
                {formData.questionIds.length === 0
                  ? '👆 Select Questions to Continue'
                  : `✓ Assign ${formData.questionIds.length} Question${formData.questionIds.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>

          {/* Sidebar - Recent Assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Recent Assignments</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No assignments yet</p>
                </div>
              ) : (
                assignments.slice(0, 10).map((assignment, idx) => (
                  <div
                    key={assignment._id}
                    className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-blue-50 rounded transition duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">
                          Quiz #{assignment.quizNumber || idx + 1}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {assignment.classId?.name || 'Unknown Class'}
                        </p>
                        <p className="text-xs font-semibold text-blue-600 mt-1">
                          {assignment.questionIds?.length || 0} questions
                        </p>
                      </div>
                      <span className="text-xl">📌</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(assignment.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignQuestions

