import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../services/api'
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAllClasses
} from '../../redux/slices/adminSlice'

const ManageQuestions = () => {
  const dispatch = useDispatch()
  const { questions, classes, loading, error } = useSelector((state) => state.admin)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', '', ''],
    correctAnswer: 0,
    subject: '',
    imageUrl: '',
    classIds: []
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState(null)
  const [imageStatus, setImageStatus] = useState('')
  const [questionClassFilter, setQuestionClassFilter] = useState('')

  useEffect(() => {
    dispatch(getAllQuestions())
    dispatch(getAllClasses())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion._id, ...formData })).unwrap()
      } else {
        await dispatch(createQuestion(formData)).unwrap()
      }
      setShowModal(false)
      setEditingQuestion(null)
      setFormData({
        question: '',
        options: ['', '', '', '', ''],
        correctAnswer: 0,
        subject: '',
        imageUrl: '',
        classIds: []
      })
      setImageError(null)
      setImageStatus('')
      // Refresh the questions list
      await dispatch(getAllQuestions())
    } catch (error) {
      console.error('Error saving question:', error)
      alert('Failed to save question: ' + (error || 'Unknown error'))
    }
  }

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setFormData({
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      subject: question.subject || '',
      imageUrl: question.imageUrl || '',
      classIds: question.classIds?.map(cls => cls._id || cls) || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await dispatch(deleteQuestion(id))
      dispatch(getAllQuestions())
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingQuestion(null)
    setFormData({
      question: '',
      options: ['', '', '', '', ''],
      correctAnswer: 0,
      subject: '',
      imageUrl: '',
      classIds: []
    })
    setImageError(null)
    setImageStatus('')
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const uploadData = new FormData()
  uploadData.append('image', file)
  setUploadingImage(true)
  setImageError(null)
  try {
    const response = await api.post('/questions/upload-image', uploadData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    setFormData((prev) => ({ ...prev, imageUrl: response.data.imageUrl }))
    setImageStatus('Upload done')
  } catch (err) {
    setImageError(err.response?.data?.message || 'Failed to upload image')
    setImageStatus('')
  } finally {
    setUploadingImage(false)
  }
}

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div />
        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Class
          </label>
          <select
            value={questionClassFilter}
            onChange={(e) => setQuestionClassFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All classes</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="space-y-4">
          {questions
            .filter((question) => {
              if (!questionClassFilter) return true
              return (question.classIds || []).some((cls) => (cls._id || cls) === questionClassFilter)
            })
            .map((question) => (
            <div key={question._id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {question.question}
                  </h3>
                  {question.subject && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {question.subject}
                    </span>
                  )}
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(question)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {question.imageUrl && (
                <div className="mb-4">
                  <img
                    src={question.imageUrl}
                    alt="Question"
                    className="max-h-64 rounded border"
                  />
                </div>
              )}
              <div className="space-y-2">
                {question.classIds?.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {question.classIds.map((cls) => (
                      <span
                        key={cls._id || cls}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {cls.name || classes.find((c) => c._id === cls)?.name || 'Class'}
                      </span>
                    ))}
                  </div>
                )}
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded ${
                      index === question.correctAnswer
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    {index === question.correctAnswer && (
                      <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white my-10">
            <h3 className="text-lg font-bold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <textarea
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Image (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm text-gray-500"
                  />
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, imageUrl: '' })
                        setImageStatus('')
                      }}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {uploadingImage && <p className="text-xs text-blue-600 mt-1">Uploading image...</p>}
                {imageStatus && !uploadingImage && !imageError && (
                  <p className="text-xs text-green-600 mt-1">{imageStatus}</p>
                )}
                {imageError && <p className="text-xs text-red-600 mt-1">{imageError}</p>}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.imageUrl}
                      alt="Question preview"
                      className="max-h-48 rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="mb-2 flex items-center space-x-2">
                    <span className="font-medium w-8">{String.fromCharCode(65 + index)}.</span>
                    <input
                      type="text"
                      required
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => setFormData({ ...formData, correctAnswer: index })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-600">Correct</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageQuestions

