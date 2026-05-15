/**
 * Main App Component
 * Root component with routing and layout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrderIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import AdminPage from './pages/AdminPage';
import CustomersPage from './pages/CustomersPage';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Placeholder components
const HomePage = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h2" gutterBottom>
      Last Mile Delivery System
    </Typography>
    <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
      Efficient logistics management for last mile delivery
    </Typography>
    <Box sx={{ mt: 4 }}>
      <Button
        component={Link}
        to="/orders"
        variant="contained"
        size="large"
        startIcon={<OrderIcon />}
        sx={{ mr: 2 }}
      >
        View Orders
      </Button>
      <Button
        component={Link}
        to="/admin"
        variant="outlined"
        size="large"
        startIcon={<AdminIcon />}
        sx={{ mr: 2 }}
      >
        Administration
      </Button>
      <Button
        component={Link}
        to="/dashboard"
        variant="outlined"
        size="large"
        startIcon={<DashboardIcon />}
      >
        Dashboard
      </Button>
    </Box>
  </Box>
);

const OrdersPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Orders
    </Typography>
    <Typography color="text.secondary">
      Order management interface - to be implemented
    </Typography>
  </Box>
);

const DashboardPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Dashboard
    </Typography>
    <Typography color="text.secondary">
      Analytics and metrics dashboard - to be implemented
    </Typography>
  </Box>
);

const FleetPage = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Fleet Management
    </Typography>
    <Typography color="text.secondary">
      Truck and driver management - to be implemented
    </Typography>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* App Bar */}
          <AppBar position="static">
            <Toolbar>
              <TruckIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Last Mile Delivery
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/orders">
                Orders
              </Button>
              <Button color="inherit" component={Link} to="/customers">
                Customers
              </Button>
              <Button color="inherit" component={Link} to="/admin">
                Admin
              </Button>
              <Button color="inherit" component={Link} to="/fleet">
                Fleet
              </Button>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Container component="main" sx={{ flex: 1, py: 4 }} maxWidth={false}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[200]
                  : theme.palette.grey[800],
            }}
          >
            <Container maxWidth="sm">
              <Typography variant="body2" color="text.secondary" align="center">
                Last Mile Delivery System © {new Date().getFullYear()}
              </Typography>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

// Made with Bob
