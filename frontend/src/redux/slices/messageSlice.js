import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/messages'

// Async thunks
export const getMessages = createAsyncThunk(
    'messages/getMessages',
    async (_, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState()
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            }
            const response = await axios.get(API_URL, config)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)

export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async (messageData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState()
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            }
            const response = await axios.post(API_URL, messageData, config)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)

export const markAsRead = createAsyncThunk(
    'messages/markAsRead',
    async (id, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState()
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            }
            const response = await axios.put(`${API_URL}/${id}/read`, {}, config)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)

export const markAsResolved = createAsyncThunk(
    'messages/markAsResolved',
    async (id, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState()
            const config = {
                headers: {
                    Authorization: `Bearer ${auth.token}`
                }
            }
            const response = await axios.put(`${API_URL}/${id}/resolve`, {}, config)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message
            )
        }
    }
)

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        messages: [],
        unreadCount: 0,
        loading: false,
        error: null,
        success: false
    },
    reducers: {
        resetMessageStatus: (state) => {
            state.loading = false
            state.error = null
            state.success = false
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Messages
            .addCase(getMessages.pending, (state) => {
                state.loading = true
            })
            .addCase(getMessages.fulfilled, (state, action) => {
                state.loading = false
                state.messages = action.payload
                // Calculate unread count
                // For admin: unread messages where receiver is null (system) OR receiver is them (not implemented yet)
                // For student: unread messages where receiver is them
                // Actually, the backend returns all relevant messages. We just count isRead=false where sender != current user
                // But we don't have current user id easily here without passing it.
                // Let's rely on the component to calculate unread count or do it here if we assume logic.
                // Simplified: Count all unread messages in the list that are NOT sent by me?
                // We'll calculate unread count in the component or selector for accuracy.
            })
            .addCase(getMessages.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Send Message
            .addCase(sendMessage.pending, (state) => {
                state.loading = true
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.loading = false
                state.success = true
                state.messages.unshift(action.payload)
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Mark as Read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.messages.findIndex((m) => m._id === action.payload._id)
                if (index !== -1) {
                    state.messages[index] = action.payload
                }
            })
            // Mark as Resolved
            .addCase(markAsResolved.fulfilled, (state, action) => {
                const index = state.messages.findIndex((m) => m._id === action.payload._id)
                if (index !== -1) {
                    state.messages[index] = action.payload
                }
            })
    }
})

export const { resetMessageStatus } = messageSlice.actions
export default messageSlice.reducer
