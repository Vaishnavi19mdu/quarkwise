import React from 'react';
import { Paper, Typography, Box, Divider, Stack } from '@mui/material';
import { Trophy, TrendingDown, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const CommunityBenchmark = ({ predictedUsage, avgUsage }: { predictedUsage: number, avgUsage: number }) => {
  const percentageDiff = ((predictedUsage - avgUsage) / avgUsage) * 100;
  const isBetter = percentageDiff <= 0;
  
  // Rank logic (simulated)
  const rank = isBetter ? 'Top 15%' : 'Top 45%';
  
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Paper className="p-6 h-full flex flex-col border border-slate-100 transition-all duration-300">
        <div className="flex items-center justify-between mb-8">
          <Typography variant="h6" className="font-bold text-slate-800">Community Benchmark</Typography>
          <Box className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={20} />
          </Box>
        </div>

        <Stack spacing={4} className="flex-1">
          <Box className="flex items-end gap-3">
            <Typography variant="h3" className={`font-black tracking-tighter ${isBetter ? 'text-emerald-500' : 'text-amber-500'}`}>
              {Math.abs(Math.round(percentageDiff))}%
            </Typography>
            <div className="mb-2">
               <Typography className={`font-bold leading-none ${isBetter ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isBetter ? 'More Efficient' : 'Less Efficient'}
               </Typography>
               <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-tight">than similar households</Typography>
            </div>
          </Box>

          <Box className="grid grid-cols-2 gap-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Typography variant="caption" className="text-slate-400 font-bold uppercase block mb-1">Your Rank</Typography>
                <div className="flex items-center gap-2">
                   <Trophy size={18} className="text-secondary" />
                   <Typography variant="h6" className="font-black text-slate-800">{rank}</Typography>
                </div>
             </div>
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Typography variant="caption" className="text-slate-400 font-bold uppercase block mb-1">Neighbors</Typography>
                <div className="flex items-center gap-2">
                   <ShieldCheck size={18} className="text-secondary" />
                   <Typography variant="h6" className="font-black text-slate-800">Verified</Typography>
                </div>
             </div>
          </Box>

          <Divider />

          <Box className="p-4 bg-secondary/5 rounded-2xl border border-secondary/20 group cursor-pointer hover:bg-secondary/10 transition-colors">
             <Typography variant="subtitle2" className="text-secondary font-black mb-1 flex items-center gap-2">
                Improvement Opportunity <ArrowRight size={16} />
             </Typography>
             <Typography variant="body2" className="text-slate-600 font-medium leading-relaxed">
                {isBetter ? "You're already ahead! Optimized lighting could push you to top 5%." : "Switching to smart timers for geysers can improve your rank by 12%."}
             </Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};
