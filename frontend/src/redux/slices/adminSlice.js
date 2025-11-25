import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Students
export const getAllStudents = createAsyncThunk(
  'admin/getAllStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/students')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get students')
    }
  }
)

export const createStudent = createAsyncThunk(
  'admin/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/students', studentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create student')
    }
  }
)

export const updateStudent = createAsyncThunk(
  'admin/updateStudent',
  async ({ id, ...studentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/students/${id}`, studentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update student')
    }
  }
)

export const deleteStudent = createAsyncThunk(
  'admin/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/students/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete student')
    }
  }
)

// Classes
export const getAllClasses = createAsyncThunk(
  'admin/getAllClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/classes')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get classes')
    }
  }
)

export const createClass = createAsyncThunk(
  'admin/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/classes', classData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create class')
    }
  }
)

export const updateClass = createAsyncThunk(
  'admin/updateClass',
  async ({ id, ...classData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/classes/${id}`, classData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update class')
    }
  }
)

export const deleteClass = createAsyncThunk(
  'admin/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/classes/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete class')
    }
  }
)

export const removeStudentFromClass = createAsyncThunk(
  'admin/removeStudentFromClass',
  async ({ classId, studentId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/classes/${classId}/students/${studentId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove student')
    }
  }
)

// Questions
export const getAllQuestions = createAsyncThunk(
  'admin/getAllQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/questions')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get questions')
    }
  }
)

export const createQuestion = createAsyncThunk(
  'admin/createQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/questions', questionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create question')
    }
  }
)

export const updateQuestion = createAsyncThunk(
  'admin/updateQuestion',
  async ({ id, ...questionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/questions/${id}`, questionData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update question')
    }
  }
)

export const deleteQuestion = createAsyncThunk(
  'admin/deleteQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/questions/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete question')
    }
  }
)

// Assignments
export const assignQuestions = createAsyncThunk(
  'admin/assignQuestions',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/assign-questions', assignmentData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign questions')
    }
  }
)

export const getAllAssignments = createAsyncThunk(
  'admin/getAllAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/assignments')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get assignments')
    }
  }
)

// Responses
export const getAllResponses = createAsyncThunk(
  'admin/getAllResponses',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/responses', { params: filters })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get responses')
    }
  }
)

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    students: [],
    classes: [],
    questions: [],
    assignments: [],
    responses: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Students
      .addCase(getAllStudents.fulfilled, (state, action) => {
        state.students = action.payload
      })
      .addCase(createStudent.fulfilled, (state, action) => {
        state.students.push(action.payload.student)
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex(s => s._id === action.payload._id)
        if (index !== -1) {
          state.students[index] = action.payload
        }
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(s => s._id !== action.payload)
      })
      // Classes
      .addCase(getAllClasses.fulfilled, (state, action) => {
        state.classes = action.payload
      })
      .addCase(createClass.fulfilled, (state, action) => {
        state.classes.push(action.payload)
      })
      .addCase(updateClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.classes[index] = action.payload
        }
      })
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(c => c._id !== action.payload)
      })
      .addCase(removeStudentFromClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.classes[index] = action.payload
        }
      })
      // Questions
      .addCase(getAllQuestions.fulfilled, (state, action) => {
        state.questions = action.payload
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.questions.push(action.payload)
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q._id === action.payload._id)
        if (index !== -1) {
          state.questions[index] = action.payload
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q._id !== action.payload)
      })
      // Assignments
      .addCase(getAllAssignments.fulfilled, (state, action) => {
        state.assignments = action.payload
      })
      .addCase(assignQuestions.fulfilled, (state, action) => {
        state.assignments.push(action.payload)
      })
      // Responses
      .addCase(getAllResponses.fulfilled, (state, action) => {
        state.responses = action.payload
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true
          state.error = null
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false
          state.error = action.payload
        }
      )
  }
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer

