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
  { text: "2. What's feeling heavy right now?", options: [
    { text: "A. Holding myself back, stagnating", letter: "A" },
    { text: "B. The pressure to keep pushing", letter: "B" },
    { text: "C. Constant juggling and overdoing", letter: "C" },
    { text: "D. The sense that something’s ending, outdated or uncertain", letter: "D" },
  ]},
  { text: "3. Which of these excites you the most right now?", options: [
    { text: "A. Sharing my voice and message", letter: "A" },
    { text: "B. Creating new offers and opportunities", letter: "B" },
    { text: "C. Building a life-business rhythm that fits me", letter: "C" },
    { text: "D. Exploring a bolder, newer version of my work", letter: "D" },
  ]},
  { text: "4. What’s one thing you wish felt easier?", options: [
    { text: "A. Showing up fully as myself", letter: "A" },
    { text: "B. Expanding my work in a way that feels aligned", letter: "B" },
    { text: "C. Managing my energy and time", letter: "C" },
    { text: "D. Trusting big transitions", letter: "D" },
  ]},
  { text: "5. Which describes your current focus best?", options: [
    { text: "A. Leading with my presence and purpose", letter: "A" },
    { text: "B. Growing my business with clarity and confidence", letter: "B" },
    { text: "C. Realigning my vision with my values and needs", letter: "C" },
    { text: "D. Reimagining what success can look like for me", letter: "D" },
  ]},
  { text: "6. What’s calling you forward right now?", options: [
    { text: "A. Greater visibility and influence", letter: "A" },
    { text: "B. Sustainable, soul-aligned success", letter: "B" },
    { text: "C. A return to flow and inner clarity", letter: "C" },
    { text: "D. A full-soul pivot or transformation", letter: "D" },
  ]},
  { text: "7. What tends to derail you?", options: [
    { text: "A. Fear of being too much or not enough", letter: "A" },
    { text: "B. Chasing results that drain me", letter: "B" },
    { text: "C. Ignoring my own needs", letter: "C" },
    { text: "D. Staying stuck in the old version of me", letter: "D" },
  ]},
  { text: "8. How do you usually reset when things feel off?", options: [
    { text: "A. Reconnect with my why and speak it out loud", letter: "A" },
    { text: "B. Rework my plans or get clearer strategy", letter: "B" },
    { text: "C. Take a step back and restore my energy", letter: "C" },
    { text: "D. Dive into deep reflection or journalling", letter: "D" },
  ]},
  { text: "9. What do you most want in this next phase?", options: [
    { text: "A. To feel seen, trusted and in my power", letter: "A" },
    { text: "B. To grow in a way that lasts", letter: "B" },
    { text: "C. To feel spacious, present and aligned", letter: "C" },
    { text: "D. To grow into the next better version of myself", letter: "D" },
  ]},
  { text: "10. When things feel uncertain, what’s your go-to response pattern?", options: [
    { text: "A. I step into control mode, clarity comes when I take the lead", letter: "A" },
    { text: "B. I get restless or try to fix it by doing more", letter: "B" },
    { text: "C. I shut down or quietly check out to protect my energy", letter: "C" },
    { text: "D. I spiral a little... old fears flare up and I question everything", letter: "D" },
  ]},
  { text: "11. Which belief are you most ready to let go of even if part of you still clings to it?", options: [
    { text: "A. That I have to tone myself down to be accepted", letter: "A" },
    { text: "B. That I need to earn rest by proving my worth", letter: "B" },
    { text: "C. That I’m only valuable when I’m useful to others", letter: "C" },
    { text: "D. That I need to have it all figured out before I take the next step", letter: "D" },
  ]},
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
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [confirmedBanner, setConfirmedBanner] = useState(false);

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isFormValid = name.trim().length > 1 && validateEmail(email) && gdpr;

  useEffect(() => {
    loadPoppinsFont();
    const postHeight = () => {
      try {
        window.parent.postMessage({ type: "resize-iframe", height: document.body.scrollHeight }, "*");
      } catch {}
    };
    postHeight();
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [step]);

  // Smooth confirmation banner timing (Option 2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("confirmed") === "true" || params.get("start") === "1") {
      setConfirmedBanner(true);
      setTimeout(() => {
        setStep(1);
        setConfirmedBanner(false);
      }, 1500); // short delay for smoother transition
    }
  }, []);

  async function handleStartClick() {
    if (!isFormValid) return;

    localStorage.setItem("quizName", name);
    localStorage.setItem("quizEmail", email);

    try {
      const resp = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: name }),
      });

      const data = await resp.json();
      if (data.ok) {
        setAwaitingConfirmation(true);
      } else {
        setResendMessage(data.message || "Could not start confirmation. Try again later.");
      }
    } catch {
      setResendMessage("Could not start confirmation. Try again later.");
    }
  }

  async function handleResendClick() {
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, first_name: name }),
      });
      setResendMessage("Resent. Please recheck your inbox.");
      setTimeout(() => setResendMessage(""), 5000);
    } catch {
      setResendMessage("Resend failed. Please try again later.");
    }
  }

  const handleAnswer = (l) => {
    const next = [...answers];
    next[step - 1] = l;
    setAnswers(next);
    if (step < questions.length) setStep(step + 1);
    else setSubmitted(true);
  };

  if (awaitingConfirmation)
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "40px 0" }}>
        <div style={{ maxWidth: 520, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28, background: "#fff", textAlign: "center" }}>
          <h3>Please check your inbox to confirm your email address</h3>
          <p>Your confirmation has been sent to <b>{email}</b>. Click the link in the email to start the quiz.</p>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>If you don’t see it, check spam or click resend</p>
          <button style={btnGreen} onClick={handleResendClick}>Resend confirmation</button>
          {resendMessage && <p style={{ marginTop: 10, color: "#028c8f", transition: "opacity 0.3s" }}>{resendMessage}</p>}
        </div>
      </div>
    );

  if (step === 0)
    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: "40px 0" }}>
        <div style={{ width: "100%", maxWidth: 600, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, background: "#fff" }}>
          <img src="/quiz-cover.png" alt="Success Path Quiz" style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 8, marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#028c8f", marginBottom: 8 }}>Discover Your Success Path</h2>
          <p style={{ fontSize: 15, marginBottom: 16, lineHeight: 1.5 }}>
            <b>Your energy already knows how to move.</b> This quiz helps you hear it so you can step into your business flow.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            <label style={{ fontSize: 14 }}>
              <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} style={{ marginRight: 8 }} /> By entering your email, you agree to get your quiz results as well as insights for your next steps.
            </label>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button style={{ ...btnGreen, opacity: isFormValid ? 1 : 0.6 }} disabled={!isFormValid} onClick={handleStartClick}>
                Start Quiz →
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  if (submitted) {
    const tally = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((a) => tally[a]++);
    const winner = Object.keys(tally).reduce((a, b) => (tally[a] > tally[b] ? a : b));
    const res = results[winner];
    const data = {
      name,
      email,
      gdpr,
      answers,
      successPath: res.label,
      dateISO: new Date().toISOString(),
    };
    saveResultToSheet(data);
    tagWithKit(email, res.label);

    return (
      <div style={{ fontFamily: "Poppins, sans-serif", display: "grid", placeItems: "center", background: "#fff" }}>
        <div style={{ width: "100%", maxWidth: 720, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, margin: "20px auto", textAlign: "center", background: "#fff" }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, color: res.colour }}>Your Success Path is… {res.label}</h2>
          <button style={btnGreen} onClick={() => (window.top.location.href = res.url)}>See Your Full Result →</button>
        </div>
      </div>
    );
  }

  const q = questions[step - 1];
  const progress = Math.round(((step - 1) / questions.length) * 100);

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", display: "grid", placeItems: "center", background: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 720, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, margin: "20px auto", background: "#fff" }}>
        {confirmedBanner && (
          <div style={{ background: "#b9e08520", padding: 12, borderRadius: 8, marginBottom: 12, textAlign: "center" }}>
            Thanks for confirming — here’s your quiz
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 6, background: "#eee", borderRadius: 999 }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#028c8f",
                borderRadius: 999,
                transition: "width 200ms ease",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            Question {step} of {questions.length}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
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
