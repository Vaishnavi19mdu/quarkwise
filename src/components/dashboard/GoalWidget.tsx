import React, { useState } from 'react';
import { Paper, Typography, Box, Slider, Button, Stack, LinearProgress } from '@mui/material';
import { Target, TrendingDown, CheckCircle2, Trophy, Zap } from 'lucide-react';
import { useEnergy } from '../../context/EnergyContext';
import { motion, AnimatePresence } from 'motion/react';

export const GoalWidget = ({ predictedUsage }: { predictedUsage: number }) => {
  const { data, setEnergyData } = useEnergy();
  const [isEditing, setIsEditing] = useState(data.savingGoal === 0);
  const [tempGoal, setTempGoal] = useState(data.savingGoal || 10);

  const currentUsage = data.usage;
  const reduction = ((currentUsage - predictedUsage) / currentUsage) * 100;
  const progress = data.savingGoal > 0 ? Math.min(100, (reduction / data.savingGoal) * 100) : 0;
  const isGoalMet = reduction >= data.savingGoal && data.savingGoal > 0;
  
  // Ranking goal logic (simulated)
  const currentRank = reduction > 5 ? 12 : 45;
  const targetRank = 5;

  const handleSaveGoal = () => {
    setEnergyData({ savingGoal: tempGoal });
    setIsEditing(false);
  };

  return (
    <Paper className="p-6 mb-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden relative h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-secondary" />
          <Typography variant="h6" className="font-bold text-slate-800">Your Goals</Typography>
        </div>
        {!isEditing && (
           <Button 
            size="small" 
            variant="text" 
            className="text-secondary font-bold"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col"
          >
            <Typography variant="body2" className="text-slate-500 mb-6">
              Gamify your energy savings. Set a target and compete for top rank.
            </Typography>
            <Box className="px-2 mb-8 flex-1">
              <div className="flex justify-between mb-2">
                <Typography variant="caption" className="font-bold text-slate-400">SAVINGS TARGET</Typography>
                <Typography variant="body2" className="font-bold text-secondary">{tempGoal}%</Typography>
              </div>
              <Slider
                value={tempGoal}
                min={5}
                max={50}
                step={5}
                onChange={(_, v) => setTempGoal(v as number)}
                color="secondary"
                valueLabelDisplay="auto"
              />
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleSaveGoal}
              className="rounded-xl py-4 font-bold shadow-md shadow-secondary/20"
            >
              Start Mission
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="viewing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 flex-1"
          >
            {/* Savings Goal */}
            <div>
              <div className="flex justify-between mb-2 items-end">
                <div>
                   <Typography variant="caption" className="text-slate-400 font-bold block mb-0.5">SAVINGS GOAL</Typography>
                   <Typography variant="h5" className="font-black text-slate-900 leading-none">{data.savingGoal}%</Typography>
                </div>
                <Typography variant="caption" className={`font-black ${isGoalMet ? 'text-emerald-500' : 'text-secondary'}`}>
                   {reduction > 0 ? `${Math.round(reduction)}% achieved` : 'Waiting for progress'}
                </Typography>
              </div>
              <div className="relative pt-2">
                <LinearProgress 
                  variant="determinate" 
                  value={Math.max(2, progress)} 
                  className="h-4 rounded-full bg-slate-100"
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: isGoalMet ? '#10B981' : '#2F6F73',
                      borderRadius: '10px'
                    }
                  }}
                />
                <Box className="flex justify-between mt-2">
                   <Typography variant="caption" className="text-[10px] font-bold text-slate-400">BASE</Typography>
                   <Typography variant="caption" className="text-[10px] font-bold text-slate-400">TARGET</Typography>
                </Box>
              </div>
            </div>

            {/* Ranking Goal */}
            <Box className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isGoalMet ? 'bg-emerald-500 text-white' : 'bg-white text-secondary shadow-sm'}`}>
                     <Trophy size={18} />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-slate-400 font-bold block leading-none mb-1">CURRENT RANK</Typography>
                    <Typography variant="h6" className="font-black text-slate-800 leading-none">#{currentRank}</Typography>
                  </div>
               </div>
               <div className="text-right">
                  <Typography variant="caption" className="text-slate-400 font-bold block leading-none mb-1">TARGET</Typography>
                  <Typography variant="h6" className="font-black text-secondary leading-none">Top {targetRank}%</Typography>
               </div>
            </Box>

            <Box className={`p-4 rounded-xl border transition-colors mt-auto ${isGoalMet ? 'bg-emerald-50 border-emerald-100' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isGoalMet ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Zap size={16} className="text-secondary" />
                )}
                <Typography variant="subtitle2" className={`font-bold ${isGoalMet ? 'text-emerald-800' : 'text-slate-800'}`}>
                  {isGoalMet ? 'Legendary Effort!' : 'Mission in Progress'}
                </Typography>
              </div>
              <Typography variant="caption" className={isGoalMet ? 'text-emerald-600' : 'text-slate-500'}>
                {isGoalMet 
                  ? "You've unlocked the Efficiency Badge!" 
                  : `Reduce another ${Math.max(0, data.savingGoal - reduction).toFixed(1)}% to climb to #30.`}
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};
