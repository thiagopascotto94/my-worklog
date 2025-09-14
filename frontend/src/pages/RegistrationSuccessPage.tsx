import React from 'react';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RegistrationSuccessPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography component="h1" variant="h4" gutterBottom>
          Registration Successful!
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          Thank you for signing up. You can now log in to your account.
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          color="primary"
          size="large"
        >
          Proceed to Login
        </Button>
      </Paper>
    </Container>
  );
};

export default RegistrationSuccessPage;
