import { Button, Container, Grid, Paper, Typography, Box } from '@mui/material';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { Zap, Brain, Trophy, FileText, Lightbulb, MessageSquare, TrendingUp, ArrowDown, ArrowUp, Sliders } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useEffect, useState } from 'react';

const HeroMockup = () => {
  const [score, setScore] = useState(0);
  const [savings, setSavings] = useState(0);
  const [reduction, setReduction] = useState(0);

  useEffect(() => {
    const scoreAnim = animate(0, 82, {
      duration: 2,
      onUpdate: (latest) => setScore(Math.round(latest)),
    });
    const savingsAnim = animate(0, 1240, {
      duration: 2.5,
      delay: 0.5,
      onUpdate: (latest) => setSavings(Math.round(latest)),
    });
    const reductionAnim = animate(0, 15, {
      duration: 2,
      delay: 0.2,
      onUpdate: (latest) => setReduction(Math.round(latest)),
    });

    return () => {
      scoreAnim.stop();
      savingsAnim.stop();
      reductionAnim.stop();
    };
  }, []);

  return (
    <Paper 
      elevation={0}
      className="p-8 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 w-full max-w-lg mx-auto overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-widest block mb-1">
            Energy Performance
          </Typography>
          <div className="flex items-end gap-2">
            <Typography variant="h2" className="text-5xl font-black text-slate-900 leading-none">
              {score}
            </Typography>
            <div className="flex items-center text-emerald-500 font-bold text-sm mb-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUp size={14} className="mr-0.5" />
              +12
            </div>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="text-secondary" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <Typography variant="subtitle2" className="font-bold text-slate-800">Usage Analysis</Typography>
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase italic">
              <ArrowDown size={12} />
              {reduction}% Optimized
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Baseline</div>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-slate-400"
                />
              </div>
              <div className="w-8 text-[10px] font-bold text-slate-500">850</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-[10px] font-black text-slate-800 uppercase tracking-tighter">Predicted</div>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  className="h-full bg-secondary"
                />
              </div>
              <div className="w-8 text-[10px] font-black text-slate-900">720</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-tighter block mb-1">
              Monthly Savings
            </Typography>
            <Typography variant="h5" className="font-black text-secondary">
              ₹{savings.toLocaleString()}
            </Typography>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
            <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-tighter block mb-1">
              Carbon Offset
            </Typography>
            <Typography variant="h5" className="font-black text-emerald-600">
              -12%
            </Typography>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between mb-3 text-[10px] font-black text-slate-400 uppercase">
            <span>Simulator Adjustment</span>
            <span className="text-secondary">AC: 4 Hours/Day</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
            <motion.div 
              animate={{ left: ['40%', '60%', '40%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-secondary rounded-full shadow-lg z-10"
            />
            <div className="absolute inset-0 h-full w-[100%] bg-gradient-to-r from-secondary/20 to-transparent rounded-full" />
          </div>
        </div>
      </div>
      
      <Typography variant="caption" className="block mt-6 text-center text-slate-400 font-medium italic">
        "Interactive insights powered by your real usage patterns"
      </Typography>
    </Paper>
  );
};

const features = [
  { icon: <Zap className="text-amber-500" />, title: 'What-if Simulator', desc: 'Test hypothetical changes to your energy habits instantly.' },
  { icon: <Brain className="text-secondary" />, title: 'Explain My Bill', desc: 'AI-driven breakdown of where your money actually goes.' },
  { icon: <Trophy className="text-emerald-500" />, title: 'Energy Score', desc: 'See how your efficiency stacks up against the average.' },
  { icon: <FileText className="text-blue-500" />, title: 'PDF Report', desc: 'Download detailed monthly reports for your records.' },
  { icon: <Lightbulb className="text-yellow-500" />, title: 'Smart Tips Generator', desc: 'Personalized recommendations to lower your costs.' },
  { icon: <MessageSquare className="text-teal-500" />, title: 'Voice/Chat Assistant', desc: 'Ask anything about your energy usage in real-time.' },
];

export const LandingPage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-b from-primary/10 to-transparent">
        <Container maxWidth="lg">
          <Grid container spacing={8} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h1" className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 leading-tight">
                  Turn Your Energy Bill <br />
                  <span className="text-secondary">Into Wisdom</span>
                </Typography>
                <Typography variant="h6" className="text-slate-600 mb-8 font-normal leading-relaxed text-xl">
                  Analyze, explain, and reduce your electricity costs with Quarkwise. Smart analytics for a greener wallet.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  component={Link}
                  to="/input"
                  className="px-10 py-4 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
                >
                  Get Started
                </Button>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full" />
                <HeroMockup />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-white">
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" className="text-4xl mb-20 text-slate-900 font-bold">
            Smart Features for a Smarter You
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Paper className="p-10 h-full transition-all hover:shadow-2xl hover:-translate-y-2 rounded-3xl border border-slate-50">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 shadow-inner">
                    {feature.icon}
                  </div>
                  <Typography variant="h6" className="mb-4 text-slate-800 font-bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 bg-[#0F172A] text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <Container maxWidth="lg">
          <Typography variant="h2" align="center" className="text-4xl md:text-5xl mb-24 font-black">
            The Quarkwise <span className="text-secondary">Process</span>
          </Typography>
          
          <div className="relative max-w-4xl mx-auto">
            {/* The Connecting Line */}
            <div className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-white/10" />
            
            <div className="space-y-24">
              {[
                { n: '01', t: 'Input your bill', d: 'Securely upload your latest energy statement or manually input data.', icon: <FileText size={24} /> },
                { n: '02', t: 'AI Analysis', d: 'Our smart engine identifies major cost drivers and trends.', icon: <Brain size={24} /> },
                { n: '03', t: 'Smart Tips', d: 'Personalized advice to stop the leakage and optimize consumption.', icon: <Lightbulb size={24} /> },
                { n: '04', t: 'Habit Simulator', d: 'Adjust your daily habits to see immediate financial impact.', icon: <Sliders size={24} /> },
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                >
                  {/* Circle Pin */}
                  <div className="absolute left-[27px] md:left-1/2 md:-translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full transform -translate-y-1/2 top-1/2 md:top-1/2 z-20 shadow-[0_0_15px_rgba(179,224,220,0.8)]" />
                  
                  {/* Content Panel (Left/Top) */}
                  <div className={`flex-1 w-full ${idx % 2 === 0 ? 'md:text-right' : 'hidden md:block'}`}>
                    {idx % 2 === 0 && (
                      <div className="md:pr-12">
                        <Typography variant="h2" className="text-6xl font-black text-white/5 font-mono leading-none mb-1">{step.n}</Typography>
                        <Typography variant="h4" className="text-2xl font-black text-white mb-3">{step.t}</Typography>
                        <Typography className="text-slate-400 font-medium leading-relaxed max-w-md md:ml-auto">{step.d}</Typography>
                      </div>
                    )}
                  </div>

                  {/* Icon Node */}
                  <motion.div 
                    whileHover={{ scale: 1.2, boxShadow: '0 0 30px rgba(179,224,220,0.4)', borderColor: '#B3E0DC' }}
                    className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-white/5 flex items-center justify-center text-secondary relative z-10 transition-colors shrink-0"
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content Panel (Right/Bottom) */}
                  <div className={`flex-1 w-full ${idx % 2 !== 0 ? 'md:text-left' : 'md:hidden'}`}>
                    <div className={`${idx % 2 !== 0 ? 'md:pl-12' : ''}`}>
                      <Typography variant="h2" className="text-6xl font-black text-white/5 font-mono leading-none mb-1">{step.n}</Typography>
                      <Typography variant="h4" className="text-2xl font-black text-white mb-3">{step.t}</Typography>
                      <Typography className="text-slate-400 font-medium leading-relaxed max-w-md">{step.d}</Typography>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Product Highlight / Demo Section */}
      <section className="py-32 bg-white overflow-hidden">
        <Container maxWidth="lg">
          <Grid container spacing={8} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h2" className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                  See How Small Changes <br />
                  <span className="text-secondary text-primary">Reduce Your Bill</span>
                </Typography>
                <Typography variant="h6" className="text-slate-600 mb-6 font-bold text-xl">
                  Simulate changes and see instant impact on your bill.
                </Typography>
                <div className="space-y-5">
                   {[
                     "Reduce AC usage by 2 hours → Save ₹450/month",
                     "Switch appliances to eco mode → Save ₹300/month",
                     "Shift usage off peak hours → Improve efficiency score",
                   ].map((item, i) => (
                     <div key={i} className="flex items-start gap-4">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0" />
                        <Typography className="text-slate-600 font-medium">{item}</Typography>
                     </div>
                   ))}
                </div>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative p-6 md:p-10 bg-slate-50 rounded-[40px] shadow-inner border border-slate-100"
              >
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
                
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mockup Energy Score */}
                  <Paper className="p-6 rounded-3xl shadow-lg border border-slate-50 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent flex items-center justify-center">
                      <Typography className="font-bold text-emerald-600">90</Typography>
                    </div>
                    <div>
                      <Typography variant="caption" className="text-slate-400 font-bold uppercase">Energy Score</Typography>
                      <Typography variant="body1" className="font-bold">84 → 90</Typography>
                    </div>
                  </Paper>

                  {/* Mockup Savings */}
                  <Paper className="p-6 rounded-3xl shadow-lg border border-slate-50 bg-secondary text-white">
                    <Typography variant="caption" className="text-white/60 font-bold uppercase tracking-wider italic">Savings</Typography>
                    <Typography variant="h4" className="font-bold">₹1,240</Typography>
                    <Typography variant="caption" className="block mt-1 font-bold">Monthly Estimate</Typography>
                  </Paper>

                  {/* Mockup Usage Comparison */}
                  <Paper className="p-6 rounded-3xl shadow-lg border border-slate-50 md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <Typography variant="subtitle2" className="font-black text-slate-800 uppercase tracking-widest">Efficiency Boost</Typography>
                      <span className="text-emerald-500 font-bold text-sm bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ArrowDown size={14} /> 14% reduction
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Typography variant="caption" className="text-slate-400 font-bold uppercase tracking-tighter block">Baseline</Typography>
                        <Typography variant="h4" className="font-black text-slate-400">312 <span className="text-sm font-medium">kWh</span></Typography>
                      </div>
                      <div className="space-y-4">
                        <Typography variant="caption" className="text-secondary font-bold uppercase tracking-tighter block">Optimized</Typography>
                        <Typography variant="h4" className="font-black text-secondary">268 <span className="text-sm font-medium">kWh</span></Typography>
                      </div>
                    </div>
                    
                    {/* Progress visual */}
                    <div className="mt-6 flex gap-1 h-2">
                       <div className="flex-[312] bg-slate-100 rounded-l-full overflow-hidden">
                          <div className="h-full bg-slate-300 w-full opacity-30" />
                       </div>
                       <div className="flex-[268] bg-secondary rounded-r-full" />
                    </div>
                  </Paper>
                </div>
                
                <div className="mt-10 px-4">
                  <Typography align="center" className="text-slate-900 font-bold text-sm">
                    “Simulate changes and see instant impact on your bill”
                  </Typography>
                  <Typography align="center" className="text-slate-400 text-xs mt-2 italic">
                    Based on your current usage patterns and simulator inputs
                  </Typography>
                </div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary text-white relative overflow-hidden flex flex-col items-center justify-center text-center min-h-auto mb-0" style={{ padding: '80px 20px 40px' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        <Container maxWidth={false} className="relative z-10 p-0 m-0" style={{ maxWidth: '640px' }}>
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="flex flex-col items-center gap-4"
          >
            <Typography variant="h3" className="font-black text-4xl md:text-6xl tracking-tight" style={{ lineHeight: 1.2, marginBottom: '8px' }}>
              Start Optimizing Your <br /> Energy Today
            </Typography>
            <Typography variant="h6" className="text-white/80 font-medium text-xl leading-relaxed" style={{ marginBottom: '12px', opacity: 0.8 }}>
              Get your personalized energy insights in under 30 seconds.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              component={Link} 
              to="/input"
              className="px-14 py-5 text-xl font-black rounded-3xl shadow-2xl bg-white text-secondary hover:bg-slate-50 transform transition-transform hover:scale-105"
            >
              Get Your Energy Score
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Pre-Footer Transition */}
      <div className="py-12 bg-slate-900 border-b border-white/5 mt-0">
         <Typography align="center" className="text-white/40 text-sm font-bold uppercase tracking-widest">
            Built for smarter homes and better energy decisions.
         </Typography>
      </div>

      {/* Footer */}
      <footer className="py-20 bg-slate-900 text-slate-400">
        <Container maxWidth="lg" className="flex flex-col md:flex-row justify-between items-center gap-10">
          <Logo className="invert opacity-70" />
          <div className="flex gap-10 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <Typography variant="caption" className="font-medium">© 2026 Quarkwise. All rights reserved.</Typography>
        </Container>
      </footer>
    </div>
  );
};
