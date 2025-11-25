import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAssignedQuestions, submitAnswer } from '../../redux/slices/studentSlice'

const AssignedQuestions = () => {
  const dispatch = useDispatch()
  const { assignedQuestions, loading, error } = useSelector((state) => state.student)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  // responseTimes and questionStartTimes are maintained, but responseTimes is calculated on the fly now
  const [questionStartTimes, setQuestionStartTimes] = useState({})

  useEffect(() => {
    dispatch(getAssignedQuestions())
  }, [dispatch])

  useEffect(() => {
    // Track start time for each unanswered question
    assignedQuestions.forEach((q) => {
      if (!q.isAnswered && !questionStartTimes[q.questionId]) {
        setQuestionStartTimes((prev) => ({
          ...prev,
          [q.questionId]: Date.now()
        }))
      }
    })
  }, [assignedQuestions])

  const handleAnswerSelect = async (questionId, selectedAnswer, classId) => {
    const startTime = questionStartTimes[questionId] || Date.now()
    const responseTime = Date.now() - startTime

    setSelectedAnswers((prev) => ({ ...prev, [questionId]: selectedAnswer }))

    await dispatch(
      submitAnswer({
        questionId,
        selectedAnswer,
        classId,
        responseTime
      })
    )

    // Refresh questions to show the answered status
    dispatch(getAssignedQuestions())
  }

  // New handler to prevent copying and modify clipboard content
  const handleCopy = (e) => {
    // Prevent the default browser copy action
    e.preventDefault();

    const errorText = 'error 404 error 404';

    // Use a temporary, invisible textarea to reliably set the clipboard content
    const tempInput = document.createElement('textarea');
    tempInput.value = errorText;

    // Hide it from the user's view
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    tempInput.style.top = '0';

    document.body.appendChild(tempInput);
    tempInput.select();

    // Execute the copy command
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Copy modification failed:', err);
    }

    // Clean up the temporary element
    document.body.removeChild(tempInput);

    // Optional feedback
    console.warn(`Copy attempt detected. Clipboard content set to: "${errorText}"`);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Assigned Questions</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : assignedQuestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions assigned yet. Please wait for your admin to assign questions.
        </div>
      ) : (
        <div className="space-y-6">
          {assignedQuestions.map((question) => (
            <div
              key={question.questionId}
              // Apply the copy handler to the entire question block
              onCopy={handleCopy}
              className={`bg-white shadow rounded-lg p-4 sm:p-6 ${question.isAnswered ? 'opacity-75' : ''
                }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start mb-4">
                <div className="flex-1 w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {question.question}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      Class: {question.className}
                    </span>
                    {question.isAnswered && (
                      <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                        ✓ Answered
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {question.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-h-64 rounded border w-full object-contain sm:w-auto"
                    />
                  </div>
                )}
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswers[question.questionId] === index
                  return (
                    <button
                      key={index}
                      onClick={() =>
                        !question.isAnswered &&
                        handleAnswerSelect(question.questionId, index, question.classId)
                      }
                      disabled={question.isAnswered}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition ${question.isAnswered
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-gray-50'
                        } ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                        }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AssignedQuestions