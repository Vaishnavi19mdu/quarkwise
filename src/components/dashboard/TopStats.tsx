import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { Zap, TrendingDown, IndianRupee } from 'lucide-react';
import { motion } from 'motion/react';

const StatCard = ({ title, value, subtext, icon, colorClass, delta }: any) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
    <Paper className="p-6 border border-slate-100 bg-white relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${colorClass.bg} opacity-5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform`} />
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 ${colorClass.lightBg} rounded-lg ${colorClass.text}`}>
            {icon}
          </div>
          <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest">
            {title}
          </Typography>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <Typography variant="h4" className="font-black text-slate-900">{value}</Typography>
            {delta && (
              <Typography
                variant="caption"
                className={`font-bold ${delta.startsWith('↑') ? 'text-red-500' : delta.startsWith('↓') ? 'text-emerald-500' : 'text-slate-400'}`}
              >
                {delta}
              </Typography>
            )}
          </div>
          <Typography variant="body2" className="text-slate-500 font-medium">{subtext}</Typography>
        </div>
      </div>
    </Paper>
  </motion.div>
);

export const TopStats = ({ simulation }: any) => {
  // scoreDelta comes directly from predictor — no re-clamping needed
  const { scoreDelta, predictedScore, efficiency, predictedUsage, savings, predictedBill } = simulation;

  const scoreDeltaLabel =
    scoreDelta > 0 ? `↑ +${scoreDelta} pts`
    : scoreDelta < 0 ? `↓ ${Math.abs(scoreDelta)} pts`
    : '';

  const usageDelta =
    simulation.usageChangePct > 0 ? `↑ +${simulation.usageChangePct}%`
    : simulation.usageChangePct < 0 ? `↓ ${Math.abs(simulation.usageChangePct)}%`
    : '';

  return (
    <Grid container spacing={3} className="mb-8">
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          title="Energy Score"
          value={predictedScore}
          subtext={`${efficiency} — ${predictedScore >= 80 ? 'Keep it up!' : 'Room to improve'}`}
          icon={<Zap size={20} />}
          colorClass={{ bg: 'bg-secondary', lightBg: 'bg-secondary/10', text: 'text-secondary' }}
          delta={scoreDeltaLabel}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          title="Predicted Usage"
          value={`${predictedUsage} kWh`}
          subtext={`vs your baseline of ${simulation.baseUsage} kWh`}
          icon={<TrendingDown size={20} />}
          colorClass={{ bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-600' }}
          delta={usageDelta}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <StatCard
          title={savings >= 0 ? 'Monthly Savings' : 'Extra Cost'}
          value={`₹${Math.abs(savings)}`}
          subtext={savings >= 0 ? `Bill drops to ₹${predictedBill}` : `Bill rises to ₹${predictedBill}`}
          icon={<IndianRupee size={20} />}
          colorClass={
            savings >= 0
              ? { bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', text: 'text-emerald-600' }
              : { bg: 'bg-red-500', lightBg: 'bg-red-50', text: 'text-red-600' }
          }
        />
      </Grid>
    </Grid>
  );
};