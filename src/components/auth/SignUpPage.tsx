import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, MenuItem, Divider, CircularProgress, Alert } from '@mui/material';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { pb } from '../../lib/pocketbase';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    pincode: '', homeType: '', householdSize: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await pb.collection('users').create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        pincode: formData.pincode,
        homeType: formData.homeType,
        householdSize: formData.householdSize,
        role: 'user',
      });

      await pb.collection('users').authWithPassword(formData.email, formData.password);
      navigate('/input');
    } catch (err: any) {
      const msg = err?.response?.data;
      if (msg?.email) setError('This email is already registered.');
      else setError(err?.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="flex items-center justify-center py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 560 }}>
        <Paper className="p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100 text-center">
          <Box className="mb-6 flex justify-center" sx={{ transform: 'scale(1.1)', transformOrigin: 'center' }}>
            <Logo />
          </Box>
          <Typography variant="h5" className="font-bold mb-1 text-slate-900">Join Quarkwise</Typography>
          <Typography variant="body2" className="text-slate-500 mb-8">Start your journey to smarter energy usage.</Typography>

          <form onSubmit={handleSubmit} className="text-left">
            {error && <Alert severity="error" className="mb-6">{error}</Alert>}

            <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-400 mb-4 block">Personal Info</Typography>
            <Box className="space-y-6 mb-10">
              <TextField fullWidth label="Full Name" variant="outlined"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
              <TextField fullWidth label="Email Address" variant="outlined" type="email"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>

            <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-400 mb-4 block">Account</Typography>
            <Box className="space-y-6 mb-10">
              <TextField fullWidth label="Password" type="password" variant="outlined"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
              <TextField fullWidth label="Confirm Password" type="password" variant="outlined"
                value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
            </Box>

            <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-400 mb-4 block">Household Info</Typography>
            <Box className="space-y-6 mb-10">
              <Box>
                <TextField fullWidth label="Pincode" variant="outlined"
                  value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                  required sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                <Typography variant="caption" className="text-slate-400 mt-1 block ml-1">Used to compare with similar households</Typography>
              </Box>
              <TextField select fullWidth label="Home Type" value={formData.homeType}
                onChange={(e) => setFormData({...formData, homeType: e.target.value})}
                required sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Independent House">Independent House</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
              </TextField>
              <TextField select fullWidth label="Household Size" value={formData.householdSize}
                onChange={(e) => setFormData({...formData, householdSize: e.target.value})}
                required sx={{ mt: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}>
                <MenuItem value="1-2">1–2 people</MenuItem>
                <MenuItem value="3-5">3–5 people</MenuItem>
                <MenuItem value="5+">5+ people</MenuItem>
              </TextField>
            </Box>

            <Button fullWidth variant="contained" color="secondary" size="large" type="submit"
              disabled={isLoading} className="h-[44px] font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Divider className="my-6" />
          <Box>
            <Typography variant="body2" className="text-slate-600">
              Already have an account?{' '}
              <Link onClick={() => navigate('/signin')} className="cursor-pointer font-bold text-secondary no-underline hover:underline">
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};