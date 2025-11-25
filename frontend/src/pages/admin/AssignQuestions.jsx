import { useState, useEffect } from 'react'
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

  useEffect(() => {
    dispatch(getAllClasses())
    dispatch(getAllQuestions())
    dispatch(getAllAssignments())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.classId || formData.questionIds.length === 0) {
      alert('Please select a class and at least one question')
      return
    }
    await dispatch(assignQuestions(formData))
    setFormData({ classId: '', questionIds: [] })
    dispatch(getAllAssignments())
  }

  const toggleQuestion = (questionId) => {
    const questionIds = formData.questionIds.includes(questionId)
      ? formData.questionIds.filter(id => id !== questionId)
      : [...formData.questionIds, questionId]
    setFormData({ ...formData, questionIds })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assign Questions to Class</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a class</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Questions
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Loading questions...</div>
                ) : questions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No questions available</div>
                ) : (
                  questions.map((question) => (
                    <div key={question._id} className="mb-2">
                      <label className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.questionIds.includes(question._id)}
                          onChange={() => toggleQuestion(question._id)}
                          className="mt-1"
                        />
                        <span className="text-sm">{question.question}</span>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.questionIds.length} question(s)
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign Questions
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No assignments yet</div>
            ) : (
              assignments.map((assignment) => (
                <div key={assignment._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">
                    {assignment.classId?.name || 'Unknown Class'}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {assignment.questionIds?.length || 0} question(s)
                  </div>
                  <div className="text-xs text-gray-500">
                    Assigned: {new Date(assignment.assignedAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignQuestions

