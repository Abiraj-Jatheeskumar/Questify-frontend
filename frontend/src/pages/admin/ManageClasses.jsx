import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
  getAllStudents,
  removeStudentFromClass
} from '../../redux/slices/adminSlice'

const ManageClasses = () => {
  const dispatch = useDispatch()
  const { classes, students, loading, error } = useSelector((state) => state.admin)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    studentIds: []
  })
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(getAllClasses())
    dispatch(getAllStudents())
  }, [dispatch])

  useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0]._id)
    }
  }, [classes, selectedClassId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingClass) {
      await dispatch(updateClass({ id: editingClass._id, ...formData }))
    } else {
      await dispatch(createClass(formData))
    }
    setShowModal(false)
    setEditingClass(null)
    setFormData({ name: '', studentIds: [] })
    dispatch(getAllClasses())
  }

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setFormData({
      name: cls.name,
      studentIds: cls.students?.map(s => s._id) || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      await dispatch(deleteClass(id))
      dispatch(getAllClasses())
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingClass(null)
    setFormData({ name: '', studentIds: [] })
  }

  const handleClassSelect = (clsId) => {
    setSelectedClassId(clsId)
    setSearchTerm('')
  }

  const handleRemoveStudent = async (studentId) => {
    if (!selectedClassId) return
    if (window.confirm('Remove this student from the class?')) {
      await dispatch(removeStudentFromClass({ classId: selectedClassId, studentId }))
      dispatch(getAllClasses())
      dispatch(getAllStudents())
    }
  }

  const selectedClass = classes.find((cls) => cls._id === selectedClassId)
  const filteredStudents = selectedClass?.students?.filter((student) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      student.name.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    )
  }) || []

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Classes</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-sm sm:text-base w-full sm:w-auto"
          >
            + Add Class
          </button>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3">Classes</h2>
            <div className="space-y-2 max-h-[32rem] overflow-y-auto pr-2">
              {classes.length === 0 ? (
                <p className="text-sm text-gray-500">No classes yet</p>
              ) : (
                classes.map((cls) => (
                  <div
                    key={cls._id}
                    onClick={() => handleClassSelect(cls._id)}
                    className={`p-3 border rounded cursor-pointer transition ${
                      selectedClassId === cls._id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{cls.name}</p>
                        <p className="text-xs text-gray-500">
                          {cls.students?.length || 0} student(s)
                        </p>
                      </div>
                      <div className="space-x-2 text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(cls)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(cls._id)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white shadow rounded-lg p-4 sm:p-6">
            {selectedClass ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{selectedClass.name}</h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {selectedClass.students?.length || 0} student(s) enrolled
                    </p>
                  </div>
                  <div className="w-full sm:w-64">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students..."
                      className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                            {searchTerm ? 'No students match your search.' : 'No students in this class yet.'}
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                              {student.name}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {student.email}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <button
                                onClick={() => handleRemoveStudent(student._id)}
                                className="text-red-600 hover:text-red-900 font-semibold"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No students match your search.' : 'No students in this class yet.'}
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div key={student._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{student.name}</h3>
                            <p className="text-xs text-gray-500 truncate mt-1">{student.email}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveStudent(student._id)}
                            className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-semibold flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-gray-500">
                Select a class to view its students.
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-full max-w-md shadow-xl rounded-xl bg-white">
            <h3 className="text-lg sm:text-xl font-bold mb-4">
              {editingClass ? 'Edit Class' : 'Add Class'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Students
                </label>
                <select
                  multiple
                  value={formData.studentIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    setFormData({ ...formData, studentIds: selected })
                  }}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                >
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm sm:text-base w-full sm:w-auto"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default ManageClasses

