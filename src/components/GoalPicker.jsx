import React, { useState, useEffect } from "react";
import { Nav } from "./Nav.jsx";
import { saveChart } from "../utils/supabase.js";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;

const BG = "var(--ly-bg)";
const COPPER = "#a05c28";
const CREAM = "#f0ebe2";
const MUTED = "#888690";
const CARD_BG = "#ffffff";
const CARD_BORDER = "#2c1f14";

export function GoalPicker({
  spheres,
  activeGoals, setActiveGoals,
  completedGoals,
  connections,
  checkedItems,
  session,
  setStep,
  setFocusRound,
  setAuthPrompt,
  isMobile,
  isPaid,
  isPro,
  selectedTheme,
}) {
  const MAX_GOALS_FREE = 1;
  const MAX_GOALS_PAID = 5;
  const atFreeLimit = !isPaid && activeGoals.length >= MAX_GOALS_FREE;
  const atPaidLimit = !isPro && activeGoals.length >= MAX_GOALS_PAID;
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const trackedGoalIds = new Set([
    ...activeGoals.map(ag => ag.goalId),
    ...completedGoals,
  ]);

  const handlePick = (sphere, goal) => {
    const newGoal = {
      sphereId: sphere.id,
      sphereName: sphere.name,
      sphereColor: sphere.color,
      goalId: goal.id,
      goalText: goal.text,
      actionItems: [],
    };
    const updated = [...activeGoals, newGoal];
    setActiveGoals(updated);
    setFocusRound(1);
    saveChart(session, {
      spheres,
      connections,
      activeGoals: updated,
      checkedItems,
      completedGoals,
    });
    setStep("active");
  };

  const spheresWithGoals = spheres.filter(s =>
    (s.goals || []).some(g => !trackedGoalIds.has(g.id))
  );

  const spheresWithNoGoals = spheres.filter(s => (s.goals || []).length === 0);

  return (
    <div className="min-h-screen lg:flex" style={{ background: BG, fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}</style>

      <div className="hidden lg:block flex-shrink-0" style={{ width: "350px", background: COPPER }} />

      <div className="w-full lg:flex-1 lg:flex lg:flex-col">
        <Nav step="active" setStep={setStep} isMobile={isMobile} isPaid={isPaid} activeGoals={activeGoals} />

        <div className="px-6 py-10 max-w-2xl mx-auto w-full lg:px-16 pb-24 lg:pb-12" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}>

          <button
            onClick={() => setStep("active")}
            style={{ fontSize: "12px", color: MUTED, background: "none", border: "none", padding: "0 0 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
          >
            ← Back
          </button>

          <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>
            Add a goal
          </p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 600, color: "var(--ly-ink)", margin: "0 0 6px" }}>
            What do you want to work on?
          </h2>
          <p style={{ fontSize: "0.875rem", color: MUTED, fontWeight: 300, margin: "0 0 28px", lineHeight: 1.6 }}>
            Pick a goal from any sphere below. You can work on multiple goals at once.
          </p>

          {atPaidLimit ? (
            <div style={{ border: `1px solid #3a3a40`, background: CARD_BG, padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: CARD_BORDER, margin: "0 0 8px" }}>
                You've reached the goal limit
              </p>
              <p style={{ fontSize: "13px", color: "#8a7455", fontWeight: 300, margin: "0 0 20px", lineHeight: 1.5 }}>
                You can track up to 5 goals at once. Complete or remove one before adding another.
              </p>
              <button
                onClick={() => setStep("active")}
                style={{ background: COPPER, color: CREAM, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", padding: "10px 24px", border: "none", cursor: "pointer" }}
              >
                BACK TO MY GOALS →
              </button>
            </div>
          ) : atFreeLimit ? (
            <button
              onClick={() => setAuthPrompt("upgrade")}
              className="w-full text-left border-2 transition-all hover:opacity-90"
              style={{ borderColor: "var(--ly-border-mid)", borderStyle: "dashed", background: "var(--ly-surface)" }}
            >
              <div className="px-5 py-4 flex items-center gap-3">
                <span style={{ fontSize: "1rem" }}>🔒</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--ly-ink)" }}>Track a second goal</p>
                  <p className="text-xs" style={{ color: MUTED }}>Upgrade to track multiple goals at once</p>
                </div>
                <span className="text-xs font-semibold" style={{ color: COPPER }}>Upgrade →</span>
              </div>
            </button>
          ) : spheresWithGoals.length === 0 && spheresWithNoGoals.length === 0 ? (
            <div style={{ border: `1px solid #3a3a40`, background: CARD_BG, padding: "32px 24px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: CARD_BORDER, margin: "0 0 8px" }}>
                All goals are already active
              </p>
              <p style={{ fontSize: "13px", color: "#8a7455", fontWeight: 300, margin: "0 0 20px", lineHeight: 1.5 }}>
                You're already tracking every goal in your chart. Complete one first, or start fresh.
              </p>
              <button
                onClick={() => setStep("active")}
                style={{ background: COPPER, color: CREAM, fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em", padding: "10px 24px", border: "none", cursor: "pointer" }}
              >
                BACK TO MY GOALS →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {spheres.map(sphere => {
                const available = (sphere.goals || []).filter(g => !trackedGoalIds.has(g.id));
                const allActive = (sphere.goals || []).length > 0 && available.length === 0;

                if ((sphere.goals || []).length === 0) return null;

                return (
                  <div key={sphere.id} style={{ border: `1px solid #3a3a40`, background: CARD_BG }}>
                    <div style={{ background: sphere.color, padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "white", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                        {sphere.name}
                      </span>
                      {allActive && (
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                          all goals active
                        </span>
                      )}
                    </div>
                    {allActive ? (
                      <div style={{ padding: "12px 18px" }}>
                        <p style={{ fontSize: "12px", color: "#8a7455", margin: 0, fontStyle: "italic" }}>
                          You're already working on all goals in this sphere.
                        </p>
                      </div>
                    ) : (
                      <div>
                        {available.map((goal, idx) => (
                          <button
                            key={goal.id}
                            onClick={() => handlePick(sphere, goal)}
                            style={{
                              width: "100%", textAlign: "left", padding: "14px 18px",
                              borderBottom: idx < available.length - 1 ? "1px solid #f0ebe3" : "none",
                              background: CARD_BG, border: "none", cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#faf8f5"}
                            onMouseLeave={e => e.currentTarget.style.background = CARD_BG}
                          >
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: CARD_BORDER, margin: 0, lineHeight: 1.4 }}>
                              {goal.text}
                            </p>
                            <span style={{ fontSize: "14px", color: sphere.color, flexShrink: 0 }}>→</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
