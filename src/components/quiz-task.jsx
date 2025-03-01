"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { supabase } from "../../supabase"

export function QuizTask({ task, user, onComplete }) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase.rpc("get_random_quiz_questions", {
          task_id_param: task.id,
          questions_count: 10,
        })

        if (error) throw error

        setQuestions(data.questions)
        setTimeLeft(data.questions[0]?.time_limit || 30)
      } catch (err) {
        console.error("Error loading questions:", err)
        setError("Ошибка загрузки вопросов")
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [task.id])

  useEffect(() => {
    if (timeLeft > 0 && !loading) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)

      return () => clearInterval(timer)
    } else if (timeLeft === 0 && !loading) {
      handleNextQuestion()
    }
  }, [timeLeft, loading])

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId)
  }

  const handleNextQuestion = async () => {
    // Сохраняем ответ
    const currentQuestionData = questions[currentQuestion]
    setAnswers((prev) => [
      ...prev,
      {
        question_id: currentQuestionData.id,
        answer_id: selectedAnswer,
        time_taken: currentQuestionData.time_limit - timeLeft,
      },
    ])

    // Переходим к следующему вопросу или завершаем тест
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setTimeLeft(questions[currentQuestion + 1].time_limit)
    } else {
      // Отправляем все ответы на проверку
      try {
        const { data, error } = await supabase.rpc("check_quiz_answers", {
          user_task_id_param: task.id,
          answers: JSON.stringify(answers),
        })

        if (error) throw error

        if (data.success) {
          alert(
            `Тест завершен!
Правильных ответов: ${data.correct_answers} из ${data.total_questions}
Получено очков: ${data.total_points}`,
          )
          if (onComplete) onComplete()
        }
      } catch (error) {
        console.error("Error checking answers:", error)
        alert("Ошибка при проверке ответов")
      }
    }
  }

  if (loading) {
    return <div className="text-center">Загрузка вопросов...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Вопрос {currentQuestion + 1} из {questions.length}
        </CardTitle>
        <CardDescription>{currentQuestionData.question}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Осталось времени</span>
              <span>{timeLeft} сек</span>
            </div>
            <Progress value={(timeLeft / currentQuestionData.time_limit) * 100} />
          </div>

          <div className="grid gap-2">
            {currentQuestionData.answers.map((answer) => (
              <Button
                key={answer.id}
                variant={selectedAnswer === answer.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleAnswerSelect(answer.id)}
              >
                {answer.answer}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleNextQuestion} disabled={!selectedAnswer && timeLeft > 0}>
          {currentQuestion + 1 === questions.length ? "Завершить тест" : "Следующий вопрос"}
        </Button>
      </CardFooter>
    </Card>
  )
}

