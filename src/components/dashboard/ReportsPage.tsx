import React, { useMemo } from 'react';
import {
  Container, Grid, Paper, Typography, Box, Stack, LinearProgress, Button, Divider,
} from '@mui/material';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'motion/react';
import {
  TrendingUp, TrendingDown, Award, ArrowLeft,
  Zap, Flame, Leaf, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEnergy } from '../../context/EnergyContext';
import { simulate } from '../../lib/predictor';
import { ENERGY_DATA } from '../../lib/dataset';

// ─── jsPDF PDF export ────────────────────────────────────────────────────────
async function exportPDF(data: any, simulation: any) {
  // Dynamically import jspdf so it doesn't bloat the main bundle
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const teal = [47, 111, 115] as const;
  const slate = [30, 41, 59] as const;
  const muted = [100, 116, 139] as const;
  const green = [22, 163, 74] as const;
  const red   = [220, 38, 38] as const;

  const date = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const W = 210;

  // ── Header band ──
  doc.setFillColor(...teal);
  doc.rect(0, 0, W, 28, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Quarkwise', 15, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Energy Report', 15, 19);
  doc.setFontSize(9);
  doc.text(`Generated: ${date}`, W - 15, 12, { align: 'right' });
  doc.text('Account: Household', W - 15, 19, { align: 'right' });

  // ── Stat cards row ──
  const cards = [
    { label: 'Energy Score', value: `${simulation.predictedScore}/100`, sub: simulation.efficiency, delta: simulation.scoreDelta >= 0 ? `+${simulation.scoreDelta} pts` : `${simulation.scoreDelta} pts`, positive: simulation.scoreDelta >= 0 },
    { label: 'Predicted Usage', value: `${simulation.predictedUsage} kWh`, sub: `Base: ${simulation.baseUsage} kWh`, delta: `${simulation.usageChangePct > 0 ? '+' : ''}${simulation.usageChangePct}%`, positive: simulation.usageChangePct <= 0 },
    { label: simulation.savings >= 0 ? 'Monthly Savings' : 'Extra Cost', value: `₹${Math.abs(simulation.savings)}`, sub: `Bill: ₹${simulation.predictedBill}`, delta: simulation.savings >= 0 ? 'vs baseline' : 'above baseline', positive: simulation.savings >= 0 },
  ];

  let x = 15;
  const cardW = 56;
  const cardY = 34;
  cards.forEach((c) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, cardY, cardW, 28, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardW, 28, 3, 3, 'S');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    doc.text(c.label.toUpperCase(), x + 4, cardY + 6);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate);
    doc.text(c.value, x + 4, cardY + 15);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...muted);
    doc.text(c.sub, x + 4, cardY + 21);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const color = c.positive ? green : red;
doc.setTextColor(...(color as [number, number, number]));

    doc.text(c.delta, x + 4, cardY + 26.5);

    x += cardW + 4;
  });

  // ── Section helper ──
  const sectionTitle = (title: string, y: number) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...teal);
    doc.text(title.toUpperCase(), 15, y);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y + 1.5, W - 15, y + 1.5);
  };

  // ── Monthly usage table ──
  sectionTitle('Monthly Usage (Last 6 Months)', 72);
  const months = (ENERGY_DATA.monthlyUsage as any[]).slice(-6);
  const colW = [40, 40, 40];
  const headers = ['Month', 'Usage (kWh)', 'Cost'];
  let ry = 77;

  doc.setFillColor(241, 245, 249);
  doc.rect(15, ry, colW[0] + colW[1] + colW[2], 7, 'F');
  headers.forEach((h, i) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    doc.text(h, 15 + colW.slice(0, i).reduce((a, b) => a + b, 0) + 3, ry + 5);
  });
  ry += 7;

  months.forEach((m: any, idx: number) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, ry, colW[0] + colW[1] + colW[2], 7, 'F');
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(m.name, 18, ry + 5);
    doc.text(`${m.usage} kWh`, 58, ry + 5);
    doc.text(m.cost ? `₹${m.cost}` : '—', 98, ry + 5);
    ry += 7;
  });

  // ── Appliance breakdown table ──
  sectionTitle('Appliance Breakdown', ry + 6);
  ry += 11;

  doc.setFillColor(241, 245, 249);
  doc.rect(15, ry, 120, 7, 'F');
  ['Appliance', 'Usage (kWh)', 'Share'].forEach((h, i) => {
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    doc.text(h, 15 + [0, 50, 100][i] + 3, ry + 5);
  });
  ry += 7;

  (ENERGY_DATA.breakdown as any[]).forEach((a: any, idx: number) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, ry, 120, 7, 'F');
    }
    const share = Math.round((a.value / simulation.predictedUsage) * 100);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...slate);
    doc.text(a.name, 18, ry + 5);
    doc.text(`${a.value} kWh`, 68, ry + 5);
    doc.text(`${share}%`, 118, ry + 5);
    ry += 7;
  });

  // ── Simulator summary ──
  sectionTitle('Simulator Results', ry + 6);
  ry += 11;
  const simRows = [
    ['Base Usage', `${simulation.baseUsage} kWh`],
    ['Predicted Usage', `${simulation.predictedUsage} kWh (${simulation.usageChangePct > 0 ? '+' : ''}${simulation.usageChangePct}%)`],
    ['Energy Score', `${simulation.predictedScore} / 100 (${simulation.efficiency})`],
    [simulation.savings >= 0 ? 'Monthly Savings' : 'Extra Cost', `₹${Math.abs(simulation.savings)}`],
    ['Predicted Bill', `₹${simulation.predictedBill}`],
  ];
  simRows.forEach(([k, v], idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, ry, 120, 7, 'F');
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...muted);
    doc.text(k, 18, ry + 5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...slate);
    doc.text(v, 68, ry + 5);
    ry += 7;
  });

  // ── Footer ──
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...muted);
  doc.text('Quarkwise Energy Intelligence · quarkwise.app', 15, 285);
  doc.text('This report is auto-generated. Data is indicative.', W - 15, 285, { align: 'right' });

  doc.save(`quarkwise_report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getRatingLabel = (score: number) => {
  if (score >= 85) return { label: 'Excellent', color: '#16a34a', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score >= 65) return { label: 'Good', color: '#2F6F73', bg: 'bg-teal-50', border: 'border-teal-200' };
  if (score >= 45) return { label: 'Moderate', color: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200' };
  return { label: 'High Usage', color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200' };
};

const PIE_COLORS = ['#2F6F73', '#B3E0DC', '#89994c', '#f59e0b', '#6366f1', '#ec4899'];

// ─── Component ───────────────────────────────────────────────────────────────
export const ReportsPage = () => {
  const navigate = useNavigate();
  const { data: contextData } = useEnergy();

  const simulation = useMemo(
    () => simulate(contextData.acHours, contextData.applianceLevel, contextData.usage, contextData.avgUsage),
    [contextData]
  );

  const rating = getRatingLabel(simulation.predictedScore);

  // Build 6-month trend with a simulated "before" score
  const scoreTrend = useMemo(() => {
    const months = (ENERGY_DATA.monthlyUsage as any[]).slice(-6);
    return months.map((m: any, i: number) => ({
      name: m.name,
      score: Math.max(30, Math.min(100, simulation.predictedScore - 20 + i * 4 + Math.round(Math.random() * 4))),
      usage: m.usage,
    }));
  }, [simulation.predictedScore]);

  // Radial chart data for the score dial
  const radialData = [
    { name: 'Score', value: simulation.predictedScore, fill: rating.color },
    { name: 'Remaining', value: 100 - simulation.predictedScore, fill: '#f1f5f9' },
  ];

  const breakdown = (simulation.chartData ?? ENERGY_DATA.breakdown) as any[];

  const [exporting, setExporting] = React.useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportPDF(contextData, simulation);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 pb-20">
      <Container maxWidth="xl" className="p-0">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} className="text-slate-500" />
            </button>
            <div>
              <Typography variant="h4" className="font-black text-slate-900 leading-tight">
                Energy Report
              </Typography>
              <Typography variant="body2" className="text-slate-400 font-medium mt-0.5">
                Breakdown, ratings & trends for your household
              </Typography>
            </div>
          </div>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Download size={16} />}
            onClick={handleExportPDF}
            disabled={exporting}
            className="rounded-xl px-5 py-2.5 font-bold shadow-md"
          >
            {exporting ? 'Preparing…' : 'Download PDF'}
          </Button>
        </motion.div>

        {/* ── Row 1: Score dial + Rating card + Delta cards ── */}
        <Grid container spacing={3} className="mb-6">

          {/* Score dial */}
          <Grid size={{ xs: 12, md: 3 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Paper className="p-6 border border-slate-100 h-full flex flex-col items-center justify-center">
                <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                  Energy Score
                </Typography>
                <div style={{ width: 160, height: 160, position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%" cy="50%"
                      innerRadius="70%" outerRadius="100%"
                      startAngle={210} endAngle={-30}
                      data={radialData}
                      barSize={14}
                    >
                      <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Typography variant="h3" className="font-black" style={{ color: rating.color, lineHeight: 1 }}>
                      {simulation.predictedScore}
                    </Typography>
                    <Typography variant="caption" className="text-slate-400 font-bold">/100</Typography>
                  </div>
                </div>
                <div className={`mt-3 px-4 py-1.5 rounded-full border text-sm font-black ${rating.bg} ${rating.border}`} style={{ color: rating.color }}>
                  {rating.label}
                </div>
              </Paper>
            </motion.div>
          </Grid>

          {/* Rating improvement card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Paper className="p-6 border border-slate-100 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={20} className="text-secondary" />
                    <Typography variant="h6" className="font-bold text-slate-800">Rating History</Typography>
                  </div>
                  <Typography variant="body2" className="text-slate-500 mb-4">
                    Your score has improved over the past 6 months. Keep reducing AC usage to move from <strong>{rating.label}</strong> to the next tier.
                  </Typography>
                </div>
                <Stack spacing={2}>
                  {[
                    { label: 'vs Last Month', delta: simulation.scoreDelta, icon: <TrendingUp size={14} /> },
                    { label: 'vs Community Avg', delta: simulation.predictedScore - 62, icon: <Leaf size={14} /> },
                    { label: 'Usage Change', delta: -simulation.usageChangePct, icon: <Zap size={14} />, suffix: '%' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{item.icon}</span>
                        <Typography variant="caption" className="font-bold text-slate-500">{item.label}</Typography>
                      </div>
                      <div className={`flex items-center gap-1 font-black text-sm ${item.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {item.delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {item.delta > 0 ? '+' : ''}{item.delta}{item.suffix ?? ' pts'}
                      </div>
                    </div>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Summary stat cards */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Grid container spacing={2} className="h-full">
                {[
                  {
                    label: 'Predicted Usage',
                    value: `${simulation.predictedUsage}`,
                    unit: 'kWh',
                    sub: `Base: ${simulation.baseUsage} kWh`,
                    icon: <Zap size={18} />,
                    positive: simulation.usageChangePct <= 0,
                    delta: `${simulation.usageChangePct > 0 ? '+' : ''}${simulation.usageChangePct}% vs baseline`,
                    color: 'text-secondary',
                    bg: 'bg-teal-50',
                  },
                  {
                    label: 'Monthly Savings',
                    value: `₹${Math.abs(simulation.savings)}`,
                    unit: '',
                    sub: `Bill: ₹${simulation.predictedBill}`,
                    icon: <Leaf size={18} />,
                    positive: simulation.savings >= 0,
                    delta: simulation.savings >= 0 ? 'Saving vs baseline' : 'Extra vs baseline',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                  {
                    label: 'Efficiency Tier',
                    value: simulation.efficiency,
                    unit: '',
                    sub: `AC: ${contextData.acHours}h/day`,
                    icon: <Award size={18} />,
                    positive: true,
                    delta: 'Current operating mode',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                  },
                  {
                    label: 'Carbon Impact',
                    value: `${Math.round(simulation.predictedUsage * 0.82)}`,
                    unit: 'g CO₂',
                    sub: 'Est. monthly emissions',
                    icon: <Flame size={18} />,
                    positive: simulation.usageChangePct <= 0,
                    delta: simulation.usageChangePct <= 0 ? 'Reduced this month' : 'Increased this month',
                    color: 'text-orange-500',
                    bg: 'bg-orange-50',
                  },
                ].map((card, i) => (
                  <Grid size={{ xs: 6 }} key={card.label}>
                    <Paper className="p-4 border border-slate-100 h-full flex flex-col justify-between">
                      <div className={`p-2 rounded-xl w-fit ${card.bg} mb-3`}>
                        <span className={card.color}>{card.icon}</span>
                      </div>
                      <div>
                        <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                          {card.label}
                        </Typography>
                        <Typography variant="h5" className="font-black text-slate-900 leading-none">
                          {card.value}<span className="text-sm font-bold text-slate-400 ml-1">{card.unit}</span>
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 block mt-1">{card.sub}</Typography>
                      </div>
                      <Typography variant="caption" className={`font-bold mt-2 block ${card.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {card.delta}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>
        </Grid>

        {/* ── Row 2: Score trend + Pie breakdown ── */}
        <Grid container spacing={3} className="mb-6">
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Paper className="p-6 border border-slate-100">
                <Typography variant="h6" className="font-bold text-slate-800 mb-1">Score Trend (6 Months)</Typography>
                <Typography variant="caption" className="text-slate-400 block mb-5">
                  Your energy score trajectory — higher is better
                </Typography>
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreTrend}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2F6F73" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#2F6F73" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px 14px' }}
                        formatter={(v: any) => [`${v} pts`, 'Score']}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#2F6F73"
                        strokeWidth={2.5}
                        fill="url(#scoreGrad)"
                        dot={{ fill: '#2F6F73', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Paper>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Paper className="p-6 border border-slate-100 h-full">
                <Typography variant="h6" className="font-bold text-slate-800 mb-1">Consumption Split</Typography>
                <Typography variant="caption" className="text-slate-400 block mb-4">
                  Where your energy actually goes
                </Typography>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {breakdown.map((_: any, i: number) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(v: any) => [`${v}%`, '']}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top 2 appliances callout */}
                <Divider className="my-4" />
                <Typography variant="caption" className="font-bold text-slate-400 uppercase tracking-wider block mb-3">
                  Top Consumers
                </Typography>
                <Stack spacing={2}>
                  {breakdown.slice(0, 2).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <Typography variant="caption" className="font-bold text-slate-700 flex-1">{item.name}</Typography>
                      <div className="text-right">
                        <Typography variant="caption" className="font-black text-slate-800">{item.value}%</Typography>
                      </div>
                      <div className="w-24">
                        <LinearProgress
                          variant="determinate"
                          value={item.value}
                          sx={{
                            height: 6, borderRadius: 4,
                            backgroundColor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': { backgroundColor: PIE_COLORS[i], borderRadius: 4 },
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* ── Row 3: Appliance breakdown table ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Paper className="p-6 border border-slate-100 mb-6">
            <Typography variant="h6" className="font-bold text-slate-800 mb-5">Full Appliance Breakdown</Typography>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 rounded-xl">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider rounded-l-xl">Appliance</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Share</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usage (kWh)</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((item: any, i: number) => {
                    const kwh = Math.round((item.value / 100) * simulation.predictedUsage);
                    const isHigh = item.value > 25;
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <Typography variant="body2" className="font-bold text-slate-700">{item.name}</Typography>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Typography variant="body2" className="font-black text-slate-800 w-10">{item.value}%</Typography>
                            <div className="w-32">
                              <LinearProgress
                                variant="determinate"
                                value={item.value}
                                sx={{
                                  height: 6, borderRadius: 4,
                                  backgroundColor: '#f1f5f9',
                                  '& .MuiLinearProgress-bar': { backgroundColor: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 4 },
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2" className="font-bold text-slate-600">{kwh} kWh</Typography>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${isHigh ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                            {isHigh ? 'High usage' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Paper>
        </motion.div>

        {/* ── Back to dashboard ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/dashboard')}
            className="rounded-xl px-8 font-bold"
          >
            Back to Dashboard
          </Button>
        </motion.div>

      </Container>
    </div>
  );
};