import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ManageStudents from './admin/ManageStudents'
import ManageClasses from './admin/ManageClasses'
import ManageQuestions from './admin/ManageQuestions'
import AssignQuestions from './admin/AssignQuestions'
import ViewResponses from './admin/ViewResponses'

const AdminDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="students" element={<ManageStudents />} />
          <Route path="classes" element={<ManageClasses />} />
          <Route path="questions" element={<ManageQuestions />} />
          <Route path="assign" element={<AssignQuestions />} />
          <Route path="responses" element={<ViewResponses />} />
          <Route path="*" element={<ManageStudents />} />
        </Routes>
      </div>
    </div>
  )
}

export default AdminDashboard

