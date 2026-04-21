import { useState, useEffect } from "react";
import { FONTS, BUSINESS_SPHERES, BUSINESS_SPHERE_REASONS, BUSINESS_GOAL_SUGGESTIONS } from "../constants.js";
import { TriangleLogo } from "./TriangleLogo.jsx";

const BG = "#1c1c21";
const COPPER = "#a05c28";
const CREAM = "#f0ebe2";
const MUTED = "#888690";
const DIM = "#606068";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#2c1f14";

const BUSINESS_SPHERE_COLORS_LOCAL = [
  "#b5693a", "#4a7c8e", "#6b8f71", "#c4973a", "#7a5c8a",
  "#4a7a72", "#8a5c5c", "#5c7a8a", "#8a7a4a",
];

function makeSpheres(names) {
  return names.map((name, i) => ({
    id: `s${i}`,
    name,
    color: BUSINESS_SPHERE_COLORS_LOCAL[i % BUSINESS_SPHERE_COLORS_LOCAL.length],
    goals: (BUSINESS_GOAL_SUGGESTIONS[name] || []).map((text, j) => ({ id: `g${i}_${j}`, text })),
  }));
}

export function BizWelcome({ setStep }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONTS}{`
        @keyframes slowFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Decorative network background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.12 }}>
        <svg width="100%" height="100%" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice">
          <line x1="180" y1="150" x2="450" y2="300" stroke={COPPER} strokeWidth="1"/>
          <line x1="450" y1="300" x2="720" y2="180" stroke={COPPER} strokeWidth="1"/>
          <line x1="720" y1="180" x2="600" y2="420" stroke={COPPER} strokeWidth="1"/>
          <line x1="600" y1="420" x2="300" y2="450" stroke={COPPER} strokeWidth="1"/>
          <line x1="300" y1="450" x2="180" y2="150" stroke={COPPER} strokeWidth="1"/>
          <line x1="450" y1="300" x2="300" y2="450" stroke={COPPER} strokeWidth="1"/>
          <line x1="720" y1="180" x2="300" y2="450" stroke={COPPER} strokeWidth="1"/>
          <circle cx="180" cy="150" r="6" fill={COPPER}/>
          <circle cx="450" cy="300" r="8" fill={COPPER}/>
          <circle cx="720" cy="180" r="6" fill={COPPER}/>
          <circle cx="600" cy="420" r="5" fill={COPPER}/>
          <circle cx="300" cy="450" r="7" fill={COPPER}/>
        </svg>
      </div>

      <div
        className="relative z-10 w-full max-w-lg text-center"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}
      >
        <div className="flex justify-center mb-8">
          <TriangleLogo size={64} />
        </div>

        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: COPPER, letterSpacing: "0.18em" }}>
          Lyminal Strategy
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.6rem", fontWeight: 600,
            color: CREAM, lineHeight: 1.2,
          }}
          className="mb-5"
        >
          Where to focus first —<br />
          <em style={{ color: COPPER }}>without the debate</em>
        </h1>

        <p className="text-sm leading-relaxed mb-4" style={{ color: "#c8c0b4", fontWeight: 300, maxWidth: "400px", margin: "0 auto 1rem" }}>
          Map how your business priorities depend on each other. Surface what to focus on first — before the loudest voice in the room decides for you.
        </p>

        <p className="text-sm leading-relaxed mb-10" style={{ color: MUTED, fontWeight: 300, maxWidth: "380px", margin: "0 auto 2.5rem" }}>
          Built for leaders, strategy teams, and founders navigating complexity and competing priorities.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setStep("biz-survey-1")}
            className="w-full py-4 transition-opacity hover:opacity-85"
            style={{ background: COPPER, color: "#f5e8d8", fontWeight: 500, letterSpacing: "0.08em", fontSize: "0.85rem" }}
          >
            GET STARTED →
          </button>
          <p className="text-xs" style={{ color: DIM }}>
            Takes about 10 minutes. No account required.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-6 text-left">
          {[
            { label: "Map dependencies", desc: "See which priorities unlock the most downstream impact." },
            { label: "Cut through noise", desc: "Let structure drive decisions, not seniority or persuasion." },
            { label: "Move with clarity", desc: "Walk away knowing exactly where to focus first." },
          ].map(v => (
            <div key={v.label}>
              <div className="w-6 h-px mb-3" style={{ background: COPPER }} />
              <p className="text-xs font-semibold mb-1" style={{ color: CREAM }}>{v.label}</p>
              <p className="text-xs leading-relaxed" style={{ color: DIM }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BizSurvey1({ setStep, setSpheres, setBusinessMode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONTS}</style>
      <div style={{ maxWidth: "540px", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }} className="w-full">
        <div className="flex justify-center mb-6">
          <TriangleLogo size={56} />
        </div>
        <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: COPPER, letterSpacing: "0.12em" }}>
          Let's get you set up
        </p>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 600, color: CREAM, lineHeight: 1.3 }}
          className="mb-3"
        >
          I need Lyminal for...
        </h2>
        <p className="text-sm mb-10" style={{ color: MUTED, fontWeight: 300 }}>
          We'll suggest the right starting point based on your answer.
        </p>
        <div className="space-y-3 text-left">
          {[
            { key: "business", label: "My business", desc: "Map priorities across your whole company — by stage, function, and focus area." },
            { key: "team",     label: "My team",     desc: "Align a specific team around goals, blockers, and what to prioritise first." },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => {
                setBusinessMode(opt.key);
                if (opt.key === "team") {
                  setSpheres(makeSpheres(BUSINESS_SPHERES.team));
                  setStep("biz-recommended");
                } else {
                  setStep("biz-survey-2");
                }
              }}
              className="w-full text-left p-5 border-2 transition-all hover:opacity-90"
              style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            >
              <p className="font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: CARD_BORDER }}>
                {opt.label}
              </p>
              <p className="text-sm" style={{ color: "#6e5c4a" }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BizSurvey2({ setStep, setSpheres, setBusinessStage }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONTS}</style>
      <div style={{ maxWidth: "540px", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }} className="w-full">
        <div className="flex justify-center mb-6">
          <TriangleLogo size={56} />
        </div>
        <p className="text-xs uppercase tracking-widest mb-3 font-medium" style={{ color: COPPER, letterSpacing: "0.12em" }}>
          One more question
        </p>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 600, color: CREAM, lineHeight: 1.3 }}
          className="mb-3"
        >
          Where is your business right now?
        </h2>
        <p className="text-sm mb-10" style={{ color: MUTED, fontWeight: 300 }}>
          We'll suggest spheres that match your stage.
        </p>
        <div className="space-y-3 text-left">
          {[
            { key: "startup", label: "Startup",        desc: "Early stage — still finding product-market fit, building foundations, raising capital." },
            { key: "small",   label: "Small business",  desc: "Established but lean — focused on sustainable growth and operational stability." },
            { key: "growing", label: "Growing company", desc: "Scaling fast — managing increasing complexity across functions and teams." },
            { key: "mature",  label: "Mature company",  desc: "Established operations — focused on efficiency, compliance, and long-term strategy." },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => {
                setBusinessStage(opt.key);
                setSpheres(makeSpheres(BUSINESS_SPHERES[opt.key]));
                setStep("biz-recommended");
              }}
              className="w-full text-left p-5 border-2 transition-all hover:opacity-90"
              style={{ background: CARD_BG, borderColor: CARD_BORDER }}
            >
              <p className="font-semibold mb-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: CARD_BORDER }}>
                {opt.label}
              </p>
              <p className="text-sm" style={{ color: "#6e5c4a" }}>{opt.desc}</p>
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep("biz-survey-1")}
          className="mt-8 text-xs hover:opacity-70 transition-opacity"
          style={{ color: DIM }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

export function BizRecommended({ setStep, spheres, setSpheres, businessMode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  return (
    <div
      className="min-h-screen lg:flex"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      <style>{FONTS}{`
        @keyframes slideInRow{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Left colour strip */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: "350px", background: COPPER }} />

      {/* Content */}
      <div
        className="px-6 py-16 w-full max-w-2xl mx-auto lg:px-16 lg:flex lg:flex-col lg:justify-center"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}
      >
        <p className="text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: COPPER }}>
          Your starting point
        </p>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600, color: CREAM }}
          className="mb-2"
        >
          Here's what we recommend
        </h2>
        <p className="text-sm mb-8" style={{ color: MUTED, fontWeight: 300 }}>
          Based on your answers, these are the spheres we suggest. Add, remove, or rename anything that doesn't fit — this is your map.
        </p>

        <div className="border-2 rounded-2xl p-6 mb-6" style={{ borderColor: COPPER, background: CARD_BG }}>
          <div className="space-y-2">
            {spheres.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center rounded-lg px-4 py-2.5"
                style={{
                  background: CARD_BG,
                  border: "1.5px solid #2c1f14",
                  opacity: 0,
                  animation: "slideInRow 0.65s ease-out forwards",
                  animationDelay: `${i * 200}ms`,
                }}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0 mr-3" style={{ background: s.color }} />
                <span className="text-sm font-medium flex-1" style={{ color: CARD_BORDER }}>{s.name}</span>
                {BUSINESS_SPHERE_REASONS[s.name] && (
                  <span className="text-xs ml-4 text-right hidden sm:block" style={{ color: "#8a7455", maxWidth: "200px" }}>
                    {BUSINESS_SPHERE_REASONS[s.name]}
                  </span>
                )}
                <button
                  onClick={() => setSpheres(prev => prev.filter(b => b.id !== s.id))}
                  className="ml-4 text-xs hover:opacity-70 flex-shrink-0 transition-opacity"
                  style={{ color: "#8a7455" }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(businessMode === "team" ? "biz-survey-1" : "biz-survey-2")}
            className="px-6 py-3 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "#a8a0b0", border: "1px solid #d4c9bb" }}
          >
            ← Back
          </button>
          <button
            onClick={() => setStep("intro-spheres")}
            className="flex-1 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: COPPER, color: "#f5e8d8" }}
          >
            Edit my spheres →
          </button>
        </div>
      </div>
    </div>
  );
}
