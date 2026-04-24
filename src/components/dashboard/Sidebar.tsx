import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Paper } from '@mui/material';
import { LayoutDashboard, Sliders, FileText, Settings, Zap, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';

const menuItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, sectionId: null,        route: '/dashboard' },
  { text: 'Simulator', icon: <Sliders size={20} />,         sectionId: 'simulator', route: null },
  { text: 'Insights',  icon: <Zap size={20} />,             sectionId: 'insights',  route: null },
  { text: 'Reports',   icon: <FileText size={20} />,         sectionId: 'reports',   route: null },
  { text: 'Settings',  icon: <Settings size={20} />,         sectionId: null,        route: '/settings' },
];

// Retry scrolling to a hash element — the DOM may not be ready immediately after navigation
function scrollToHash(hash: string) {
  const attempt = (retries: number) => {
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (retries > 0) {
      setTimeout(() => attempt(retries - 1), 120);
    }
  };
  attempt(8); // up to ~1 second of retries
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Keep highlight in sync with current route + hash
  useEffect(() => {
    if (location.pathname === '/settings') {
      setActiveItem('Settings');
      return;
    }
    const hash = location.hash.replace('#', '');
    const found = menuItems.find(item => item.sectionId === hash);
    setActiveItem(found ? found.text : 'Dashboard');
  }, [location]);

  // When React Router lands us on /dashboard#section, scroll once the page renders
  useEffect(() => {
    if (location.pathname === '/dashboard' && location.hash) {
      scrollToHash(location.hash.replace('#', ''));
    }
  }, [location.pathname, location.hash]);

  const handleNav = (item: typeof menuItems[0]) => {
    setActiveItem(item.text);

    // Explicit route items (Dashboard, Settings)
    if (item.route) {
      navigate(item.route);
      return;
    }

    // Section items — navigate to dashboard with hash if not already there
    if (location.pathname !== '/dashboard') {
      navigate(`/dashboard#${item.sectionId}`);
      return;
    }

    // Already on dashboard — scroll directly
    if (!item.sectionId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(item.sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${item.sectionId}`);
    }
  };

  return (
    <Box className="w-[240px] h-screen fixed left-0 top-0 bg-white border-r border-slate-100 flex-col z-50 hidden md:flex">
      {/* Logo */}
      <Box className="h-16 flex items-center px-8 border-b border-slate-50">
        <Logo className="scale-90 origin-left" />
      </Box>

      {/* Nav */}
      <Box className="flex-1 px-4 py-6">
        <List className="space-y-1">
          {menuItems.map((item) => {
            const isActive = activeItem === item.text;
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNav(item)}
                  className={`relative rounded-xl transition-all h-12 group overflow-hidden ${
                    isActive ? 'bg-[#b3e0dc33]' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                      style={{ backgroundColor: '#89994c' }}
                    />
                  )}
                  <ListItemIcon
                    className={`min-w-[40px] transition-colors ${
                      isActive ? 'text-[#89994c]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText>
                    <Typography
                      className={`font-black text-sm transition-colors ${
                        isActive ? 'text-[#89994c]' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.text}
                    </Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Plan + Logout */}
      <Box className="p-6 pt-0">
        <Paper className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
          <Typography variant="caption" className="text-slate-400 font-bold block mb-1 uppercase tracking-tighter">Plan</Typography>
          <Typography variant="body2" className="font-bold text-slate-800">Quarkwise Free</Typography>
          <Box className="mt-3">
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-3/4 rounded-full" />
            </div>
            <Typography variant="caption" className="text-slate-400 mt-1 block">75% of scans used</Typography>
          </Box>
        </Paper>

        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/signin')}
            className="rounded-xl transition-all h-12 hover:bg-red-50 group px-3"
          >
            <ListItemIcon className="text-red-400 min-w-[40px] group-hover:text-red-500">
              <LogOut size={20} />
            </ListItemIcon>
            <ListItemText>
              <Typography className="font-black text-sm text-red-500">Logout</Typography>
            </ListItemText>
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );
};