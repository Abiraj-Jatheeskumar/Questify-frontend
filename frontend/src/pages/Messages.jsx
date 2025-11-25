import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMessages, sendMessage, markAsResolved } from '../redux/slices/messageSlice'
import Navbar from '../components/Navbar'

const Messages = () => {
    const dispatch = useDispatch()
    const { messages, loading, error } = useSelector((state) => state.messages)
    const { user } = useSelector((state) => state.auth)
    const [newMessage, setNewMessage] = useState('')
    const [filter, setFilter] = useState('all') // 'all', 'unresolved'
    const [replyTo, setReplyTo] = useState(null) // { id: userId, name: userName }

    useEffect(() => {
        dispatch(getMessages())
    }, [dispatch])

    const handleSend = (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const messageData = { content: newMessage }
        if (user.role === 'admin') {
            if (!replyTo) {
                alert('Please select a message to reply to.')
                return
            }
            messageData.receiverId = replyTo.id
        }

        dispatch(sendMessage(messageData))
        setNewMessage('')
        setReplyTo(null)
    }

    const handleResolve = (id) => {
        dispatch(markAsResolved(id))
    }

    const handleReply = (sender) => {
        setReplyTo({ id: sender._id, name: sender.name })
        setNewMessage(`@${sender.name} `)
    }

    const filteredMessages = messages.filter((msg) => {
        if (filter === 'unresolved') return !msg.isResolved
        return true
    })

    return (
        <div>
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Message List */}
                    <div className="md:col-span-2 space-y-4">
                        {user?.role === 'admin' && (
                            <div className="flex justify-end mb-4">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="border rounded-md px-3 py-1"
                                >
                                    <option value="all">All Messages</option>
                                    <option value="unresolved">Unresolved</option>
                                </select>
                            </div>
                        )}

                        {loading && messages.length === 0 ? (
                            <div className="text-center py-4">Loading...</div>
                        ) : filteredMessages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow">
                                No messages found.
                            </div>
                        ) : (
                            filteredMessages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`bg-white shadow rounded-lg p-4 border-l-4 ${msg.sender?._id === user._id ? 'border-blue-500' : 'border-green-500'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="font-semibold text-gray-900">
                                                {msg.sender?._id === user._id ? 'You' : msg.sender?.name}
                                            </span>
                                            {msg.receiver && (
                                                <span className="text-gray-500 text-sm"> &rarr; {msg.receiver.name}</span>
                                            )}
                                            <span className="text-xs text-gray-500 ml-2">
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {user?.role === 'admin' && (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleReply(msg.sender)}
                                                    className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                                                >
                                                    Reply
                                                </button>
                                                <button
                                                    onClick={() => handleResolve(msg._id)}
                                                    className={`text-xs px-2 py-1 rounded ${msg.isResolved
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {msg.isResolved ? '✓ Done' : 'Mark as Done'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Send Message Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white shadow rounded-lg p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">
                                {replyTo ? `Reply to ${replyTo.name}` : 'Send Message'}
                            </h2>
                            {replyTo && (
                                <button
                                    onClick={() => {
                                        setReplyTo(null)
                                        setNewMessage('')
                                    }}
                                    className="text-xs text-red-500 mb-2 hover:underline"
                                >
                                    Cancel Reply
                                </button>
                            )}
                            <form onSubmit={handleSend}>
                                <div className="mb-4">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={
                                            user?.role === 'admin'
                                                ? "Select 'Reply' on a message to send a response."
                                                : "Type your message to Admin..."
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md h-32 resize-none"
                                        required
                                        disabled={user?.role === 'admin' && !replyTo}
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || (user?.role === 'admin' && !replyTo)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages
