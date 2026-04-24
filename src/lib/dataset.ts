export const avgUsageData: Record<string, number> = {
  "600001": 200,
  "600002": 180,
  "default": 190
};

export const ENERGY_DATA = {
  // ... existing data ...
  monthlyUsage: [
    { name: 'Jan', usage: 150 },
    { name: 'Feb', usage: 140 },
    { name: 'Mar', usage: 180 },
    { name: 'Apr', usage: 220 },
    { name: 'May', usage: 280 },
    { name: 'Jun', usage: 310 },
  ],
  breakdown: [
    { name: 'Cooling', value: 45, color: '#2F6F73' },
    { name: 'Kitchen', value: 25, color: '#B3E0DC' },
    { name: 'Lighting', value: 15, color: '#22C55E' },
    { name: 'Entertainment', value: 15, color: '#F59E0B' },
  ],
  averageUsage: 200,
  currentUserUsage: 280,
  acHours: 8,
  applianceLevel: 2, // Medium
};
