// src/App.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Load Poppins font dynamically
function loadPoppinsFont() {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

async function tagWithKit(email, result) {
  if (!email || !result) return;
  try {
    await fetch("/api/tagUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, result }),
    });
  } catch {}
}

async function saveResultToSheet(data) {
  try {
    const resp = await fetch("/api/saveResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const msg = await resp.text();
      console.error("SaveResult failed:", msg);
    }
  } catch (err) {
    console.error("SaveResult error:", err);
  }
}

const questions = [
  { text: "1. What’s been on your mind most in business lately?", options: [
    { text: "A. Being seen and heard more clearly", letter: "A" },
    { text: "B. Reaching more people in the right way", letter: "B" },
    { text: "C. Slowing down to reconnect with what matters", letter: "C" },
    { text: "D. Changing direction or letting something go", letter: "D" },
  ]},
  // ... other questions unchanged ...
];

const results = {
  A: { label: "Impact", colour: "#ff0069", url: "https://jennijohnson.co.uk/quiz-sp-impact" },
  B: { label: "Growth", colour: "#115e84", url: "https://jennijohnson.co.uk/quiz-sp-growth" },
  C: { label: "Balance", colour: "#9d125e", url: "https://jennijohnson.co.uk/quiz-sp-balance" },
  D: { label: "Transformation", colour: "#000000", url: "https://jennijohnson.co.uk/quiz-sp-transformation" },
};

const sqsGreen = "#b9e085";
const sqsGreenHover = "#a4cc73";
const borderColor = "#3a3a3a";
const btnGreen = {
  background: sqsGreen,
  color: "#000",
  padding: "8px 18px",
  border: `2px solid ${borderColor}`,
  borderRadius: 30,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "Poppins, sans-serif",
};
const btnWhite = {
  background: "#fff",
  color: "#000",
  padding: "14px 22px",
  border: `2px solid ${borderColor}`,
  borderRadius: 30,
  cursor: "pointer",
  fontSize: 18,
  fontWeight: 400,
  textAlign: "left",
  fontFamily: "Poppins, sans-serif",
};

export default function App() {
  const [phase, setPhase] = useState("init"); // init | confirmBanner | form | quiz | waiting | result
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [answers, setAnswers] = useState([]);
  const [resultData, setResultData] = useState(null);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isFormValid = name.trim().length > 1 && validateEmail(email) && gdpr;

  useEffect(() => {
    loadPoppinsFont();
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "true" || params.get("start") === "1") {
      setPhase("confirmBanner");
      setTimeout(() => setPhase("quiz"), 1500);
    } else {
      setPhase("form");
    }
  }, []);

  useEffect(() => {
    const postHeight = () => {
      try {
        window.parent.postMessage({ type: "resize-iframe", height: document.body.scrollHeight }, "*");
      } catch {}
    };
    postHeight();
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [phase, step]);

  async function handleStartClick() {
    if (!isFormValid) return;
    setPhase("waiting");
    try {
      const resp = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: name }),
      });
      const data = await resp.json();
      if (data.ok) {
        setPhase("waiting");
      } else {
        setResendMessage(data.message || "Could not start confirmation. Try again later.");
      }
    } catch {
      setResendMessage("Could not start confirmation. Try again later.");
    }
  }

  const handleAnswer = (l) => {
    const next = [...answers];
    next[step - 1] = l;
    setAnswers(next);
    if (step < 11) setStep(step + 1);
    else {
      const tally = { A: 0, B: 0, C: 0, D: 0 };
      next.forEach((a) => (tally[a] = (tally[a] || 0) + 1));
      const winner = Object.keys(tally).reduce((a, b) => (tally[a] > tally[b] ? a : b));
      const res = results[winner];
      setResultData(res);
      saveResultToSheet({
        name,
        email,
        gdpr,
        answers: next,
        successPath: res.label,
        dateISO: new Date().toISOString(),
      });
      tagWithKit(email, res.label);
      setPhase("result");
    }
  };

  if (phase === "init") {
    return <div style={{ fontFamily: "Poppins, sans-serif", textAlign: "center", padding: 40 }}>Loading...</div>;
  }

  if (phase === "confirmBanner") {
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <div style={{ padding: 24, borderRadius: 12, background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h3>Thanks for confirming — enjoy the quiz</h3>
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", textAlign: "center", padding: 40 }}>
        <h3>Please check your inbox to confirm your email address</h3>
        <p>Your confirmation has been sent to <b>{email}</b>. Click the link in the email to start the quiz.</p>
      </div>
    );
  }

  if (phase === "form") {
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "40px 0" }}>
        <div style={{ width: "100%", maxWidth: 600, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, background: "#fff" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#028c8f", marginBottom: 8 }}>Discover Your Success Path</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label style={{ fontSize: 14 }}>
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} style={{ marginRight: 8 }} /> By entering your email, you agree to receive your quiz results and insights for your next steps.
            </label>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button style={{ ...btnGreen, opacity: isFormValid ? 1 : 0.6 }} disabled={!isFormValid} onClick={handleStartClick}>
                Start Quiz →
              </button>
            </div>
          </div>
          {resendMessage && <p style={{ marginTop: 10, color: "#028c8f" }}>{resendMessage}</p>}
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = questions[step - 1];
    const progress = Math.round(((step - 1) / questions.length) * 100);
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "grid", placeItems: "center", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 720, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, margin: "20px auto", background: "#fff" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 6, background: "#eee", borderRadius: 999 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#028c8f", borderRadius: 999, transition: "width 200ms ease" }} />
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>Question {step} of {questions.length}</div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{q.text}</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {q.options.map((o, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(o.letter)}
                    style={btnWhite}
                    onMouseEnter={(e) => (e.currentTarget.style.background = sqsGreenHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
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

  if (phase === "result" && resultData) {
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "grid", placeItems: "center", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 720, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, margin: "20px auto", textAlign: "center", background: "#fff" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, color: resultData.colour }}>Your Success Path is… {resultData.label}</h2>
          <button style={btnGreen} onClick={() => (window.top.location.href = resultData.url)}>See Your Full Result →</button>
        </div>
      </div>
    );
  }

  return null;
}