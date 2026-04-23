import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";
import { clearChart } from "../utils/supabase.js";
import { postJson } from "../utils/api.js";
import { trackUserEvent } from "../utils/events.js";
import { FONTS } from "../constants.js";


export function AccountScreen({ session, tier, isPaid, setAuthPrompt, appearance, setAppearance, isMobile, NavBar, AuthOverlay }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [visible, setVisible] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [nextEmail, setNextEmail] = useState("");
  const [changeBusy, setChangeBusy] = useState(false);
  const [changeMsg, setChangeMsg] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const COPPER = "#a05c28";
  const sectionLabel = { fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: COPPER, fontWeight: 600, margin: "0 0 12px", fontFamily: "'Inter',sans-serif" };
  const card = { background: "white", border: "1px solid #e8e0d5", marginBottom: "32px", borderRadius: "8px", overflow: "hidden" };
  const row = (last) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: last ? "none" : "1px solid #f0e8df" });
  const btn = (variant) => ({
    fontSize: "12px",
    fontWeight: 500,
    padding: "6px 14px",
    cursor: "pointer",
    border: "none",
    borderRadius: "6px",
    ...(variant === "primary" ? { background: COPPER, color: "white", fontWeight: 600, padding: "6px 16px" } : {}),
    ...(variant === "danger" ? { background: "none", color: "#9b2a2a", border: "1px solid #e8aaaa" } : {}),
    ...(variant === "default" ? { background: "none", color: "#5c4e40", border: "1px solid #e8e0d5" } : {}),
    ...(variant === "ochre" ? { background: "none", color: COPPER, border: "1px solid #e8e0d5" } : {}),
  });

  const handleEmailChange = async () => {
    if (!nextEmail.trim()) return;
    setChangeBusy(true);
    setChangeMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ email: nextEmail.trim() });
      if (error) throw error;
      setChangeMsg("Confirmation sent. Check both your old and new inboxes to finish the change.");
      setChangeOpen(false);
      setNextEmail("");
    } catch (error) {
      setChangeMsg(error?.message || "Could not start email change.");
    } finally {
      setChangeBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) return;
    const confirmed = window.confirm("Delete your account and all data now? This cannot be undone.");
    if (!confirmed) return;

    setDeleteBusy(true);
    try {
      await postJson("/api/account/delete", {}, session);
      localStorage.removeItem("goalchart_state");
      await supabase.auth.signOut();
      window.location.reload();
    } catch (error) {
      alert(error?.message || "Failed to delete account.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    if (!session?.user?.id) return;
    setBillingBusy(true);
    try {
      const data = await postJson("/api/billing/create-portal-session", {}, session);
      if (data?.url) {
        trackUserEvent(session, "billing_portal_opened", { source: "account_screen" });
        window.location.href = data.url;
      }
    } catch (error) {
      alert(error?.message || "Could not open billing portal.");
    } finally {
      setBillingBusy(false);
    }
  };

  return (
    <div className="min-h-screen lg:flex" style={{ background: "var(--ly-bg)", fontFamily: "'Inter',sans-serif" }}>
      <style>{FONTS}</style>
      <div className="hidden lg:block flex-shrink-0" style={{ width: "350px", background: COPPER }} />
      <div className="w-full lg:flex-1 lg:flex lg:flex-col">
        {!isMobile && <NavBar />}
        {isMobile && <NavBar />}
        <div style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease-out" }}>
        <div className="lg:px-16" style={{ background: isMobile ? "#a05c28" : "rgba(160,92,40,0.12)", borderBottom: isMobile ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(160,92,40,0.2)", padding: "28px 24px 24px" }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: isMobile ? "rgba(255,255,255,0.7)" : "#c8874a", margin: "0 0 6px" }}>Your Account</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.75rem", fontWeight: 600, color: "var(--ly-ink)", margin: "0 0 4px" }}>Settings</h2>
          <p style={{ fontSize: "0.8rem", color: isMobile ? "rgba(255,255,255,0.65)" : "#888690", fontWeight: 300, margin: 0, lineHeight: 1.5, fontFamily: "'Inter',sans-serif" }}>Manage your profile, billing, and how the app looks and feels.</p>
        </div>
        <div className="px-6 py-8 max-w-4xl mx-auto w-full lg:px-16 pb-24 lg:pb-12">
          <AuthOverlay />

          <p style={sectionLabel}>Account & Data</p>
          <div style={card}>
            <div style={row(false)}>
              <div>
                <p style={{ fontSize: "0.68rem", color: "#8a7455", margin: "0 0 2px", fontFamily: "'Inter',sans-serif" }}>Email address</p>
                <p style={{ fontSize: "0.875rem", color: "#1c1410", margin: 0, fontFamily: "'Inter',sans-serif" }}>{session?.user?.email || "Not signed in"}</p>
              </div>
              <button style={btn("ochre")} onClick={() => setChangeOpen((v) => !v)}>Change</button>
            </div>

            {changeOpen && (
              <div style={{ padding: "0 22px 18px", borderBottom: "1px solid #f0e8df" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="email"
                    placeholder="new@email.com"
                    value={nextEmail}
                    onChange={(e) => setNextEmail(e.target.value)}
                    style={{ flex: 1, border: "1px solid #d4c9bb", padding: "8px 10px", fontSize: "12px", fontFamily: "'Inter',sans-serif" }}
                  />
                  <button style={btn("primary")} disabled={changeBusy || !nextEmail.trim()} onClick={handleEmailChange}>
                    {changeBusy ? "Sending..." : "Send"}
                  </button>
                </div>
                <p style={{ fontSize: "11px", color: "#8a7455", margin: "8px 0 0", fontFamily: "'Inter',sans-serif" }}>
                  Supabase will send secure confirmation links to complete the email change.
                </p>
              </div>
            )}

            {changeMsg && (
              <div style={{ padding: "0 22px 14px", borderBottom: "1px solid #f0e8df" }}>
                <p style={{ fontSize: "11px", color: "#5c4e40", margin: 0, fontFamily: "'Inter',sans-serif" }}>{changeMsg}</p>
              </div>
            )}

            <div style={row(false)}>
              <p style={{ fontSize: "0.875rem", color: "#1c1410", margin: 0, fontFamily: "'Inter',sans-serif" }}>Sign out</p>
              <button style={btn("default")} onClick={async () => { await supabase.auth.signOut(); location.reload(); }}>Sign out</button>
            </div>

            <div style={row(true)}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#9b2a2a", margin: 0, fontFamily: "'Inter',sans-serif" }}>Delete account & all data</p>
                <p style={{ fontSize: "0.68rem", color: "#8a7455", margin: "2px 0 0", fontFamily: "'Inter',sans-serif" }}>This cannot be undone</p>
              </div>
              <button style={btn("danger")} disabled={deleteBusy} onClick={handleDeleteAccount}>{deleteBusy ? "Deleting..." : "Delete"}</button>
            </div>
          </div>

          <p style={sectionLabel}>Plan & Billing</p>
          <div style={card}>
            <div style={row(false)}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <p style={{ fontSize: "0.875rem", color: "#1c1410", margin: 0, fontFamily: "'Inter',sans-serif" }}>Current plan</p>
                <span style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.08em", background: "#f0e8df", color: "#6e5c4a", padding: "3px 8px", fontFamily: "'Inter',sans-serif" }}>
                  {tier === "paid_2" ? "PRO" : tier === "paid_1" ? "STANDARD" : "FREE"}
                </span>
              </div>
              {isPaid ? (
                <button style={btn("default")} onClick={handleOpenBillingPortal} disabled={billingBusy}>{billingBusy ? "Opening..." : "Manage billing"}</button>
              ) : (
                <button style={btn("primary")} onClick={() => setAuthPrompt("upgrade")}>Upgrade -&gt;</button>
              )}
            </div>
            <div style={{ padding: "14px 18px" }}>
              <p style={{ fontSize: "0.8rem", color: "#8a7455", margin: 0, lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
                {isPaid ? "You have access to all premium features: multiple goals, full reports, and planning tools." : "Upgrade to track multiple goals, download your full report, and access planning tools."}
              </p>
            </div>
          </div>

          <p style={sectionLabel}>Chart Settings</p>
          <div style={card}>
            <div style={row(false)}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#1c1410", margin: 0, fontFamily: "’Inter’,sans-serif" }}>Reset your chart</p>
                <p style={{ fontSize: "0.68rem", color: "#8a7455", margin: "2px 0 0", fontFamily: "’Inter’,sans-serif" }}>Start over with new spheres and goals</p>
              </div>
              {confirmReset ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#9b2a2a", fontFamily: "’Inter’,sans-serif" }}>Are you sure?</span>
                  <button style={btn("danger")} onClick={() => { localStorage.removeItem("goalchart_state"); clearChart(session); location.reload(); }}>Yes, reset</button>
                  <button style={btn("default")} onClick={() => setConfirmReset(false)}>Cancel</button>
                </div>
              ) : (
                <button style={btn("default")} onClick={() => setConfirmReset(true)}>Reset</button>
              )}
            </div>

            <div style={{ padding: "14px 18px" }}>
              <p style={{ fontSize: "0.68rem", color: "#8a7455", margin: "0 0 10px", fontFamily: "’Inter’,sans-serif" }}>Appearance</p>
              <div style={{ display: "flex", gap: "8px" }}>
                {["light", "dark"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAppearance(mode)}
                    style={{
                      flex: 1,
                      padding: "7px 0",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "’Inter’,sans-serif",
                      fontWeight: appearance === mode ? 600 : 400,
                      background: appearance === mode ? "#1c1410" : "none",
                      color: appearance === mode ? "white" : "#8a7455",
                      border: appearance === mode ? "1px solid #1c1410" : "1px solid #e8e0d5",
                      borderRadius: "6px",
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>{/* end fade wrapper */}
      </div>
    </div>
  );
}
