import React from 'react';
import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, AppBar, Toolbar, Button } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientsPage from './pages/ClientsPage';
import ClientCreatePage from './pages/ClientCreatePage';
import ClientEditPage from './pages/ClientEditPage';
import ReportsPage from './pages/ReportsPage';
import ReportViewPage from './pages/ReportViewPage';
import PublicReportPage from './pages/PublicReportPage';
import ProtectedRoute from './components/ProtectedRoute';
import Timer from './components/Timer';
import RegistrationSuccessPage from './pages/RegistrationSuccessPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import PricingPage from './pages/PricingPage';

const isAuthenticated = () => {
  return localStorage.getItem('accessToken') !== null;
};

function App() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Freelancer Tracker
          </Typography>
          {isAuthenticated() && (
            <>
              <Button color="inherit" component={RouterLink} to="/">Dashboard</Button>
              <Button color="inherit" component={RouterLink} to="/clients">Clients</Button>
              <Button color="inherit" component={RouterLink} to="/reports">Reports</Button>
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/registration-success" element={<RegistrationSuccessPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
        <Route path="/clients/new" element={<ProtectedRoute><ClientCreatePage /></ProtectedRoute>} />
        <Route path="/clients/edit/:id" element={<ProtectedRoute><ClientEditPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/reports/:id" element={<ProtectedRoute><ReportViewPage /></ProtectedRoute>} />
        <Route path="/reports/public/:token" element={<PublicReportPage />} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

const DashboardPage = () => (
  <Container>
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Timer />
    </Box>
  </Container>
);

export default App;
