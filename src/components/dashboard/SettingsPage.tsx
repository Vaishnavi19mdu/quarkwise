import React, { useState } from 'react';
import {
  Box, Typography, Switch, TextField, Slider,
} from '@mui/material';
import { User, Bell, Zap, Sliders, LogOut, ChevronRight, Check, Home, Mic, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useEnergy } from '../../context/EnergyContext';
import { Sidebar } from './Sidebar';
import { pb } from '../../lib/pocketbase';

type Tab = 'profile' | 'energy' | 'app' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: <User size={15} />,    color: '#6366f1' },
  { id: 'energy',        label: 'Energy',         icon: <Zap size={15} />,     color: '#2F6F73' },
  { id: 'app',           label: 'Preferences',    icon: <Sliders size={15} />, color: '#f59e0b' },
  { id: 'notifications', label: 'Notifications',  icon: <Bell size={15} />,    color: '#ec4899' },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <Switch
    checked={checked}
    onChange={e => onChange(e.target.checked)}
    size="small"
    sx={{
      '& .MuiSwitch-switchBase.Mui-checked': { color: '#2F6F73' },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#2F6F73' },
    }}
  />
);

const Row = ({ label, sub, children, last = false }: { label: string; sub?: string; children: React.ReactNode; last?: boolean }) => (
  <div className={`flex items-center justify-between py-4 ${!last ? 'border-b border-slate-100' : ''}`}>
    <div className="pr-4">
      <Typography variant="body2" className="font-bold text-slate-800 leading-tight">{label}</Typography>
      {sub && <Typography variant="caption" className="text-slate-400 leading-tight block mt-0.5">{sub}</Typography>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const CardTop = ({ title, sub, color, icon }: { title: string; sub: string; color: string; icon: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: color }}>{icon}</div>
    <div>
      <Typography variant="body2" className="font-black text-slate-900 leading-none">{title}</Typography>
      <Typography variant="caption" className="text-slate-400">{sub}</Typography>
    </div>
  </div>
);

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { data, setEnergyData } = useEnergy();

  // ── Pull real user from PocketBase auth store ──
  const pbUser = pb.authStore.model;
  const realName  = pbUser?.name  || pbUser?.username || '';
  const realEmail = pbUser?.email || '';

  const [tab, setTab] = useState<Tab>('profile');

  const [name, setName]       = useState(realName);
  const [email, setEmail]     = useState(realEmail);
  const [pincode, setPincode] = useState(data.pincode);

  const [savingGoal, setSavingGoal] = useState(data.savingGoal ?? 10);
  const [avgUsage, setAvgUsage]     = useState(data.avgUsage);

  const [voice, setVoice]         = useState(true);
  const [compact, setCompact]     = useState(false);
  const [unit, setUnit]           = useState<'kwh' | 'units'>('kwh');

  const [nBill, setNBill]         = useState(true);
  const [nTips, setNTips]         = useState(true);
  const [nGoal, setNGoal]         = useState(false);
  const [nWeekly, setNWeekly]     = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEnergyData({ pincode, savingGoal, avgUsage });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activeColor = TABS.find(t => t.id === tab)?.color ?? '#2F6F73';

  // Avatar initial — first char of name, fallback to email, fallback to '?'
  const avatarInitial = (name || realEmail || '?')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <Box className="flex-1 md:ml-[240px] p-6 lg:p-10 pb-24">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Typography variant="h4" className="font-black text-slate-900 mb-1">Settings</Typography>
            <Typography variant="body2" className="text-slate-400">
              Manage your account, energy targets, and preferences.
            </Typography>
          </motion.div>

          {/* Tab bar */}
          <div className="flex gap-1.5 mb-6 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {TABS.map(t => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    active ? 'text-white shadow' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                  style={active ? { backgroundColor: t.color } : {}}
                >
                  {t.icon}
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panels */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >

              {/* ── PROFILE ── */}
              {tab === 'profile' && <>
                <Card>
                  <CardTop title="Your profile" sub="Name, email, and location" color="#6366f1" icon={<User size={15} />} />
                  <div className="px-6 py-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-5 p-4 bg-slate-50 rounded-xl">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0"
                        style={{ backgroundColor: '#6366f1' }}
                      >
                        {avatarInitial}
                      </div>
                      <div className="min-w-0">
                        <Typography variant="body2" className="font-black text-slate-800 truncate">
                          {name || '—'}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 truncate block">
                          {email || '—'}
                        </Typography>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <Typography variant="caption" className="text-emerald-600 font-bold">Active</Typography>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <TextField
                        label="Display name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        size="small"
                        fullWidth
                        placeholder={realName || 'Your name'}
                      />
                      <TextField
                        label="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        size="small"
                        fullWidth
                        type="email"
                        placeholder={realEmail}
                        // email is read-only — PocketBase requires re-verification to change it
                        slotProps={{ htmlInput: { readOnly: true } }}
                        helperText="Managed by your account"
                      />
                      <TextField
                        label="Pincode"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        size="small"
                        fullWidth
                        slotProps={{ htmlInput: { maxLength: 6 } }}
                        helperText="Used to detect your area average"
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardTop title="Account" sub="Sign out or manage access" color="#ef4444" icon={<LogOut size={15} />} />
                  <div className="px-6 py-2">
                    <Row label="Sign out" sub="Returns you to the sign-in screen" last>
                      <button
                        onClick={() => {
                          pb.authStore.clear();
                          navigate('/signin');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                      >
                        <LogOut size={13} /> Logout
                      </button>
                    </Row>
                  </div>
                </Card>
              </>}

              {/* ── ENERGY ── */}
              {tab === 'energy' && <>
                <Card>
                  <CardTop title="Savings target" sub="How aggressively you want to cut usage" color="#2F6F73" icon={<Target size={15} />} />
                  <div className="px-6 py-5">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <Typography variant="body2" className="font-bold text-slate-800">Monthly reduction goal</Typography>
                        <Typography variant="caption" className="text-slate-400">vs. your submitted baseline</Typography>
                      </div>
                      <Typography variant="h5" className="font-black" style={{ color: '#2F6F73' }}>{savingGoal}%</Typography>
                    </div>
                    <Slider
                      value={savingGoal}
                      min={0} max={50} step={5}
                      onChange={(_, v) => setSavingGoal(v as number)}
                      marks={[0,10,20,30,40,50].map(v => ({ value: v, label: `${v}%` }))}
                      sx={{
                        color: '#2F6F73',
                        '& .MuiSlider-markLabel': { fontSize: 10, color: '#94a3b8' },
                      }}
                    />
                    <div className="mt-4 flex gap-2">
                      {[5, 10, 20, 30].map(g => (
                        <button
                          key={g}
                          onClick={() => setSavingGoal(g)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                            savingGoal === g
                              ? 'bg-secondary text-white border-secondary'
                              : 'text-slate-500 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {g}%
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardTop title="Baseline stats" sub="Submitted via the input page" color="#2F6F73" icon={<Home size={15} />} />
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {[
                        { label: 'Usage', value: `${data.usage} kWh` },
                        { label: 'Bill',  value: `₹${data.usage * 10}` },
                        { label: 'Avg',   value: `${data.avgUsage} kWh` },
                      ].map(s => (
                        <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                          <Typography variant="subtitle1" className="font-black text-slate-900">{s.value}</Typography>
                          <Typography variant="caption" className="text-slate-400">{s.label}</Typography>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-4">
                      <Typography variant="body2" className="font-bold text-slate-800 mb-1">Neighbourhood average override</Typography>
                      <Typography variant="caption" className="text-slate-400 block mb-3">
                        Auto-detected from your pincode. Only change if you have better local data.
                      </Typography>
                      <TextField
                        label="Average kWh/month"
                        value={avgUsage}
                        onChange={e => setAvgUsage(Number(e.target.value))}
                        size="small"
                        type="number"
                        slotProps={{ htmlInput: { min: 50 } }}
                        sx={{ maxWidth: 180 }}
                      />
                    </div>
                    <button
                      onClick={() => navigate('/input')}
                      className="mt-4 w-full flex items-center justify-between px-4 py-3 bg-secondary/5 hover:bg-secondary/10 border border-secondary/10 rounded-xl transition-all text-sm font-bold text-secondary"
                    >
                      Update baseline <ChevronRight size={15} />
                    </button>
                  </div>
                </Card>
              </>}

              {/* ── APP ── */}
              {tab === 'app' && <>
                <Card>
                  <CardTop title="Voice assistant" sub="Audio output settings" color="#f59e0b" icon={<Mic size={15} />} />
                  <div className="px-6 py-2">
                    <Row label="Speak responses aloud" sub="Assistant reads answers using your device's TTS engine">
                      <Toggle checked={voice} onChange={setVoice} />
                    </Row>
                    <Row label="Compact replies" sub="Shorter, punchier answers in the chat" last>
                      <Toggle checked={compact} onChange={setCompact} />
                    </Row>
                  </div>
                </Card>

                <Card>
                  <CardTop title="Display" sub="How numbers appear across the dashboard" color="#f59e0b" icon={<Sliders size={15} />} />
                  <div className="px-6 py-5">
                    <Typography variant="body2" className="font-bold text-slate-800 mb-3">Energy unit</Typography>
                    <div className="flex gap-2">
                      {(['kwh', 'units'] as const).map(u => (
                        <button
                          key={u}
                          onClick={() => setUnit(u)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            unit === u
                              ? 'bg-amber-400 text-white border-amber-400'
                              : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          {u === 'kwh' ? 'kWh' : 'Units'}
                        </button>
                      ))}
                    </div>
                    <Typography variant="caption" className="text-slate-400 block mt-2">
                      kWh and units are equivalent in Indian electricity billing (1 unit = 1 kWh).
                    </Typography>
                  </div>
                </Card>
              </>}

              {/* ── NOTIFICATIONS ── */}
              {tab === 'notifications' && <>
                <Card>
                  <CardTop title="Alert types" sub="Choose what gets your attention" color="#ec4899" icon={<Bell size={15} />} />
                  <div className="px-6 py-2">
                    <Row label="Bill spike alert" sub="Predicted bill rises 20%+ above baseline">
                      <Toggle checked={nBill} onChange={setNBill} />
                    </Row>
                    <Row label="Weekly efficiency tips" sub="Personalised tips every Monday morning">
                      <Toggle checked={nTips} onChange={setNTips} />
                    </Row>
                    <Row label="Goal milestone" sub="You hit your monthly savings target">
                      <Toggle checked={nGoal} onChange={setNGoal} />
                    </Row>
                    <Row label="Weekly digest" sub="Brief summary of usage and trends" last>
                      <Toggle checked={nWeekly} onChange={setNWeekly} />
                    </Row>
                  </div>
                </Card>

                <Card>
                  <div className="px-6 py-4 flex items-start gap-3 bg-pink-50/60">
                    <Bell size={16} className="text-pink-400 shrink-0 mt-0.5" />
                    <Typography variant="caption" className="text-slate-500 leading-relaxed">
                      Alerts would be sent to <strong>{email || 'your registered email'}</strong>.
                    </Typography>
                  </div>
                </Card>
              </>}

            </motion.div>
          </AnimatePresence>

          {/* Save bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-5 py-3.5 shadow-sm"
          >
            <Typography variant="caption" className="text-slate-400">
              Profile and energy changes save to your current session.
            </Typography>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black text-white transition-all"
              style={{ backgroundColor: saved ? '#22c55e' : activeColor }}
            >
              {saved ? <><Check size={13} /> Saved!</> : 'Save changes'}
            </button>
          </motion.div>

        </div>
      </Box>
    </div>
  );
};