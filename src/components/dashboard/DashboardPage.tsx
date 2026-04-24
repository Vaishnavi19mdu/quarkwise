import React, { useState, useMemo, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Slider,
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingDown, Info, Lightbulb, Zap, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateTips } from '../../lib/tips';
import { simulate } from '../../lib/predictor';
import { generateExplanation } from '../../lib/explainer';
import { ENERGY_DATA } from '../../lib/dataset';
import { Assistant } from '../Assistant';
import { ExportButton } from './ExportButton';
import { GoalWidget } from './GoalWidget';
import { Sidebar } from './Sidebar';
import { TopStats } from './TopStats';
import { CommunityBenchmark } from './CommunityBenchmark';
import { SeasonalForecast } from './SeasonalForecast';
import { useEnergy } from '../../context/EnergyContext';

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 50);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.5, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-block transition-all duration-300 ease-out"
    >
      {prefix}{Math.round(displayValue)}{suffix}
    </motion.span>
  );
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { data: contextData, isInitial } = useEnergy();

  useEffect(() => {
    if (isInitial) navigate('/input');
  }, [isInitial, navigate]);

  const [acHours, setAcHours] = useState(contextData.acHours);
  const [applianceLevel, setApplianceLevel] = useState(contextData.applianceLevel);

  const simulation = useMemo(
    () => simulate(acHours, applianceLevel, contextData.usage, contextData.avgUsage),
    [acHours, applianceLevel, contextData.usage, contextData.avgUsage]
  );

  const explanation = useMemo(() => generateExplanation(simulation), [simulation]);

  // generateTips now takes the whole simulation object
  const tips = useMemo(() => generateTips(simulation), [simulation]);

  const isUnrealistic = simulation.predictedUsage > 1200 || simulation.predictedUsage < 40;

  // Projection label: correct % vs user baseline
  const projectionLabel = (() => {
    const pct = simulation.usageChangePct;
    if (pct === 0) return "No change from baseline";
    return `${pct > 0 ? "+" : ""}${pct}% vs your baseline`;
  })();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <Box className="dashboard-export-target flex-1 md:ml-[240px] p-6 lg:p-10 pb-20 overflow-y-auto">
        <Container maxWidth="xl" className="p-0">
          <Typography variant="h6" className="text-secondary font-bold mb-2">Welcome back 👋</Typography>

          <AnimatePresence>
            {isUnrealistic && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <Box className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Typography className="text-amber-800 font-bold text-sm">
                    ⚠️ These inputs are outside typical household range
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <Typography variant="h4" className="text-slate-900 font-black mb-1 leading-tight">
                Energy Dashboard
              </Typography>
              <Typography variant="body2" className="text-slate-500 font-medium">
                Personalized insights for your household based on updated habits.
              </Typography>
            </div>
            <ExportButton />
          </motion.div>

          {/* Usage Projection Banner */}
          <Box className="mb-6 p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4">
            <div>
              <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block">
                Usage Projection
              </Typography>
              <Typography variant="body2" className="text-slate-600 font-medium mt-0.5">
                Baseline: <span className="font-black text-slate-800">{simulation.baseUsage} kWh</span>
                &nbsp;→&nbsp;
                Predicted: <span className="font-black text-slate-800">{simulation.predictedUsage} kWh</span>
              </Typography>
            </div>
            <Box
              className={`ml-auto px-4 py-2 rounded-xl text-sm font-bold ${
                simulation.usageChangePct > 0
                  ? "bg-red-50 text-red-600"
                  : simulation.usageChangePct < 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-50 text-slate-500"
              }`}
            >
              {projectionLabel}
            </Box>
          </Box>

          {/* Row 1: Top Stats */}
          <TopStats simulation={simulation} />

          {/* Row 2: Breakdown & Benchmark */}
          <Grid container spacing={3} className="mb-8">
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                <Paper className="p-6 border border-slate-100 cursor-default">
                  <Typography variant="h6" className="mb-4 font-bold text-slate-800">Consumption Breakdown</Typography>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                      <Pie
                        data={simulation.chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={65}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {simulation.chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '16px', border: 'none',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          padding: '12px 16px', backgroundColor: '#fff',
                        }}
                        formatter={(value: any) => [`${value ?? 0}%`, '']}
                        itemStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                </Paper>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CommunityBenchmark predictedUsage={simulation.predictedUsage} avgUsage={contextData.avgUsage} />
            </Grid>
          </Grid>

          {/* Row 3: Trend & Forecast */}
          <Grid container spacing={3} id="reports" className="mb-8 scroll-mt-24">
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                <Paper className="p-6 border border-slate-100 cursor-default">
                  <Typography variant="h6" className="mb-4 font-bold text-slate-800">Monthly Usage Trend</Typography>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ENERGY_DATA.monthlyUsage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(47, 111, 115, 0.05)' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar name="Usage (kWh)" dataKey="usage" fill="#2F6F73" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </Paper>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <SeasonalForecast />
            </Grid>
          </Grid>

          {/* Row 4: Simulator */}
          <motion.div id="simulator" whileHover={{ y: -4 }} className="mb-8 scroll-mt-24">
            <Paper className="p-8 border border-slate-100 bg-white">
              <Typography variant="h6" className="mb-8 font-black flex items-center gap-2">
                <Sliders size={20} className="text-secondary" />
                Predictive Savings Simulator
              </Typography>
              <Grid container spacing={6} className="items-center">
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Stack spacing={4}>
                    <Box>
                      <div className="flex justify-between items-center mb-4">
                        <Typography variant="body2" className="font-bold text-slate-500 uppercase tracking-wider">Daily AC Usage</Typography>
                        <Typography variant="body1" className="font-black text-secondary">{acHours} Hours</Typography>
                      </div>
                      <Slider value={acHours} min={0} max={12} step={1} onChange={(_, v) => setAcHours(v as number)} color="secondary" />
                    </Box>
                    <Box>
                      <Typography variant="body2" className="font-bold text-slate-500 uppercase tracking-wider mb-4">Appliance Efficiency</Typography>
                      <ToggleButtonGroup
                        value={applianceLevel}
                        exclusive
                        onChange={(_, v) => v && setApplianceLevel(v)}
                        fullWidth
                        color="secondary"
                        size="small"
                        className="bg-slate-50 p-1 rounded-xl"
                      >
                        <ToggleButton value={1} sx={{ border: 'none', borderRadius: '8px !important', fontWeight: 'bold' }}>Eco</ToggleButton>
                        <ToggleButton value={2} sx={{ border: 'none', borderRadius: '8px !important', fontWeight: 'bold' }}>Standard</ToggleButton>
                        <ToggleButton value={3} sx={{ border: 'none', borderRadius: '8px !important', fontWeight: 'bold' }}>High</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Box className="p-1 bg-slate-50 rounded-3xl border border-slate-100">
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6 }}>
                        <Box className="p-6 rounded-2xl bg-white text-center shadow-sm">
                          <Typography variant="caption" className="text-slate-400 font-bold block mb-1">PREDICTED</Typography>
                          <Typography variant="h4" className="font-black text-slate-800">
                            <AnimatedNumber value={simulation.predictedUsage} suffix=" kWh" />
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box className={`p-6 rounded-2xl text-white text-center shadow-lg ${simulation.savings >= 0 ? 'bg-secondary' : 'bg-red-500'}`}>
                          <Typography variant="caption" className="text-white/70 font-bold block mb-1">
                            {simulation.savings >= 0 ? "SAVINGS" : "EXTRA COST"}
                          </Typography>
                          <Typography variant="h4" className="font-black">
                            <AnimatedNumber value={Math.abs(simulation.savings)} prefix="₹" />
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <Typography variant="caption" className="text-slate-400 text-center block mt-3">
                    Predicted bill: ₹{simulation.predictedBill} &nbsp;|&nbsp; Score: {simulation.predictedScore}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          {/* Row 5: Analysis & Tips */}
          <Grid container spacing={3} id="insights" className="scroll-mt-24">
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div whileHover={{ y: -4 }} className="h-full">
                <Paper className="p-8 border border-slate-100 flex flex-col h-full bg-white">
                  <div className="flex items-center gap-2 mb-8">
                    <Info size={20} className="text-secondary" />
                    <Typography variant="h6" className="font-bold text-slate-800">Usage Analysis</Typography>
                  </div>
                  <Stack spacing={4}>
                    <Box className="p-6 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      <Typography variant="h6" className="font-bold text-slate-900 mb-2 leading-tight">
                        {explanation.dominantText}
                      </Typography>
                      <Typography variant="body2" className="text-slate-600 font-medium mb-3">
                        {explanation.comparisonText}
                      </Typography>
                      <Divider className="my-4" />
                      <Box className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                          <TrendingDown size={18} />
                        </div>
                        <Typography variant="body2" className="text-emerald-800 font-bold">
                          {explanation.savingsText}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="p-2 bg-secondary/10 text-secondary rounded-lg h-fit">
                        <Lightbulb size={20} />
                      </div>
                      <div>
                        <Typography variant="subtitle1" className="font-bold text-slate-800 mb-1 leading-none">AI Recommendation</Typography>
                        <Typography variant="body2" className="text-slate-600 font-medium italic">
                          {explanation.bestActionText}
                        </Typography>
                      </div>
                    </Box>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={3} className="h-full">
                <GoalWidget predictedUsage={simulation.predictedUsage} />
                <Paper className="p-6 flex-1 border border-slate-100 bg-amber-50/20">
                  <div className="flex items-center gap-2 mb-6">
                    <Zap size={20} className="text-amber-500" />
                    <Typography variant="h6" className="font-bold text-slate-800">Smart Tips</Typography>
                  </div>
                  <Stack spacing={2}>
                    {tips.map((tip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-white border border-amber-100 rounded-xl text-[13px] font-bold text-slate-700 flex gap-3 shadow-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {tip}
                      </motion.div>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box id="settings" className="scroll-mt-24" />
      <Assistant data={{ simulation, context: contextData }} />
    </div>
  );
};