import React, { useState, useEffect } from "react";
import { SphereConnCard } from "./SphereConnCard.jsx";
import { SUGGESTED_SPHERES, GOAL_SUGGESTIONS, PALETTE, SPHERE_COLOR_MAP, BUSINESS_SPHERES, BUSINESS_GOAL_SUGGESTIONS } from "../constants.js";
import { saveChart } from "../utils/supabase.js";
import { trackUserEvent } from "../utils/events.js";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;

const Pill = ({ b, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
    style={{ background: b.color + "18", border: `1px solid ${b.color}40`, color: b.color }}>
    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
    <span>{b.name}</span>
    {onRemove && (
      <button onClick={onRemove} className="ml-1 opacity-50 hover:opacity-100 text-xs leading-none">✕</button>
    )}
  </div>
);

export function FlowScreens({
  step,
  spheres, setSpheres,
  newSphere, setNewSphere,
  newGoal, setNewGoal,
  goalStep, setGoalStep,
  connections, setConnections,
  setSelectedId,
  setStep,
  session,
  DevReset,
  selectedTheme,
  businessMode,
  businessStage,
}) {
  const COPPER = "#a05c28";
  const accentColor = COPPER;
  const addSphere = (name) => {
    const n = name.trim();
    if (!n || spheres.some(b => b.name.toLowerCase() === n.toLowerCase())) return;
    const sphereId = `b${Date.now()}`;
    setSpheres(prev => [...prev, { id: sphereId, name: n, color: SPHERE_COLOR_MAP[n] || PALETTE[prev.length % PALETTE.length], goals: [] }]);
    trackUserEvent(session, "sphere_created", { sphere_name: n, sphere_id: sphereId });
    setNewSphere("");
  };

  const removeSphere = (id) => {
    setSpheres(prev => prev.filter(b => b.id !== id));
    setConnections(prev => {
      const n = { ...prev };
      delete n[id];
      Object.keys(n).forEach(k => { n[k] = (n[k] || []).filter(t => t !== id); });
      return n;
    });
  };

  const addGoal = (sphereId, text) => {
    const t = text.trim();
    if (!t) return;
    const goalId = `g${Date.now()}`;
    setSpheres(p => p.map(b =>
      b.id === sphereId ? { ...b, goals: [...b.goals, { id: goalId, text: t }] } : b
    ));
    trackUserEvent(session, "goal_created", { sphere_id: sphereId, goal_id: goalId });
    setNewGoal("");
  };

  const removeGoal = (sphereId, goalId) => {
    setSpheres(p => p.map(b =>
      b.id === sphereId ? { ...b, goals: b.goals.filter(g => g.id !== goalId) } : b
    ));
  };

  const toggleConn = (fromId, toId) => {
    const existing = connections[fromId] || [];
    const isAdding = !existing.includes(toId);
    setConnections(p => {
      const curr = p[fromId] || [];
      return { ...p, [fromId]: curr.includes(toId) ? curr.filter(t => t !== toId) : [...curr, toId] };
    });
    if (isAdding) {
      trackUserEvent(session, "influence_connection_created", { from_sphere_id: fromId, to_sphere_id: toId });
    }
  };

  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  // ── SPHERES ──
  if (step === "spheres") return (
    <div className="min-h-screen lg:flex" style={{ background: "#1c1c21", fontFamily: "'Inter', sans-serif" }}>
      <style>{FONTS}</style>
      <DevReset />
      <div className="hidden lg:block flex-shrink-0" style={{ width: "350px", background: accentColor }} />
      <div className="px-6 py-16 max-w-2xl mx-auto w-full lg:px-16 lg:flex lg:flex-col lg:justify-center" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
        <div className="mb-2 text-xs uppercase tracking-widest font-medium" style={{ color: "#f0ebe2", opacity: 0.5 }}>Step 1 of 3</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600, color: "#f0ebe2" }} className="mb-2">Define your spheres</h2>
        <p className="mb-8" style={{ color: "#f0ebe2", opacity: 0.6 }}>
          {businessMode
            ? "The priority areas of your business. Edit, remove, or add anything that doesn't fit your situation."
            : "What are the major areas of your life right now? Add what's relevant to you."}
        </p>
        <div className="mb-8" style={{ background: "white", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "20px" }}>
          <div className="relative flex items-center mb-5">
            <input
              className="w-full rounded-xl px-4 py-3 pr-20 text-base outline-none transition-colors"
              placeholder={businessMode ? "e.g. Product Development, Finance..." : "Type a sphere name..."}
              value={newSphere}
              onChange={e => setNewSphere(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSphere(newSphere)}
              style={{ background: "#faf8f5", border: "1.5px solid #d4c9bb", color: "#1c1410" }}
            />
            <button
              onClick={() => addSphere(newSphere)}
              disabled={!newSphere.trim()}
              className="absolute right-2 px-3 py-1.5 text-xs font-semibold transition-all"
              style={{
                background: newSphere.trim() ? accentColor : "transparent",
                color: newSphere.trim() ? "white" : "#8a7455",
                border: newSphere.trim() ? "none" : "1px solid #d4c9bb",
                opacity: newSphere.trim() ? 1 : 0.5,
                letterSpacing: "0.04em"
              }}
            >ADD</button>
          </div>
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: "#8a7455" }}>Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {(businessMode ? BUSINESS_SPHERES[businessStage || "startup"] : SUGGESTED_SPHERES).filter(s => !spheres.some(b => b.name.toLowerCase() === s.toLowerCase())).map(s => (
                <button key={s} onClick={() => addSphere(s)} className="px-3 py-1.5 text-xs transition-colors"
                  style={{ borderRadius: "4px", border: "1px solid #d4c9bb", color: "#5c4e40", background: "#faf8f5" }}>
                  + {s}
                </button>
              ))}
            </div>
          </div>
          {spheres.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wider mb-3 font-medium" style={{ color: "#8a7455" }}>Your spheres ({spheres.length})</p>
              <div className="flex flex-wrap gap-2">
                {spheres.map(b => <Pill key={b.id} b={b} onRemove={() => removeSphere(b.id)} />)}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep(businessMode ? "intro-spheres" : "welcome")} className="px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "#f0ebe2", opacity: 0.5, border: "1px solid rgba(255,255,255,0.15)" }}>
            ← Back
          </button>
          <button
            onClick={() => {
              trackUserEvent(session, "spheres_setup_completed", { spheres_count: spheres.length });
              setGoalStep(0);
              setStep("intro-goals");
              saveChart(session, { spheres, connections });
            }}
            disabled={spheres.length < 3}
            style={{ background: accentColor, color: "white", fontWeight: 500 }}
            className="flex-1 hover:opacity-90 disabled:opacity-30 py-3 transition-opacity"
          >
            {spheres.length < 3 ? `Add at least ${3 - spheres.length} more sphere${3 - spheres.length === 1 ? "" : "s"} to continue` : `Continue with ${spheres.length} spheres →`}
          </button>
        </div>
      </div>
    </div>
  );

  // ── GOALS ──
  if (step === "goals") {
    const currentSphere = spheres[goalStep];
    const isLast = goalStep === spheres.length - 1;

    return (
      <div className="min-h-screen lg:flex" style={{ background: "#1c1c21", fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <DevReset />
        <div className="hidden lg:block flex-shrink-0 transition-colors duration-300" style={{ width: "350px", background: currentSphere?.color || accentColor }} />
        <div className="px-6 py-16 max-w-2xl mx-auto w-full lg:px-16 lg:flex lg:flex-col lg:justify-center" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "#f0ebe2", opacity: 0.5 }}>Step 2 of 3 — Goals</span>
              <span className="text-xs" style={{ color: "#f0ebe2", opacity: 0.5 }}>{goalStep + 1} of {spheres.length}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((goalStep + 1) / spheres.length) * 100}%`, background: currentSphere?.color || accentColor }} />
            </div>
            <div className="flex gap-1 mt-2">
              {spheres.map((b, i) => (
                <div key={b.id} className="h-1 rounded-full flex-1 transition-all duration-300" style={{ background: i <= goalStep ? b.color : b.color + "25" }} />
              ))}
            </div>
          </div>
          {currentSphere && (
            <div key={`goal-${goalStep}`} style={{ animation: "fadeIn 0.25s ease-out" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ background: currentSphere.color }} />
                <h2 style={{ color: currentSphere.color, fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600 }}>{currentSphere.name}</h2>
              </div>
              <p className="mb-8" style={{ color: "#f0ebe2", opacity: 0.6 }}>What do you want to achieve in this area? Add as many goals as you like, or skip ahead.</p>
              <div className="border-2 rounded-2xl p-6 mb-6" style={{ borderColor: currentSphere.color + "50", background: "#ffffff" }}>
                {currentSphere.goals.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {currentSphere.goals.map(g => (
                      <div key={g.id} className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "#faf8f5", border: "1px solid #e8e0d5" }}>
                        <span className="text-sm" style={{ color: "#1c1410" }}>{g.text}</span>
                        <button onClick={() => removeGoal(currentSphere.id, g.id)} className="ml-3 text-xs hover:opacity-70 transition-opacity" style={{ color: "#8a7455" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    placeholder={businessMode ? "e.g. Secure Series A, launch MVP..." : `Add a goal for ${currentSphere.name}...`}
                    value={newGoal}
                    onChange={e => setNewGoal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addGoal(currentSphere.id, newGoal); }}
                    style={{ background: "#ffffff", border: "2px solid #e8e0d5", color: "#1c1410" }}
                  />
                  <button onClick={() => addGoal(currentSphere.id, newGoal)}
                    className="text-white font-bold px-4 transition-colors text-sm rounded-xl"
                    style={{ background: currentSphere.color }}>
                    Add
                  </button>
                </div>
                {(businessMode ? BUSINESS_GOAL_SUGGESTIONS : GOAL_SUGGESTIONS)[currentSphere.name] && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: "#8a7455" }}>Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {(businessMode ? BUSINESS_GOAL_SUGGESTIONS : GOAL_SUGGESTIONS)[currentSphere.name]
                        .filter(s => !currentSphere.goals.some(g => g.text.toLowerCase() === s.toLowerCase()))
                        .map(s => (
                          <button key={s} onClick={() => addGoal(currentSphere.id, s)}
                            className="px-3 py-1 text-xs transition-colors"
                            style={{ borderRadius: "2px", border: `1px solid ${currentSphere.color}40`, color: currentSphere.color, background: currentSphere.color + "08" }}>
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => goalStep === 0 ? setStep("spheres") : setGoalStep(g => g - 1)}
              className="px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#f0ebe2", opacity: 0.5, border: "1px solid rgba(255,255,255,0.15)" }}>
              ← Back
            </button>
            <button
              onClick={() => {
                if (isLast) {
                  const goalsCount = spheres.reduce((sum, s) => sum + (s.goals?.length || 0), 0);
                  trackUserEvent(session, "goals_setup_completed", { goals_count: goalsCount });
                  setGoalStep(0);
                  setStep("intro-connections");
                } else {
                  setGoalStep(g => g + 1);
                }
              }}
              className="flex-1 text-white font-bold py-3 transition-colors"
              style={{ background: currentSphere?.color || accentColor }}>
              {isLast ? "Map relationships →" : `Next: ${spheres[goalStep + 1]?.name} →`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── CONNECTIONS ──
  if (step === "connections") {
    const connStep = goalStep;
    const fromSphere = spheres[connStep];
    const isLast = connStep === spheres.length - 1;

    return (
      <div className="min-h-screen lg:flex" style={{ background: "#1c1c21", fontFamily: "'Inter', sans-serif" }}>
        <style>{FONTS}</style>
        <DevReset />
        <div className="hidden lg:block flex-shrink-0 transition-colors duration-300" style={{ width: "350px", background: fromSphere?.color || accentColor }} />
        <div className="px-6 py-16 max-w-2xl mx-auto w-full lg:px-16 lg:flex lg:flex-col lg:justify-center" style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: "#f0ebe2", opacity: 0.5 }}>Step 3 of 3 — Relationships</span>
              <span className="text-xs" style={{ color: "#f0ebe2", opacity: 0.5 }}>{connStep + 1} of {spheres.length}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((connStep + 1) / spheres.length) * 100}%`, background: fromSphere?.color || accentColor }} />
            </div>
            <div className="flex gap-1 mt-2">
              {spheres.map((b, i) => (
                <div key={b.id} className="h-1 rounded-full flex-1 transition-all duration-300" style={{ background: i <= connStep ? b.color : b.color + "25" }} />
              ))}
            </div>
          </div>
          {fromSphere && (
            <div key={`conn-${connStep}`} style={{ animation: "fadeIn 0.25s ease-out" }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-4 h-4 rounded-full" style={{ background: fromSphere.color }} />
                <h2 style={{ color: fromSphere.color, fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 600 }}>{fromSphere.name}</h2>
              </div>
              <p className="mb-5" style={{ color: "#f0ebe2", opacity: 0.6 }}>
                {businessMode
                  ? <>Which areas need <strong>{fromSphere.name}</strong> to be in order before they can move forward?</>
                  : <>Which other areas does improving <strong>{fromSphere.name}</strong> directly support?</>}
              </p>
              {fromSphere.goals.length > 0 && (
                <div className="mb-6 rounded-xl px-4 py-3" style={{ background: "#ffffff", border: "1px solid #e8e0d5" }}>
                  <p className="text-xs uppercase tracking-wider mb-2 font-medium" style={{ color: "#8a7455" }}>Your {fromSphere.name} goals</p>
                  <div className="flex flex-wrap gap-2">
                    {fromSphere.goals.map(g => (
                      <span key={g.id} className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: fromSphere.color + "15", color: fromSphere.color }}>
                        {g.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-8" style={{ background: "white", border: "1px solid #e8e0d5", borderRadius: "10px", padding: "20px" }}>
                <p className="text-xs mb-4" style={{ color: "#8a7455" }}>Tap the goal pill on any sphere to preview its goals before connecting.</p>
                <div className="space-y-2">
                  {spheres.filter(b => b.id !== fromSphere.id).map(to => {
                    const isChecked = (connections[fromSphere.id] || []).includes(to.id);
                    return (
                      <SphereConnCard key={to.id} sphere={to} isChecked={isChecked} onToggle={() => toggleConn(fromSphere.id, to.id)} />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => connStep === 0 ? (setGoalStep(spheres.length - 1), setStep("goals")) : setGoalStep(s => s - 1)}
              className="px-6 py-3 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#f0ebe2", opacity: 0.5, background: "transparent", border: "1px solid rgba(255,255,255,0.15)" }}>
              ← Back
            </button>
            <button
              onClick={() => {
                if (isLast) {
                  const connectionsCount = Object.values(connections || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
                  trackUserEvent(session, "connections_setup_completed", { connections_count: connectionsCount });
                  setSelectedId(null);
                  setStep("intro-results");
                  saveChart(session, { spheres, connections });
                } else {
                  setGoalStep(s => s + 1);
                }
              }}
              className="flex-1 text-white font-bold py-3 transition-colors"
              style={{ background: fromSphere?.color || accentColor }}>
              {isLast ? "See my chart →" : `Next: ${spheres[connStep + 1]?.name} →`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
