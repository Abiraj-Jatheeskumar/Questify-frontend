import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Get assigned questions
export const getAssignedQuestions = createAsyncThunk(
  'student/getAssignedQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/assigned-questions')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get questions')
    }
  }
)

// Submit answer
export const submitAnswer = createAsyncThunk(
  'student/submitAnswer',
  async ({ questionId, selectedAnswer, classId, responseTime }, { rejectWithValue }) => {
    try {
      const response = await api.post('/students/submit-answer', {
        questionId,
        selectedAnswer,
        classId,
        responseTime
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit answer')
    }
  }
)

// Get my responses
export const getMyResponses = createAsyncThunk(
  'student/getMyResponses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/students/my-responses')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get responses')
    }
  }
)

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    assignedQuestions: [],
    myResponses: [],
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
      // Get assigned questions
      .addCase(getAssignedQuestions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAssignedQuestions.fulfilled, (state, action) => {
        state.loading = false
        state.assignedQuestions = action.payload
      })
      .addCase(getAssignedQuestions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.loading = false
        // Update question as answered
        const questionId = action.payload.response.questionId._id
        const index = state.assignedQuestions.findIndex(
          q => q.questionId === questionId
        )
        if (index !== -1) {
          state.assignedQuestions[index].isAnswered = true
        }
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get my responses
      .addCase(getMyResponses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getMyResponses.fulfilled, (state, action) => {
        state.loading = false
        state.myResponses = action.payload
      })
      .addCase(getMyResponses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError } = studentSlice.actions
export default studentSlice.reducer

