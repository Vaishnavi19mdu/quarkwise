import React, { useEffect, useState } from 'react';
import { Button, Container, Avatar } from '@mui/material';
import { Logo } from './ui/Logo';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { pb } from '../lib/pocketbase';

export const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isLanding = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isInput = location.pathname === '/input';

  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    if (isInput && user) {
      setShowGreeting(true);
      const timer = setTimeout(() => setShowGreeting(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isInput, user]);

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/signin');
  };

  const scrollToSection = (id: string) => {
    if (isLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-[60] transition-all duration-300 ${isDashboard ? 'md:ml-[240px]' : ''}`}>
      <Container maxWidth={isDashboard ? false : "lg"} className="h-16 flex items-center justify-between px-4 lg:px-8">

        {/* Left: Logo or Back button */}
        {isInput ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-secondary transition-colors font-bold text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>
        ) : (
          <RouterLink to="/" className="no-underline">
            <Logo />
          </RouterLink>
        )}

        {/* Center: Landing nav */}
        {isLanding && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider text-slate-500">
            <RouterLink to="/" className="hover:text-secondary transition-colors">Home</RouterLink>
            <button onClick={() => scrollToSection('features')} className="hover:text-secondary transition-colors uppercase font-bold tracking-wider">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-secondary transition-colors uppercase font-bold tracking-wider">How It Works</button>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isInput && user ? (
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {showGreeting && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm font-bold text-slate-600 hidden sm:block"
                  >
                    Hi, {user.name || user.email?.split('@')[0]} 👋
                  </motion.span>
                )}
              </AnimatePresence>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 700 }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </Avatar>
              <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} className="border-slate-200 text-slate-600 font-bold px-4 py-1.5 rounded-lg">
                Sign Out
              </Button>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: 14, fontWeight: 700 }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </Avatar>
              <Button variant="outlined" color="inherit" size="small" onClick={handleLogout} className="border-slate-200 text-slate-600 font-bold px-4 py-1.5 rounded-lg">
                Sign Out
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outlined" color="inherit" size="small" component={RouterLink} to="/signin" className="border-slate-200 text-slate-600 font-bold px-5 py-1.5 rounded-lg">
                Sign In
              </Button>
              <Button variant="contained" color="secondary" size="small" component={RouterLink} to="/signup" className="font-bold px-5 py-1.5 rounded-lg shadow-md">
                Sign Up
              </Button>
            </>
          )}
        </div>

      </Container>
    </div>
  );
};