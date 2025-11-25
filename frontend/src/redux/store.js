import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studentReducer from './slices/studentSlice'
import adminReducer from './slices/adminSlice'
import messageReducer from './slices/messageSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    admin: adminReducer,
    messages: messageReducer
  }
})

