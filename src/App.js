// src/App.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

async function tagWithKit(email, result) {
  if (!email || !result) return;
  try {
    await fetch("/api/tagUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, result }),
    });
  } catch (err) {
    console.error("TagWithKit error", err);
  }
}

const questions = [
  { text: "1. What’s been on your mind most in business lately?", options: [
    { text: "A. Being seen and heard more clearly", letter: "A" },
    { text: "B. Reaching more people in the right way", letter: "B" },
    { text: "C. Slowing down to reconnect with what matters", letter: "C" },
    { text: "D. Changing direction or letting something go", letter: "D" },
  ]},
  // ... (keep all your other questions unchanged)
];

const results = {
  A: { label: "Impact", colour: "#ff0069", url: "https://jennijohnson.co.uk/quiz-sp-impact" },
  B: { label: "Growth", colour: "#115e84", url: "https://jennijohnson.co.uk/quiz-sp-growth" },
  C: { label: "Balance", colour: "#9d125e", url: "https://jennijohnson.co.uk/quiz-sp-balance" },
  D: { label: "Transformation", colour: "#000000", url: "https://jennijohnson.co.uk/quiz-sp-transformation" },
};

const baseButton = {
  background: "#f0f0f0",
  color: "#000",
  padding: "10px 20px",
  border: "none",
  borderRadius: 30,
  cursor: "pointer",
  fontWeight: 600,
  fontFamily: "Poppins",
  transition: "all 0.2s ease",
};

export default function App() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [answers, setAnswers] = useState(Array(11).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [confirmedBanner, setConfirmedBanner] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isFormValid = name.trim().length > 1 && validateEmail(email) && gdpr;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "true" || params.get("start") === "1") {
      setStep(1);
      setConfirmedBanner(true);
      setTimeout(() => setConfirmedBanner(false), 2500);
    }
  }, []);

  async function handleStartClick() {
    if (!isFormValid) return;
    try {
      const resp = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: name }),
      });
      const data = await resp.json();
      if (data.ok) setAwaitingConfirmation(true);
    } catch (err) {
      console.error("Subscribe error", err);
    }
  }

  const handleAnswer = (letter) => {
    const next = [...answers];
    next[step - 1] = letter;
    setAnswers(next);
    if (step < questions.length) setStep(step + 1);
    else setSubmitted(true);
  };

  if (awaitingConfirmation)
    return (
      <div style={{ fontFamily: "Poppins", textAlign: "center", padding: "60px 20px", background: "#dbedbe", minHeight: "100vh" }}>
        <h3>Please check your inbox to confirm your email address</h3>
        <p>Your confirmation has been sent to <b>{email}</b>.</p>
        <p style={{ fontSize: 13, color: "#333" }}>If you don’t see it, check spam.</p>
      </div>
    );

  if (step === 0)
    return (
      <div style={{ fontFamily: "Poppins", textAlign: "center", padding: "40px 0" }}>
        <h2 style={{ color: "#028c8f" }}>Discover Your Success Path</h2>
        <p>Start your quiz below.</p>
        <div style={{ maxWidth: 500, margin: "0 auto", display: "grid", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }} />
          <label style={{ fontSize: 13 }}>
            <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} /> I agree to receive my results and follow-up insights.
          </label>
          <button
            style={{
              ...baseButton,
              background: isFormValid ? "#b9e085" : "#ccc",
              cursor: isFormValid ? "pointer" : "not-allowed",
            }}
            disabled={!isFormValid}
            onMouseEnter={(e) => (e.target.style.background = "#a2cd72")}
            onMouseLeave={(e) => (e.target.style.background = isFormValid ? "#b9e085" : "#ccc")}
            onClick={handleStartClick}
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );

  if (submitted) {
    const tally = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((a) => tally[a]++);
    const winner = Object.keys(tally).reduce((a, b) => (tally[a] > tally[b] ? a : b));
    const res = results[winner];

    async function handleFinish() {
      try {
        const payload = { name, email, answers, successPath: res.label, gdpr, dateISO: new Date().toISOString() };
        console.log("Sending quiz results →", payload);

        const response = await fetch("https://success-path-quiz.vercel.app/api/saveResult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("saveResult response:", data);
      } catch (err) {
        console.error("saveResult error:", err);
      } finally {
        tagWithKit(email, res.label);
        window.top.location.href = res.url;
      }
    }

    return (
      <div style={{ textAlign: "center", fontFamily: "Poppins", padding: "40px 0" }}>
        <h2 style={{ color: res.colour }}>Your Success Path is… {res.label}</h2>
        <button
          style={{ ...baseButton, background: "#b9e085" }}
          onMouseEnter={(e) => (e.target.style.background = "#a2cd72")}
          onMouseLeave={(e) => (e.target.style.background = "#b9e085")}
          onClick={handleFinish}
        >
          See Your Full Result →
        </button>
      </div>
    );
  }

  const q = questions[step - 1];
  const progress = Math.round(((step - 1) / questions.length) * 100);

  return (
    <div style={{ fontFamily: "Poppins", background: "#fff", minHeight: "100vh" }}>
      {confirmedBanner && (
        <div style={{ background: "#dbedbe", padding: 10, textAlign: "center" }}>
          Thanks for confirming — here’s your quiz
        </div>
      )}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        <div style={{ height: 6, background: "#eee", borderRadius: 999, marginBottom: 12 }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "#028c8f", borderRadius: 999, transition: "width 200ms ease" }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <h2>{q.text}</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {q.options.map((o, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(o.letter)}
                  style={{ ...baseButton }}
                  onMouseEnter={(e) => (e.target.style.background = "#b9e085")}
                  onMouseLeave={(e) => (e.target.style.background = "#f0f0f0")}
                >
                  {o.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
