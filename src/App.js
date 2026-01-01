import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// --- KIT tagging helper (auto-clears localStorage) ---
async function tagWithKit(email, result) {
  if (!email || !result) return;
  try {
    await fetch("/api/tagUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, result }),
    });
  } finally {
    try {
      localStorage.removeItem("quizEmail");
      localStorage.removeItem("quizResult");
    } catch {}
  }
}

/* =========================================================
   Quiz Questions + Results
   (kept compact for readability)
   ========================================================= */
const questions = [
  { text: "1. What’s been off in your business lately?", options: [
    { text: "A. My voice feels muted", letter: "A" },
    { text: "B. My growth feels scattered", letter: "B" },
    { text: "C. My energy feels stretched", letter: "C" },
    { text: "D. My direction feels out of date", letter: "D" }
  ]},

  { text: "2. What feels heavy right now?", options: [
    { text: "A. Holding myself back", letter: "A" },
    { text: "B. Pouring effort into the wrong things", letter: "B" },
    { text: "C. Carrying too much", letter: "C" },
    { text: "D. Staying in something that needs to change", letter: "D" }
  ]},

  { text: "3. What would feel good to shift?", options: [
    { text: "A. How I show up", letter: "A" },
    { text: "B. Where I focus", letter: "B" },
    { text: "C. How I work day to day", letter: "C" },
    { text: "D. The whole shape of what I’m building", letter: "D" }
  ]},

  { text: "4. What do you wish felt clearer?", options: [
    { text: "A. My message", letter: "A" },
    { text: "B. My strategy", letter: "B" },
    { text: "C. My energy", letter: "C" },
    { text: "D. My next step", letter: "D" }
  ]},

  { text: "5. What feels like your next step up?", options: [
    { text: "A. Being more visible", letter: "A" },
    { text: "B. Growing with intent", letter: "B" },
    { text: "C. Working in a way that supports me", letter: "C" },
    { text: "D. Letting something evolve", letter: "D" }
  ]},

  { text: "6. Where do you feel the most momentum building?", options: [
    { text: "A. My presence", letter: "A" },
    { text: "B. My growth", letter: "B" },
    { text: "C. My alignment", letter: "C" },
    { text: "D. My evolution", letter: "D" }
  ]},

  { text: "7. What tends to derail you?", options: [
    { text: "A. Doubting my voice", letter: "A" },
    { text: "B. Chasing results that drain me", letter: "B" },
    { text: "C. Ignoring my own needs", letter: "C" },
    { text: "D. Staying loyal to old versions of me", letter: "D" }
  ]},

  { text: "8. How do you reset?", options: [
    { text: "A. I reconnect with what I want to say", letter: "A" },
    { text: "B. I tidy my plans", letter: "B" },
    { text: "C. I slow down and regroup", letter: "C" },
    { text: "D. I reflect and reassess", letter: "D" }
  ]},

  { text: "9. What do you want next?", options: [
    { text: "A. Strong voice and presence", letter: "A" },
    { text: "B. Growth that fits", letter: "B" },
    { text: "C. Space and steadiness", letter: "C" },
    { text: "D. A fresh direction", letter: "D" }
  ]},

  { text: "10. When things get uncertain, what’s your go-to response?", options: [
    { text: "A. I take charge", letter: "A" },
    { text: "B. I speed up", letter: "B" },
    { text: "C. I pull back", letter: "C" },
    { text: "D. I question everything", letter: "D" }
  ]}
];

const results = {
  A: { 
    label: "Impact", 
    colour: "#ff0069", 
    url: "https://jennijohnson.co.uk/quiz-sp-impact", 
    initial: `<p>You’re standing on the edge of a version of yourself you’ve been half-holding back.</p><p>This path opens when you stop diluting your truth and let your presence land without hesitation.</p><p>You already feel the pull to speak more cleanly… act more boldly… show up without editing yourself to fit the room.</p><p>You don’t need to be louder, you just need to be you, without the filter.</p><p>To help you access that clarity, I’ve created a short <b>Impact Path visualisation</b>.</p><p>It’ll bring you back to the energy you lead with when you’re not second-guessing yourself.</p><p>Let it meet you. Let it clear the noise.</p>` 
  },

  B: { 
    label: "Growth", 
    colour: "#115e84", 
    url: "https://jennijohnson.co.uk/quiz-sp-growth", 
    initial: `<p>You want growth that feels grounded rather than demanding… spacious rather than overwhelming.</p><p>This path opens up when you start choosing the kind of growth that strengthens your foundation instead of stretching you thin.</p><p>You’re ready for progress that feels clean… intentional… aligned with your natural patterns instead of someone else’s expectations.</p><p>To help you reconnect with that rhythm, I’ve recorded a short <b>Growth Path visualisation</b>.</p><p>It’ll help you settle your system and hear the direction that’s been waiting beneath the noise.</p><p>Let it land gently. Your pace is a power, not a problem.</p>` 
  },

  C: { 
    label: "Balance", 
    colour: "#9d125e", 
    url: "https://jennijohnson.co.uk/quiz-sp-balance", 
    initial: `<p>You’re being pulled back to your own centre, the place you lead from when you’re not carrying more than you should.</p><p>Right now your system wants spaciousness, steadiness and room to breathe.</p><p>Not withdrawal… not collapse… just a return to the clarity that comes when you stop overriding yourself.</p><p>Balance isn’t stillness. It’s remembering where your energy begins and ends.</p><p>To help you find that point again, I’ve created a short <b>Balance Path visualisation</b>.</p><p>It’ll guide you back to a rhythm that feels like yours, not the one you’ve been keeping up with.</p><p>Give yourself a moment. Clarity comes when you stop rushing for it.</p>` 
  },

  D: { 
    label: "Transformation", 
    colour: "#000000", 
    url: "https://jennijohnson.co.uk/quiz-sp-transformation", 
    initial: `<p>You’re in a pivotal doorway. You're not stuck, not lost but a version of you is dissolving and the next one is trying to surface.</p><p>This path opens up when you stop gripping onto your old identity and let the new one take shape without forcing it.</p><p>You’re ready for movement… but not the kind that comes from certainty.</p><p>The kind that comes from truth and the deeper knowing you’ve been orbiting for a while.</p><p>To support you through this shift, I’ve recorded a short <b>Transformation Path visualisation</b>.</p><p>It’ll help you loosen what’s outdated and recognise the direction your energy is already turning toward.</p><p>Let it guide you. You’re already becoming the person your next level requires.</p>` 
  },
};

/* =========================================================
   Brand styles
   ========================================================= */
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
};

/* =========================================================
   App Component
   ========================================================= */
export default function App() {
  // Steps: 0=intro, 1..11 = questions
  const [step, setStep] = useState(0);

  // Intro form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);

  // Validation state
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Confirmation / UX additions
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [confirmedBanner, setConfirmedBanner] = useState(false);
  const [welcomeBack, setWelcomeBack] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  /* ==========================================
     Squarespace auto-resize (postMessage)
     ========================================== */
  useEffect(() => {
    const postHeight = () => {
      try {
        window.parent.postMessage(
          { type: "resize-iframe", height: document.body.scrollHeight },
          "*"
        );
      } catch (_) {}
    };

    postHeight();
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);
    const t1 = setTimeout(postHeight, 150);
    const t2 = setTimeout(postHeight, 400);
    const t3 = setTimeout(postHeight, 800);

    setTimeout(() => {
      try {
        window.parent.postMessage(
          { type: "resize-iframe", height: document.body.scrollHeight },
          "*"
        );
      } catch (_) {}
    }, 200);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [step]);

  /* ==========================================
     Validation helpers
     ========================================== */
  const validateName = (v) => {
    const t = v.trim();
    if (!t) return "Name is required";
    if (t.length < 2) return "Please enter at least 2 characters";
    return "";
  };

  const validateEmail = (v) => {
    const t = v.trim();
    if (!t) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(t)) return "Please enter a valid email address";
    return "";
  };

  const nameError = nameTouched ? validateName(name) : "";
  const emailError = emailTouched ? validateEmail(email) : "";
  const isFormValid = validateName(name) === "" && validateEmail(email) === "" && gdpr;

  /* ==========================================
     Quiz handlers
     ========================================== */
  const handleAnswer = (letter) => {
    const next = [...answers];
    next[step - 1] = letter;
    setAnswers(next);
    if (step < questions.length) setStep(step + 1);
    else setSubmitted(true);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (step === 1) setStep(0);
  };

  const calcResult = () => {
    const tally = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((l) => {
      if (l) tally[l] += 1;
    });
    const max = Math.max(...Object.values(tally));
    return Object.keys(tally).find((k) => tally[k] === max);
  };

  /* ==========================================
   Persist to Google Sheets (once on submit)
   ========================================== */
useEffect(() => {
  if (!submitted) return;

  // Prevent duplicate submissions
  if (window.__quizSaved__) return;
  window.__quizSaved__ = true;

  const winner = calcResult();
  const payload = {
    dateISO: new Date().toISOString(),
    name,
    email,
    gdpr,
    answers,
    successPath: results[winner].label,
  };

  try {
    localStorage.setItem("quizEmail", email);
    localStorage.setItem("quizResult", results[winner].label);
  } catch (e) {}

  fetch("/api/saveResult", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [submitted]);

  /* ==========================================
     --- Top-level KIT tagging effect ---
     Fires once when submitted & Results is determined.
     ========================================== */
  const winnerSubmitted = submitted ? calcResult() : null;
  const resSubmitted = winnerSubmitted ? results[winnerSubmitted] : null;
  const taggedRef = useRef(false);

  useEffect(() => {
    if (!submitted || taggedRef.current) return;

    const emailForTag =
      email || (typeof window !== "undefined" && localStorage.getItem("quizEmail")) || "";

    const resultForTag =
      resSubmitted?.label || (typeof window !== "undefined" && localStorage.getItem("quizResult")) || "";

    if (!emailForTag || !resultForTag) return;

    taggedRef.current = true;
    tagWithKit(emailForTag, resultForTag);
  }, [submitted, email, resSubmitted?.label]);

  /* ==========================================
   On mount: detect confirmation and resume quiz
   ========================================== */
const hasConfirmedRef = useRef(false);

useEffect(() => {
  if (hasConfirmedRef.current) return;

  try {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const hash = window.location.hash || "";

    const confirmedDetected =
      params.get("confirmed") === "true" ||
      params.get("confirmed") === "1" ||
      params.has("confirmed") ||
      hash.toLowerCase().includes("confirmed");

    if (!confirmedDetected) return;

    hasConfirmedRef.current = true;

    try {
      const savedName = localStorage.getItem("quizName");
      const savedEmail = localStorage.getItem("quizEmail");
      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
    } catch (e) {}

    setAwaitingConfirmation(false);
    setWelcomeBack(false);
    setConfirmedBanner(true);
    setTimeout(() => setConfirmedBanner(false), 3500);

    setStep(1);

    // clean URL
    try {
      const clean = new URL(window.location.href);
      clean.searchParams.delete("confirmed");
      if (clean.hash && clean.hash.toLowerCase().includes("confirmed")) {
        clean.hash = "";
      }
      window.history.replaceState({}, "", clean.toString());
    } catch (e) {}
  } catch (e) {
    // ignore malformed URL or embed edge cases
  }
  // run once
}, []);

    /* ==========================================
     PostMessage listener: listen for parent page telling us to start
     ========================================== */
  useEffect(() => {
    function onMessage(e) {
      try {
        const data = e.data || {};
        if (data?.type !== "quiz-start") return;
        const search = data.search || "";
        const params = new URLSearchParams(search);

        // handle explicit start param
        const startParam = parseInt(params.get("start"), 10);
        if (
          Number.isInteger(startParam) &&
          startParam >= 1 &&
          startParam <= questions.length
        ) {
          try {
            const savedName = localStorage.getItem("quizName");
            const savedEmail = localStorage.getItem("quizEmail");
            if (savedName) setName(savedName);
            if (savedEmail) setEmail(savedEmail);
          } catch (e) {}

          setStep(startParam);
          setConfirmedBanner(true);
          setTimeout(() => setConfirmedBanner(false), 2500);
          return;
        }

        // fallback to confirmed flag
        if (params.get("confirmed") === "true" || params.has("confirmed")) {
          try {
            const savedName = localStorage.getItem("quizName");
            const savedEmail = localStorage.getItem("quizEmail");
            if (savedName) setName(savedName);
            if (savedEmail) setEmail(savedEmail);
          } catch (e) {}

          setStep(1);
          setConfirmedBanner(true);
          setTimeout(() => setConfirmedBanner(false), 2500);
        }
      } catch (err) {
        // ignore malformed messages
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ==========================================
     Start handler: trigger KIT double opt-in
     ========================================== */
  async function handleStartClick() {
    setNameTouched(true);
    setEmailTouched(true);
    if (validateName(name) || validateEmail(email) || !gdpr) return;

    try {
      localStorage.setItem("quizName", name);
      localStorage.setItem("quizEmail", email);
    } catch (e) {}

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: name,
          last_name: "",
          quizData: {},
        }),
      });

      const data = await res.json();

      // Reset any prior quiz state
      setConfirmedBanner(false);

      // Always show confirmation screen
      setAwaitingConfirmation(true);

      // Flag returning subscriber for Welcome Back copy
      setWelcomeBack(!!data?.alreadyConfirmed);
      
    } catch (err) {
      console.error(err);
      alert("Could not start confirmation. Try again later");
    }
  }

  /* =========================
     Intro Screen
     ========================= */

  useEffect(() => {
    // Always keep the quiz background transparent to show page design
    const setTransparent = () => {
      document.body.style.background = "transparent";
      document.documentElement.style.background = "transparent";
    };
    setTransparent();
    return () => setTransparent();
  }, []);

  if (step === 0) {
    // If we've asked KIT to confirm and user is waiting, show check-inbox UI
    if (awaitingConfirmation) {
      document.body.classList.add("fade-in");
      setTimeout(() => {
        document.body.classList.remove("fade-in");
      }, 1800);

      return (
        <div
          style={{
            width: "100%",
            minHeight: "100dvh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "transparent",
            padding: "80px 16px 24px", // added top padding to offset Squarespace clipping
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 12,
              boxShadow: "0 4px 20px rgba(2,140,143,0.25)",
              padding: 24,
              background: "#fff",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 8, color: "#028c8f" }}>
  {welcomeBack ? "Welcome back." : "Check your inbox to verify your email address"}
</h3>

<p style={{ marginBottom: 12 }}>
  {welcomeBack ? (
    <>
      Your Success Path isn’t fixed. It shifts as your business, energy and focus evolve.
      <br /><br />
      We’ve sent a confirmation to <b>{email}</b>.
      <br /><br />
      Taking the quiz again helps you see what’s most active now so you can respond with precision rather than habit.
    </>
  ) : (
    <>
      We sent a confirmation to <b>{email}</b>. Click the link in that email to start your quiz.
    </>
  )}
</p>

            <p
              style={{
                marginTop: 16,
                fontSize: 14,
                color: "#028c8f",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={async () => {
                try {
                  await fetch("/api/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email,
                      first_name: name,
                      last_name: "",
                      quizData: {},
                    }),
                  });
                  alert("Resent. Check your inbox.");
                } catch {
                  alert("Resend failed. Try again later.");
                }
              }}
            >
              Resend confirmation
            </p>
          </div>
        </div>
      );
    }

    document.body.classList.add("fade-in");
    setTimeout(() => {
      document.body.classList.remove("fade-in");
    }, 1800); // slightly longer than 1s transition
    return (
      <div style={{ display: "grid", placeItems: "center", background: "#transparent" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: 24,
            margin: "20px auto",
            background: "#fff",
          }}
        >
          {/* Hero Image */}
          <img
            src="/quiz-cover.png"
            alt="Success Path Quiz"
            style={{
              width: "100%",
              maxHeight: "220px",
              objectFit: "cover",
              borderRadius: 8,
              marginBottom: 12,
            }}
          />

          {/* Intro Text */}
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
              color: "#028c8f",
            }}
          >
            Discover Your Success Path
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 12 }}>
            <b>Your energy already knows how to move.</b> This quiz helps you hear it so you can step
            into your business flow.
          </p>

          <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 16 }}>
            It’s not a personality test. It’s a precision tool that tunes you into your most active
            Success Path to help you align with the energy shaping what comes next.
          </p>

          {/* Form */}
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <label
                htmlFor="name"
                style={{ fontSize: 14, fontWeight: 700, textAlign: "left" }}
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                aria-invalid={!!nameError}
                aria-describedby="name-error"
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 16,
                }}
              />
              {nameError && (
                <div
                  id="name-error"
                  style={{
                    color: "red",
                    fontSize: 14,
                    textAlign: "left",
                  }}
                >
                  {nameError}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <label
                htmlFor="email"
                style={{ fontSize: 14, fontWeight: 700, textAlign: "left" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 16,
                }}
              />
              {emailError && (
                <div
                  id="email-error"
                  style={{
                    color: "red",
                    fontSize: 14,
                    textAlign: "left",
                  }}
                >
                  {emailError}
                </div>
              )}
            </div>

            <label style={{ fontSize: 14, textAlign: "left" }}>
              <input
                type="checkbox"
                checked={gdpr}
                onChange={(e) => setGdpr(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              By entering your email, you agree to get your quiz results as well as insights and
              prompts for your next steps.
            </label>

            <button
              style={{
                ...btnGreen,
                opacity: isFormValid ? 1 : 0.6,
                justifySelf: "center",
                width: "fit-content",
              }}
              disabled={!isFormValid}
              onClick={handleStartClick}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = sqsGreenHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = sqsGreen)
              }
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  /* =========================
     Results Screen
     ========================= */
  if (submitted) {
    const res = resSubmitted;
    return (
      <div style={{ display: "grid", placeItems: "center", background: "#transparent" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 720,
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: 24,
            margin: "20px auto",
            textAlign: "center",
            background: "#fff",
          }}
        >
          <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, color: res.colour }}>
            Your Success Path is… {res.label}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ margin: "0 auto 20px auto", borderRadius: 12, padding: 20, textAlign: "left", background: `${res.colour}15`, border: `1px solid ${res.colour}40`, lineHeight: 1.8, fontSize: 16 }}
            dangerouslySetInnerHTML={{ __html: res.initial }}
          />

          <button
            style={{ ...btnGreen, justifySelf: "center", width: "fit-content" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = sqsGreenHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = sqsGreen)}
            onClick={() => {
              if (window.gtag) {
                window.gtag("event", "view_full_result", { event_category: "Quiz", event_label: res.label });
              }
              document.body.classList.add("fade-out");
              setTimeout(() => {
                window.top.location.href = res.url;
              }, 500);
            }}
          >
            See Your Full Result →
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     Question Screens
     ========================= */
  const q = questions[step - 1];
  const progress = Math.round(((step - 1) / questions.length) * 100);

  return (
    <div style={{ display: "grid", placeItems: "center", background: "#transparent" }}>
      <div style={{ width: "100%", maxWidth: 720, borderRadius: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", padding: 24, margin: "20px auto", background: "#fff" }}>
        {/* small confirmed banner */}
        {confirmedBanner && <div style={{ background: "#b9e08520", padding: 12, borderRadius: 8, marginBottom: 12, textAlign: "center" }}>Thanks for confirming — here’s your quiz</div>}

        {/* Progress */}
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
                  style={{ ...btnWhite }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = sqsGreenHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                  }}
                >
                  {o.text}
                </button>
              ))}
            </div>

            {step > 1 && (
              <div style={{ marginTop: 14 }}>
                <button onClick={handleBack} style={{ ...btnGreen, width: "fit-content" }} onMouseEnter={(e) => (e.currentTarget.style.background = sqsGreenHover)} onMouseLeave={(e) => (e.currentTarget.style.background = sqsGreen)}>
                  Back
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} // end of component

/* ==============================
   The End
============================== */
