import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { CloudRain, Sun, Snowflake, Wind, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const SeasonalForecast = () => {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <Paper className="p-6 border border-slate-100 flex flex-col h-full bg-gradient-to-br from-white to-sky-50/30 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <Typography variant="h6" className="font-bold text-slate-800">Seasonal Forecast</Typography>
          <Box className="p-2 bg-sky-50 text-sky-600 rounded-lg">
            <Sun size={20} />
          </Box>
        </div>
        
        <Box className="mb-6">
          <Typography variant="h5" className="font-black text-slate-900 mb-2">
            Expect ~20% higher usage in June
          </Typography>
          <Typography variant="body2" className="text-slate-500 leading-relaxed font-medium">
            Due to peak summer cooling demand in your region.
          </Typography>
        </Box>

        <List dense className="space-y-2 mt-auto">
          {[
            { icon: <Sun size={14} />, text: "Higher AC runtimes between 2 PM - 6 PM", color: "text-amber-500" },
            { icon: <CloudRain size={14} />, text: "Monsoon humidity may affect dryer usage", color: "text-blue-500" },
            { icon: <Star size={14} />, text: "Projected cost increase: ₹850", color: "text-secondary" }
          ].map((item, i) => (
            <ListItem key={i} className="p-0">
              <ListItemIcon className="min-w-[28px]">
                <Box className={`${item.color}`}>
                   {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText>
                <Typography className="text-[13px] font-bold text-slate-600">{item.text}</Typography>
              </ListItemText>
            </ListItem>
          ))}
        </List>
        
        <Box className="mt-8 p-4 bg-white/60 border border-white rounded-xl text-center">
           <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest block mb-1 underline">Actionable tip</Typography>
           <Typography variant="body2" className="text-slate-800 font-bold">Service your AC now to improve efficiency by 15%</Typography>
        </Box>
      </Paper>
    </motion.div>
  );
};
