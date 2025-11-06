import React, { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [successPath, setSuccessPath] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Your quiz question bank
  const questions = [
    { id: 1, text: "Question 1?", options: ["A", "B", "C", "D"] },
    { id: 2, text: "Question 2?", options: ["A", "B", "C", "D"] },
    { id: 3, text: "Question 3?", options: ["A", "B", "C", "D"] },
    // ... add all remaining quiz questions
  ];

  // Handles answer selection per question
  const handleAnswer = (answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz(updatedAnswers);
    }
  };

  // Calculate Success Path (replace with your Codex logic)
  const calculateSuccessPath = (finalAnswers) => {
    const countA = finalAnswers.filter((a) => a === "A").length;
    const countB = finalAnswers.filter((a) => a === "B").length;
    const countC = finalAnswers.filter((a) => a === "C").length;
    const countD = finalAnswers.filter((a) => a === "D").length;
    const max = Math.max(countA, countB, countC, countD);

    if (max === countA) return "Impact";
    if (max === countB) return "Growth";
    if (max === countC) return "Balance";
    return "Transformation";
  };

  // Called once quiz finishes
  const finishQuiz = async (finalAnswers) => {
    const result = calculateSuccessPath(finalAnswers);
    setSuccessPath(result);
    setQuizComplete(true);
    setIsSubmitting(true);

    try {
      const response = await fetch("https://success-path-quiz.vercel.app/api/saveResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          answers: finalAnswers,
          successPath: result,
          dateISO: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to save result");
      setMessage("Your Success Path has been saved successfully ✨");
    } catch (error) {
      console.error("❌ Save failed:", error);
      setMessage("Something went wrong saving your quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render logic
  if (quizComplete) {
    return (
      <div className="quiz-result">
        <h2>Your Success Path: {successPath}</h2>
        <p>{message}</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {currentQuestion === 0 && answers.length === 0 ? (
        <div className="start-screen">
          <h2>Discover Your Success Path</h2>
          <p>Your energy already knows how to move. This quiz helps you hear it.</p>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={!name || !email}
            onClick={() => setCurrentQuestion(0)}
          >
            Start Quiz
          </button>
        </div>
      ) : (
        <div className="question-screen">
          <h3>{questions[currentQuestion].text}</h3>
          <div className="options">
            {questions[currentQuestion].options.map((opt) => (
              <button key={opt} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
          <p>
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      )}

      {isSubmitting && <p>Saving your result...</p>}
    </div>
  );
}
