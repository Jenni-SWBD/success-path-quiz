import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

/* =========================================================
   Quiz Questions
   ========================================================= */
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

/* =========================================================
   Results Content (first-page copy for each path)
   ========================================================= */
const results = {
  A: {
    label: "Impact",
    colour: "#ff0069",
    url: "https://jennijohnson.co.uk/quiz-sp-impact",
    initial: `
<p><b>This isn’t about getting louder. It’s about getting real.</b> You’ve done the talking, the showing up, the trying to make it land. And yet something’s still missing.</p>
<p>When you hold back the part of you that’s sharp, clear and unfiltered, your message loses weight. And you feel it, in your chest, in your timing, in that pause before you say what you really want to say.</p>
<p><b>You don’t need to prove your voice is powerful.</b> You just need to stop withholding it. This isn’t about being magnetic. It’s about being so real that what’s meant for you can actually find you.</p>
<p>For deeper insight and to connect with the energy of visibility, I've created a free <b>Impact Path guided visualisation</b> for you.</p>
<p>It’s short but powerful, designed to help you drop the filters and tune in to the truth of your own voice.</p>
<p>Let it land, don’t overthink it.</p>
    `,
  },
  B: {
    label: "Growth",
    colour: "#115e84",
    url: "https://jennijohnson.co.uk/quiz-sp-growth",
    initial: `
<p><b>This isn’t about growing faster. It’s about growing wiser.</b> You’ve chased the momentum, pushed when you had to and kept moving because that's what was expected. But something in you is done with that kind of growth.</p>
<p>Not all progress is aligned. Not all success is sustainable. You’re built for expansion, but only when it honours your energy and moves with clarity, not chaos.</p>
<p><b>You’re not here to burn out.</b> You’re here to build what lasts, what feels good in your body, not just what looks good on paper.</p>
<p>Let your growth be something you can <i>live</i>, not just measure.</p>
<p>To support you, I’ve recorded a free <b>Growth Path visualisation</b> to help clear the static, reconnect with what truly moves you and feel the energy behind your expansion.</p>
<p>Use it whenever you want to return to your own pace and wisdom.</p>
    `,
  },
  C: {
    label: "Balance",
    colour: "#9d125e",
    url: "https://jennijohnson.co.uk/quiz-sp-balance",
    initial: `
<p><b>This path isn’t about doing more. It’s about coming back to yourself.</b> You’re usually the one holding it all together. Reliable. Capable. On it.</p>
<p>But right now, your energy is calling you inward. Back to your own rhythm. Your own needs. Your own truth.</p>
<p>You crave less noise and more spaciousness. Less doing. More being. Not because you’re lost but because you’re finally ready to listen.</p>
<p><b>You don’t need to disappear or reinvent yourself.</b> You just need to come back to you. No need to overthink or analyse it. Just listen, notice what lands and let everything else be.</p>
<p>For a deep experience of what it feels like to embrace the energy of Balance, I invite you to listen to the <b>Balance Path guided visualisation</b> as a gift from me to you.</p>
<p>It's short, effective and will help you settle the mind chatter, return to centre and feel what wants to find its own natural rhythm.</p>
<p>Let yourself be present with it. There's nothing for you to do or be, just notice what you notice.</p>
    `,
  },
  D: {
    label: "Transformation",
    colour: "#000000",
    url: "https://jennijohnson.co.uk/quiz-sp-transformation",
    initial: `
<p><b>This path isn’t about fixing. It’s about becoming.</b></p>
<p>You’re in it … the shift, the stretch, the space between. Where something old is falling away and something new is forming… even if you can’t name it yet.</p>
<p>You may not know what’s next, but you know what no longer fits. This isn’t about things breaking down – it’s about <i>you</i> breaking through.</p>
<p><b>There’s no rush to try and figure it all out.</b> You’re not lost. You’re being remade. Just tune in, feel the shift and trust what begins to move.</p>
<p>For deeper insight and to support your transformation, I invite you to listen to the <b>Transformation Path guided visualisation</b> I've created for you.</p>
<p>It’s short but powerful, designed to help you loosen what’s ready to release and welcome in the new energy that's rising for you.</p>
    `,
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
      } catch (_) {
        // ignore cross-origin errors
      }
    };

    // Initial fire
    postHeight();

    // Observe content size changes
    const ro = new ResizeObserver(postHeight);
    ro.observe(document.body);

    // Also post after small delays to catch font/images
    const t1 = setTimeout(postHeight, 150);
    const t2 = setTimeout(postHeight, 400);
    const t3 = setTimeout(postHeight, 800);

    // Cleanup
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
  const isFormValid =
    validateName(name) === "" && validateEmail(email) === "" && gdpr;

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
    const winner = calcResult();
    const payload = {
      dateISO: new Date().toISOString(),
      name,
      email,
      gdpr,
      answers,
      successPath: results[winner].label,
    };

    fetch("/api/saveResult", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Silent fail; UI still shows result
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  /* =========================
     Intro Screen
     ========================= */
  if (step === 0) {
    return (
      <div style={{ display: "grid", placeItems: "center", background: "#fff" }}>
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

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            <b>Your energy already knows how to move.</b> This quiz helps you
            hear it so you can step into your business flow.
          </p>

          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            It’s not a personality test. It’s a precision tool that tunes you
            into your most active Success Path to help you align with the energy
            shaping what comes next.
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
                  style={{ color: "red", fontSize: 14, textAlign: "left" }}
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
                  style={{ color: "red", fontSize: 14, textAlign: "left" }}
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
              By entering your email, you agree to get your quiz results as well
              as insights and prompts for your next steps.
            </label>

            <button
              style={{
                ...btnGreen,
                opacity: isFormValid ? 1 : 0.6,
                justifySelf: "center",
                width: "fit-content",
              }}
              disabled={!isFormValid}
              onClick={() => setStep(1)}
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
    const winner = calcResult();
    const res = results[winner];

    return (
      <div style={{ display: "grid", placeItems: "center", background: "#fff" }}>
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
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 16,
              color: res.colour,
            }}
          >
            Your Success Path is… {res.label}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              margin: "0 auto 20px auto",
              borderRadius: 12,
              padding: 20,
              textAlign: "left",
              background: `${res.colour}15`,
              border: `1px solid ${res.colour}40`,
              lineHeight: 1.8,
              fontSize: 16,
            }}
            dangerouslySetInnerHTML={{ __html: res.initial }}
          />

          <button
            style={{
              ...btnGreen,
              justifySelf: "center",
              width: "fit-content",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = sqsGreenHover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = sqsGreen)
            }
            onClick={() => (window.location.href = res.url)}
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
    <div style={{ display: "grid", placeItems: "center", background: "#fff" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          padding: 24,
          margin: "20px auto",
          background: "#fff",
        }}
      >
        {/* Progress */}
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
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              {q.text}
            </h2>

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
                <button
                  onClick={handleBack}
                  style={{ ...btnGreen, width: "fit-content" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = sqsGreenHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = sqsGreen)
                  }
                >
                  Back
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
