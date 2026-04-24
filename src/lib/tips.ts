interface SimulationSnapshot {
  predictedUsage: number;
  neighborhoodAvgKwh: number;
  breakdown: { cooling: number; appliances: number; lighting: number };
  acHours: number;
  applianceLevel: number;
  ecoSavingRupees: number;
  comparison: number;
}

export function generateTips(sim: SimulationSnapshot): string[] {
  const { breakdown, acHours, applianceLevel, ecoSavingRupees, comparison } = sim;
  const tips: string[] = [];

  // Rule 1 — AC is the dominant driver
  if (breakdown.cooling > 50) {
    tips.push(
      `Reduce AC by 1–2 hrs/day — it's your largest cost driver (${breakdown.cooling}% of usage).`
    );
  }

  // Rule 2 — Appliances are a significant share and not already in eco
  if (breakdown.appliances > 35 && applianceLevel !== 1) {
    tips.push(
      ecoSavingRupees > 0
        ? `Switch appliances to eco mode to cut your monthly bill by ₹${ecoSavingRupees}.`
        : "Switch appliances to eco mode to reduce consumption."
    );
  }

  // Rule 3 — Well above neighbourhood average
  if (comparison > 30) {
    tips.push(
      `You're ${comparison}% above similar homes — review your AC schedule and appliance usage.`
    );
  }

  // Rule 4 — Lighting is actually a high share (only then suggest LEDs)
  if (breakdown.lighting > 20) {
    tips.push("Lighting is a significant share — switching to LEDs can cut it by ~75%.");
  }

  // Rule 5 — Already efficient, positive reinforcement
  if (tips.length === 0) {
    tips.push("Your usage looks well-balanced — keep it up!");
  }

  return tips.slice(0, 3);
}