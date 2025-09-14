import React, { useState, useRef } from 'react';
import { Button, Container, Typography, Box, Paper, TextField, Grid, Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

const EmailVerificationPage: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move focus to the next input
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authService.sendVerificationCode(email);
      setSuccess('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.verifyCode(email, verificationCode);
      localStorage.setItem('accessToken', response.data.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Email Verification
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          A verification code has been sent to <strong>{email}</strong>. Please enter the code below to verify your account.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {code.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                inputProps={{
                  maxLength: 1,
                  style: { textAlign: 'center', fontSize: '1.5rem', width: '2.5rem' },
                }}
                variant="outlined"
                required
              />
            ))}
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? 'Sending...' : "Didn't receive a code? Resend"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EmailVerificationPage;
