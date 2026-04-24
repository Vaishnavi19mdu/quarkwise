import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, Divider, CircularProgress, Alert } from '@mui/material';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { pb } from '../../lib/pocketbase';

export const SignInPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authData = await pb.collection('users').authWithPassword(
        formData.email,
        formData.password
      );

      const role = authData.record.role;
      if (role === 'admin') {
        navigate('/admin');
      } else {
        const hasUsedInput = localStorage.getItem(`hasData_${authData.record.id}`);
        if (hasUsedInput) {
          navigate('/dashboard');
        } else {
          navigate('/input');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="flex items-center justify-center min-h-[85vh]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 560 }}
      >
        <Paper
          elevation={0}
          className="rounded-3xl border border-slate-200 text-center"
          sx={{ padding: { xs: '40px 32px', sm: '56px 56px' } }}
        >
          <Box className="flex justify-center mb-8" sx={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
            <Logo />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, letterSpacing: '-0.5px' }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mb: 5 }}>
            Sign in to manage your energy data.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 5, textAlign: 'left' }}
          >
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>
              </motion.div>
            )}

            <TextField
              fullWidth label="Email Address" variant="filled" type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                '& .MuiFilledInput-root': {
                  borderRadius: '10px', backgroundColor: '#f1f5f9',
                  border: '1.5px solid transparent', transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': { backgroundColor: '#e8eef5' },
                  '&.Mui-focused': { backgroundColor: '#f1f5f9', borderColor: 'secondary.main' },
                },
              }}
            />

            <TextField
              fullWidth label="Password" type="password" variant="filled"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                '& .MuiFilledInput-root': {
                  borderRadius: '10px', backgroundColor: '#f1f5f9',
                  border: '1.5px solid transparent', transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': { backgroundColor: '#e8eef5' },
                  '&.Mui-focused': { backgroundColor: '#f1f5f9', borderColor: 'secondary.main' },
                },
              }}
            />

            <Button
              fullWidth variant="contained" color="secondary" size="large" type="submit"
              disabled={isLoading}
              sx={{
                mt: 1, height: 52, fontWeight: 700, fontSize: '0.95rem',
                borderRadius: '10px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                textTransform: 'none', letterSpacing: '0.01em',
                '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.18)' },
              }}
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ mb: 4 }} />
          <Typography variant="body2" sx={{ color: '#475569' }}>
            New here?{' '}
            <Link onClick={() => navigate('/signup')} sx={{ cursor: 'pointer', fontWeight: 700, color: 'secondary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Create an account
            </Link>
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};