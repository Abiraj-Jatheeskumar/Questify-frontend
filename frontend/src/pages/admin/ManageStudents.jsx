import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllClasses
} from '../../redux/slices/adminSlice'
import api from '../../services/api'

const ManageStudents = () => {
  const dispatch = useDispatch()
  const { students, classes, loading, error } = useSelector((state) => state.admin)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    admissionNo: '',
    classIds: []
  })

  useEffect(() => {
    dispatch(getAllStudents())
    dispatch(getAllClasses())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingStudent) {
      await dispatch(updateStudent({ id: editingStudent._id, ...formData }))
    } else {
      await dispatch(createStudent(formData))
    }
    setShowModal(false)
    setEditingStudent(null)
    setFormData({ name: '', email: '', admissionNo: '', classIds: [] })
    dispatch(getAllStudents())
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      email: student.email,
      admissionNo: student.admissionNo || '',
      classIds: student.classIds.map(c => c._id || c)
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      await dispatch(deleteStudent(id))
      dispatch(getAllStudents())
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingStudent(null)
    setFormData({ name: '', email: '', admissionNo: '', classIds: [] })
  }

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/admin/export-students-csv', {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export students. Please try again.')
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await api.get('/admin/export-students-pdf')
      
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

  const handleExportCSVNoEmail = async () => {
    try {
      const response = await api.get('/admin/export-students-csv-no-email', {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_no_email_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export students. Please try again.')
    }
  }

  const handleExportPDFNoEmail = async () => {
    try {
      const response = await api.get('/admin/export-students-pdf-no-email')
      
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

  const handleExportCSVMasked = async () => {
    try {
      const response = await api.get('/admin/export-students-csv-masked', {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `students_masked_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export students. Please try again.')
    }
  }

  const handleExportPDFMasked = async () => {
    try {
      const response = await api.get('/admin/export-students-pdf-masked')
      
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

  // Filter students based on search term
  const filteredStudents = students.filter(student => {
    if (!searchTerm.trim()) return true
    
    const search = searchTerm.toLowerCase()
    const name = (student.name || '').toLowerCase()
    const email = (student.email || '').toLowerCase()
    const admissionNo = (student.admissionNo || '').toLowerCase()
    
    return name.includes(search) || email.includes(search) || admissionNo.includes(search)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
              👥 Manage Students
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">View and manage all student accounts</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export with Full Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export with Full Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                  PDF
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSVMasked}
                  className="px-3 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export with Masked Email (sa**14@gmail.com)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  CSV (Masked)
                </button>
                <button
                  onClick={handleExportPDFMasked}
                  className="px-3 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export with Masked Email (sa**14@gmail.com)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  PDF (Masked)
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSVNoEmail}
                  className="px-3 py-2 bg-gradient-to-r from-gray-600 to-slate-600 text-white rounded-lg hover:from-gray-700 hover:to-slate-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export without Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  CSV (No Email)
                </button>
                <button
                  onClick={handleExportPDFNoEmail}
                  className="px-3 py-2 bg-gradient-to-r from-stone-600 to-zinc-600 text-white rounded-lg hover:from-stone-700 hover:to-zinc-700 transition-all duration-300 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-1"
                  title="Export without Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                  </svg>
                  PDF (No Email)
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Add Student
            </button>
          </div>
        </div>

      {/* Search Filter */}
      <div className="mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm transition-all duration-200"
            >
              Clear
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredStudents.length} of {students.length} students
          </p>
        )}
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
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
                <tr>
                  <th className="w-1/5 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      Name
                    </div>
                  </th>
                  <th className="w-1/6 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"/>
                      </svg>
                      Admission No
                    </div>
                  </th>
                  <th className="w-1/4 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Email
                    </div>
                  </th>
                  <th className="w-1/6 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                      </svg>
                      Classes
                    </div>
                  </th>
                  <th className="w-1/5 px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <p className="text-gray-500 font-semibold text-lg">No students found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search terms' : 'Add students to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {student.admissionNo ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 whitespace-nowrap">
                          {student.admissionNo}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="truncate max-w-xs" title={student.email}>
                        {student.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {student.classIds?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {student.classIds.slice(0, 2).map((c, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                              {c.name || 'N/A'}
                            </span>
                          ))}
                          {student.classIds.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                              +{student.classIds.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm shadow-sm hover:shadow-md"
                          title="Edit student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap text-sm shadow-sm hover:shadow-md"
                          title="Delete student"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredStudents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <p className="text-gray-500 font-semibold text-lg">No students found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : 'Add students to get started'}
                </p>
              </div>
            ) : filteredStudents.map((student) => (
              <div key={student._id} className="bg-white rounded-xl shadow-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base truncate">{student.name}</h3>
                      <p className="text-xs text-gray-500 truncate mt-1">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(student)}
                      className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Del
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Admission Number</p>
                    {student.admissionNo ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        {student.admissionNo}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Not Set</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Classes</p>
                    {student.classIds?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.classIds.map((c, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                            {c.name || 'N/A'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-6 border w-full max-w-md shadow-xl rounded-xl bg-white">
            <h3 className="text-lg sm:text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add Student'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Name
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
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {editingStudent && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Email can be updated if incorrect
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                  placeholder="e.g., AI2024015"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Student's ID card number (required)</p>
              </div>
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Classes
                </label>
                <select
                  multiple
                  value={formData.classIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    setFormData({ ...formData, classIds: selected })
                  }}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                >
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
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
                  {editingStudent ? 'Update' : 'Create'}
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

export default ManageStudents


