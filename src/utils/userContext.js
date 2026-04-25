/**
 * buildUserContext
 *
 * Derives a single human-readable sentence describing who the user is,
 * based on their onboarding survey answers.  Inject this into every
 * Lyme system prompt so the coach always knows the user's context.
 *
 * @param {string|null} businessMode  - "business" | "team" | null (personal)
 * @param {string|null} businessStage - "startup" | "small" | "growing" | "mature" | null
 * @param {string|null} startupStage  - "bootstrapping" | "preseed" | "seed" | "seriesa" | "seriesb" | null
 * @returns {string}  A sentence to splice into a system prompt, or "" if unknown.
 */
export function buildUserContext(businessMode, businessStage, startupStage) {
  // --- Team ---
  if (businessMode === "team") {
    return "The user is managing a team and wants to align the team around goals, manage capacity, and prioritise tasks to achieve their OKRs.";
  }

  // --- Business ---
  if (businessMode === "business") {
    if (businessStage === "startup") {
      const stageMap = {
        bootstrapping: "The user is building a bootstrapped startup — self-funded, no outside capital yet, still laying foundations and finding initial customers.",
        preseed:       "The user is building a pre-seed startup — in early conversations with investors and building toward a first raise.",
        seed:          "The user is building a seed-stage startup — raised initial capital and working to find product-market fit.",
        seriesa:       "The user is building a Series A startup — proven traction, now scaling go-to-market and building out the team.",
        seriesb:       "The user is building a Series B+ startup — growth stage, expanding into new markets, building the org, and optimising for scale.",
      };
      return stageMap[startupStage] || "The user is building an early-stage startup.";
    }
    if (businessStage === "small")   return "The user runs a small business focused on sustainable growth and operational stability.";
    if (businessStage === "growing") return "The user runs a growing company that is scaling fast and managing increasing complexity across functions and teams.";
    if (businessStage === "mature")  return "The user runs a mature company focused on operational efficiency, compliance, and long-term strategy.";
    return "The user is working on business goals.";
  }

  // --- Personal (no businessMode set) ---
  return "The user is working on personal goals across different areas of their life.";
}
