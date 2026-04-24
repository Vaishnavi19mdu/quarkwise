// ─── Constants ────────────────────────────────────────────────────────────────
const RATE_PER_KWH = 10;           // ₹ per kWh
const MAX_USAGE_KWH = 400;         // ceiling for score normalisation
const AC_KWH_PER_HOUR = 1.5;       // average split-AC unit
const LIGHTING_KWH = 8;            // fixed monthly lighting load
const ECO_SAVING_PCT = 0.20;       // eco mode cuts appliance kWh by 20%

// applianceLevel 1 = Eco, 2 = Standard, 3 = High
const APPLIANCE_BASE: Record<number, number> = {
  1: 32,   // Eco  (base 40 × 0.80)
  2: 40,   // Standard
  3: 56,   // High (base 40 × 1.40)
};

// ─── Score ────────────────────────────────────────────────────────────────────
export function calculateScore(usage: number): number {
  const raw = 100 * (1 - usage / MAX_USAGE_KWH);
  return Math.round(Math.max(0, Math.min(100, raw)));
}

export function efficiencyLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

// ─── Main simulator ───────────────────────────────────────────────────────────
export function simulate(
  acHours: number,
  applianceLevel: number,
  baseUsageKwh: number,      // the user's original/baseline usage from input page
  neighborhoodAvgKwh: number
) {
  // 1. Component kWh
  const acKwh = Math.round(acHours * AC_KWH_PER_HOUR * 30);
  const applianceKwh = APPLIANCE_BASE[applianceLevel] ?? APPLIANCE_BASE[2];
  const lightingKwh = LIGHTING_KWH;

  // 2. Predicted total
  const predictedUsage = Math.max(20, acKwh + applianceKwh + lightingKwh);

  // 3. Bill
  const baseBill = Math.round(baseUsageKwh * RATE_PER_KWH);
  const predictedBill = Math.round(predictedUsage * RATE_PER_KWH);
  // positive = saved, negative = extra cost
  const savings = baseBill - predictedBill;

  // 4. Score
  const baseScore = calculateScore(baseUsageKwh);
  const predictedScore = calculateScore(predictedUsage);
  const scoreDelta = predictedScore - baseScore;

  // 5. % change vs user baseline (not hardcoded)
  const usageChangePct = Math.round(
    ((predictedUsage - baseUsageKwh) / baseUsageKwh) * 100
  );

  // 6. Neighbourhood comparison (reactive — recalculates every time)
  const vsNeighborhoodPct = Math.round(
    ((predictedUsage - neighborhoodAvgKwh) / neighborhoodAvgKwh) * 100
  );

  // 7. Breakdown shares — adjust largest if rounding drift
  const total = predictedUsage;
  let acShare = Math.round((acKwh / total) * 100);
  let applianceShare = Math.round((applianceKwh / total) * 100);
  let lightingShare = Math.round((lightingKwh / total) * 100);
  const drift = 100 - (acShare + applianceShare + lightingShare);
  // give rounding correction to the largest slice
  if (acShare >= applianceShare && acShare >= lightingShare) acShare += drift;
  else if (applianceShare >= lightingShare) applianceShare += drift;
  else lightingShare += drift;

  const breakdown = { cooling: acShare, appliances: applianceShare, lighting: lightingShare };

  const chartData = [
    { name: "Cooling",    value: acShare,        color: "#2F6F73" },
    { name: "Appliances", value: applianceShare,  color: "#B3E0DC" },
    { name: "Lighting",   value: lightingShare,   color: "#FFD700" },
  ];

  // 8. Eco-mode saving (for recommendation card)
  const ecoApplianceKwh = APPLIANCE_BASE[1];
  const ecoSavingKwh = Math.max(0, applianceKwh - ecoApplianceKwh);
  const ecoSavingRupees = Math.round(ecoSavingKwh * RATE_PER_KWH);

  // 9. Trend
  const trend =
    predictedUsage < baseUsageKwh ? "Improving"
    : predictedUsage > baseUsageKwh ? "Worsening"
    : "No change";

  return {
    // usage
    baseUsage: Math.round(baseUsageKwh),
    predictedUsage: Math.round(predictedUsage),
    usageChangePct,

    // billing
    baseBill,
    predictedBill,
    savings,
    extraCost: -savings,

    // scores
    baseScore,
    predictedScore,
    currentScore: baseScore,
    scoreDelta,
    efficiency: efficiencyLabel(predictedScore),

    // neighbourhood (reactive)
    comparison: vsNeighborhoodPct,
    neighborhoodAvgKwh,

    // breakdown
    breakdown,
    chartData,

    // eco recommendation
    ecoSavingRupees,

    // simulator inputs — passed through so consumers (tips, assistant) can read them
    acHours,
    applianceLevel,

    // trend
    trend,
  };
}