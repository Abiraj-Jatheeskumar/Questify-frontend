import { Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AssignedQuestions from './student/AssignedQuestions'
import MyResponses from './student/MyResponses'

const StudentDashboard = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="dashboard" element={<AssignedQuestions />} />
          <Route path="responses" element={<MyResponses />} />
          <Route path="*" element={<AssignedQuestions />} />
        </Routes>
      </div>
    </div>
  )
}

export default StudentDashboard

