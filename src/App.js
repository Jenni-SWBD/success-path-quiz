import React, { useState, useEffect } from "react";
import "./App.css";

// ----------------------------------------------------
// KIT tagging helper (runs once KIT double opt-in is confirmed)
// ----------------------------------------------------
async function tagWithKit(email, name) {
  try {
    await fetch("/api/tagUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
  } catch (err) {
    console.error("KIT tagging failed:", err);
  }
}

// ----------------------------------------------------
// Quiz Component
// ----------------------------------------------------
export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(-1); // start at -1 = waiting for KIT confirmation
  const [quizComplete, setQuizComplete] = useState(false);
  const [successPath, setSuccessPath] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect KIT redirect back with ?start=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "1") {
      setCurrentQuestion(0); // start quiz
    }
  }, []);

  // =========================================================
  // Quiz Questions
  // =========================================================
  const questions = [
    {
      text: "1. What’s been on your mind most in business lately?",
      options: [
        { text: "A. Being seen and heard more clearly", letter: "A" },
        { text: "B. Reaching more people in the right way", letter: "B" },
        { text: "C. Slowing down to reconnect with what matters", letter: "C" },
        { text: "D. Changing direction or letting something go", letter: "D" },
      ],
    },
    {
      text: "2. What's feeling heavy right now?",
      options: [
        { text: "A. Holding myself back, stagnating", letter: "A" },
        { text: "B. The pressure to keep pushing", letter: "B" },
        { text: "C. Constant juggling and overdoing", letter: "C" },
        { text: "D. The sense that something’s ending, outdated or uncertain", letter: "D" },
      ],
    },
    {
      text: "3. Which of these excites you the most right now?",
      options: [
        { text: "A. Sharing my voice and message", letter: "A" },
        { text: "B. Creating new offers and opportunities", letter: "B" },
        { text: "C. Building a life-business rhythm that fits me", letter: "C" },
        { text: "D. Exploring a bolder, newer version of my work", letter: "D" },
      ],
    },
    {
      text: "4. What’s one thing you wish felt easier?",
      options: [
        { text: "A. Showing up fully as myself", letter: "A" },
        { text: "B. Expanding my work in a way that feels aligned", letter: "B" },
        { text: "C. Managing my energy and time", letter: "C" },
        { text: "D. Trusting big transitions", letter: "D" },
      ],
    },
    {
      text: "5. Which describes your current focus best?",
      options: [
        { text: "A. Leading with my presence and purpose", letter: "A" },
        { text: "B. Growing my business with clarity and confidence", letter: "B" },
        { text: "C. Realigning my vision with my values and needs", letter: "C" },
        { text: "D. Reimagining what success can look like for me", letter: "D" },
      ],
    },
    {
      text: "6. What’s calling you forward right now?",
      options: [
        { text: "A. Greater visibility and influence", letter: "A" },
        { text: "B. Sustainable, soul-aligned success", letter: "B" },
        { text: "C. A return to flow and inner clarity", letter: "C" },
        { text: "D. A full-soul pivot or transformation", letter: "D" },
      ],
    },
    {
      text: "7. What tends to derail you?",
      options: [
        { text: "A. Fear of being too much or not enough", letter: "A" },
        { text: "B. Chasing results that drain me", letter: "B" },
        { text: "C. Ignoring my own needs", letter: "C" },
        { text: "D. Staying stuck in the old version of me", letter: "D" },
      ],
    },
    {
      text: "8. How do you usually reset when things feel off?",
      options: [
        { text: "A. Reconnect with my why and speak it out loud", letter: "A" },
        { text: "B. Rework my plans or get clearer strategy", letter: "B" },
        { text: "C. Take a step back and restore my energy", letter: "C" },
        { text: "D. Dive into deep reflection or journalling", letter: "D" },
      ],
    },
    {
      text: "9. What do you most want in this next phase?",
      options: [
        { text: "A. To feel seen, trusted and in my power", letter: "A" },
        { text: "B. To grow in a way that lasts", letter: "B" },
        { text: "C. To feel spacious, present and aligned", letter: "C" },
        { text: "D. To grow into the next better version of myself", letter: "D" },
      ],
    },
    {
      text: "10. When things feel uncertain, what’s your go-to response pattern?",
      options: [
        { text: "A. I step into control mode, clarity comes when I take the lead", letter: "A" },
        { text: "B. I get restless or try to fix it by doing more", letter: "B" },
        { text: "C. I shut down or quietly check out to protect my energy", letter: "C" },
        { text: "D. I spiral a little... old fears flare up and I question everything", letter: "D" },
      ],
    },
    {
      text: "11. Which belief are you most ready to let go of even if part of you still clings to it?",
      options: [
        { text: "A. That I have to tone myself down to be accepted", letter: "A" },
        { text: "B. That I need to earn rest by proving my worth", letter: "B" },
        { text: "C. That I’m only valuable when I’m useful to others", letter: "C" },
        { text: "D. That I need to have it all figured out before I take the next step", letter: "D" },
      ],
    },
  ];

  // =========================================================
  // Handle answers and quiz completion
  // =========================================================
  const handleAnswer = (letter) => {
    const updated = [...answers, letter];
    setAnswers(updated);
    if (updated.length === questions.length) finishQuiz(updated);
    else setCurrentQuestion(currentQuestion + 1);
  };

  const calculateSuccessPath = (finalAnswers) => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    finalAnswers.forEach((a) => (counts[a] += 1));
    const max = Math.max(...Object.values(counts));
    if (max === counts.A) return "Impact";
    if (max === counts.B) return "Growth";
    if (max === counts.C) return "Balance";
    return "Transformation";
  };

  const finishQuiz = async (finalAnswers) => {
    const path = calculateSuccessPath(finalAnswers);
    setSuccessPath(path);
    setQuizComplete(true);
    setIsSubmitting(true);

    try {
      await fetch("/api/saveResult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          answers: finalAnswers,
          successPath: path,
          dateISO: new Date().toISOString(),
        }),
      });

      await tagWithKit(email, name);
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Something went wrong saving your result.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // Render flow
  // =========================================================
  if (quizComplete)
    return (
      <div className="quiz-result">
        <h2>Your Success Path: {successPath}</h2>
        <p>{message || "Your energy knows how to move — trust your path."}</p>
      </div>
    );

  // Start screen (only shows before KIT redirect)
  if (currentQuestion === -1)
    return (
      <div className="start-screen">
        <h2>Discover Your Success Path</h2>
        <p>Your energy already knows how to move. This quiz helps you hear it.</p>

        <form
          action="https://she-who-builds-different.kit.com/c5d3288b6f"
          method="post"
        >
          <input
            type="text"
            name="fields[first_name]"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            name="email_address"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={!name || !email}>
            Start Quiz →
          </button>
        </form>
      </div>
    );

  // Question screens
  return (
    <div className="question-screen">
      <h3>{questions[currentQuestion].text}</h3>
      <div className="options">
        {questions[currentQuestion].options.map((opt) => (
          <button key={opt.letter} onClick={() => handleAnswer(opt.letter)}>
            {opt.text}
          </button>
        ))}
      </div>
      <p>
        Question {currentQuestion + 1} of {questions.length}
      </p>
      {isSubmitting && <p>Saving your result...</p>}
    </div>
  );
}
