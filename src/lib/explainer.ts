interface SimResult {
  breakdown: { cooling: number; appliances: number; lighting: number };
  comparison: number;        // vs neighbourhood, reactive
  usageChangePct: number;    // vs user baseline
  savings: number;           // positive = saved, negative = extra cost
  trend: string;
  ecoSavingRupees: number;
  applianceLevel: number;
  predictedBill: number;
}

export function generateExplanation(data: SimResult) {
  const { breakdown, comparison, usageChangePct, savings, trend, ecoSavingRupees, applianceLevel, predictedBill } = data;

  // Dominant category
  const dominantKey = (
    Object.entries(breakdown) as [string, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  const categoryLabel: Record<string, string> = {
    cooling: "AC cooling",
    appliances: "appliance",
    lighting: "lighting",
  };
  const label = categoryLabel[dominantKey] ?? dominantKey;
  const share = breakdown[dominantKey as keyof typeof breakdown];

  // Dominant text
  const dominantText =
    trend === "Worsening"
      ? `Your increased ${label} usage is driving this spike (${share}%)`
      : `${label.charAt(0).toUpperCase() + label.slice(1)} is your largest contributor (${share}%)`;

  // Guidance
  const guidance =
    savings < 0
      ? `Trimming your ${label} runtime is the quickest way to reverse this upward trend and lower your bill.`
      : `Maintaining these ${label} habits will help sustain your improved efficiency.`;

  // Neighbourhood comparison — uses reactive value
  const comparisonText =
    comparison > 0
      ? `After your changes, usage is still ${Math.abs(comparison)}% higher than similar households`
      : comparison < 0
      ? `After your changes, usage is ${Math.abs(comparison)}% lower than similar households`
      : "Your usage matches the neighbourhood average";

  // Savings text — uses correct sign convention
  const savingsText =
    savings > 0
      ? `These changes reduce your monthly bill by ₹${savings}.`
      : savings < 0
      ? `These changes will increase your bill by ₹${Math.abs(savings)}.`
      : "No cost difference observed.";

  // Trend text
  const trendText =
    trend === "Improving"
      ? "Your energy efficiency is improving 📉"
      : trend === "Worsening"
      ? "Your energy usage is above your baseline 📈"
      : "No significant change from your baseline.";

  // Best action — eco saving is derived from real kWh diff, not a % of delta
  let bestActionText: string;
  if (dominantKey === "cooling") {
    bestActionText = `⭐ Best Action: Reduce AC by 2 hrs/day → avoid ₹${Math.round(2 * 1.5 * 30 * 10)} in extra costs`;
  } else if (dominantKey === "appliances" && applianceLevel !== 1) {
    const impact = ecoSavingRupees > 0 ? `save ₹${ecoSavingRupees}` : "reduce costs";
    bestActionText = `⭐ Best Action: Switch appliances to eco mode → ${impact}`;
  } else {
    bestActionText = `⭐ Best Action: Review your ${label} habits to lower your ₹${predictedBill} monthly bill`;
  }

  return {
    dominantText,
    guidance,
    comparisonText,
    savingsText,
    trendText,
    bestActionText,
  };
}