import React, { useState, useEffect } from "react";
import { saveChart } from "../utils/supabase.js";
import { trackUserEvent } from "../utils/events.js";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`;

const BG = "#1c1c21";
const COPPER = "#a05c28";
const CREAM = "#f0ebe2";
const MUTED = "#888690";
const DIM = "#606068";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#2c1f14";

export function ResultsFlow({
  step,
  spheres, connections, ranked,
  selectedFocusSphereId, setSelectedFocusSphereId,
  selectedGoalId, setSelectedGoalId,
  focusRound,
  completedGoals,
  setActiveGoals,
  setStep,
  session,
  DevReset,
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);
  const fadeStyle = { opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" };

  // ── FOCUS ──
  if (step === "focus") {
    const recommended = ranked[0];
    const focusSphere = spheres.find(b => b.id === selectedFocusSphereId) || recommended;
    const availableSpheres = ranked.filter(b => b.goals.some(g => !completedGoals.has(g.id)));
    const roundLabels = ["first", "second", "third"];

    return (
      <div className="min-h-screen lg:flex" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <DevReset />
        <div className="hidden lg:block flex-shrink-0 transition-colors duration-300" style={{ width: "350px", background: focusSphere?.color || COPPER }} />
        <div className="px-6 py-12 max-w-2xl mx-auto w-full lg:px-16 lg:flex lg:flex-col lg:justify-center" style={fadeStyle}>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: MUTED }}>Focus {roundLabels[focusRound]} sphere</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600, color: CREAM }} className="mb-1">
            {focusRound === 0 ? "Choose a sphere to focus on" : "Pick a new focus sphere"}
          </h2>
          <p className="text-sm mb-8" style={{ color: MUTED, fontWeight: 300 }}>
            {focusRound === 0
              ? "Based on your connections, we recommend starting here — but you can choose any sphere below."
              : "Choose another sphere to focus on next."}
          </p>
          <p className="text-xs uppercase tracking-wider mb-3" style={{ color: MUTED }}>Choose a sphere</p>
          <div className="space-y-2 mb-8">
            {availableSpheres.map((b, i) => {
              const isSelected = selectedFocusSphereId === b.id || (!selectedFocusSphereId && b.id === recommended?.id);
              const isRecommended = b.id === recommended?.id && focusRound === 0;
              return (
                <button key={b.id} onClick={() => setSelectedFocusSphereId(b.id)}
                  className="w-full text-left border-2 transition-all"
                  style={{
                    borderColor: isSelected ? b.color : "#3a3a40",
                    background: CARD_BG,
                    boxShadow: isSelected ? `inset 0 0 0 9999px ${b.color}28` : "none",
                    padding: isRecommended ? "1.25rem 1.25rem" : "0.875rem 1.25rem",
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: b.color }} />
                    <span className="font-semibold flex-1"
                      style={{ color: CARD_BORDER, fontFamily: isRecommended ? "'Playfair Display', serif" : "inherit", fontSize: isRecommended ? "1.1rem" : "0.9rem" }}>
                      {b.name}
                    </span>
                    {isRecommended && (
                      <span className="text-xs px-2 py-0.5 text-white flex-shrink-0" style={{ background: COPPER, letterSpacing: "0.04em" }}>WE RECOMMEND THIS</span>
                    )}
                  </div>
                  {isRecommended && b.goals.length > 0 && (
                    <div className="mt-3 ml-6 space-y-1">
                      {b.goals.map(g => (
                        <div key={g.id} className="flex items-center gap-2 text-sm" style={{ color: "#4a3828" }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                          {g.text}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(focusRound === 0 ? "chart" : "active")}
              className="px-6 py-3 text-sm font-medium"
              style={{ color: MUTED, border: `1px solid #3a3a40` }}>
              {focusRound === 0 ? "← Back" : "Skip"}
            </button>
            <button
              onClick={() => {
                trackUserEvent(session, "focus_selected", {
                  sphere_id: focusSphere?.id,
                  sphere_name: focusSphere?.name,
                });
                setSelectedGoalId(null);
                setStep("action");
              }}
              className="flex-1 py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: COPPER, color: CREAM }}>
              Focus on {focusSphere?.name} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTION ──
  if (step === "action") {
    const focusSphere = spheres.find(b => b.id === selectedFocusSphereId) || ranked[0];

    return (
      <div className="min-h-screen lg:flex" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <DevReset />
        <div className="hidden lg:block flex-shrink-0 transition-colors duration-300" style={{ width: "350px", background: focusSphere?.color || COPPER }} />
        <div className="px-6 py-12 max-w-2xl mx-auto w-full lg:px-16 lg:flex lg:flex-col lg:justify-center" style={fadeStyle}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ background: focusSphere?.color }} />
            <p className="text-xs uppercase tracking-widest" style={{ color: MUTED }}>{focusSphere?.name}</p>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600, color: CREAM }} className="mb-1">Choose a goal to work on</h2>
          <p className="text-sm mb-8" style={{ color: MUTED, fontWeight: 300 }}>Pick one goal to make active. We'll build a plan together in your next step.</p>
          <div className="space-y-2 mb-8">
            {(() => {
              const availableGoals = focusSphere?.goals.filter(g => !completedGoals.has(g.id)) || [];
              return availableGoals.length > 0 ? availableGoals.map(g => (
                <button key={g.id} onClick={() => setSelectedGoalId(g.id)}
                  className="w-full flex items-center gap-3 p-4 border-2 transition-all text-left"
                  style={{
                    borderColor: selectedGoalId === g.id ? focusSphere.color : "#3a3a40",
                    background: CARD_BG,
                    boxShadow: selectedGoalId === g.id ? `inset 0 0 0 9999px ${focusSphere.color}28` : "none",
                  }}>
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ borderColor: focusSphere.color, background: selectedGoalId === g.id ? focusSphere.color : CARD_BG }}>
                    {selectedGoalId === g.id && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <span className="text-sm font-medium" style={{ color: CARD_BORDER }}>{g.text}</span>
                </button>
              )) : (
                <p className="text-sm" style={{ color: MUTED }}>All goals in this sphere are complete. Pick a different sphere.</p>
              );
            })()}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("focus")} className="px-6 py-3 text-sm font-medium" style={{ color: MUTED, border: "1px solid #3a3a40" }}>← Back</button>
            <button
              disabled={!selectedGoalId}
              onClick={() => {
                const goal = focusSphere?.goals.find(g => g.id === selectedGoalId);
                const newActiveGoals = [{
                  sphereId: focusSphere?.id,
                  sphereName: focusSphere?.name,
                  sphereColor: focusSphere?.color,
                  goalId: selectedGoalId,
                  goalText: goal?.text,
                  actionItems: []
                }];
                setActiveGoals(newActiveGoals);
                setStep("intro-active");
                saveChart(session, { spheres, connections, activeGoals: newActiveGoals });
              }}
              className="flex-1 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-30"
              style={{ background: COPPER, color: CREAM }}>
              Confirm & see my plan →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
