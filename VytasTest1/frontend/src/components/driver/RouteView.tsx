import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Navigation as NavigationIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Phone as PhoneIcon,
  DirectionsCar as DirectionsCarIcon,
  Map as MapIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface Stop {
  id: string;
  sequence: number;
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  timeWindow: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  items: number;
  weight: number;
  requiresSignature: boolean;
  specialInstructions?: string;
  estimatedArrival: string;
  distance: number; // km from previous stop
}

interface RouteInfo {
  routeId: string;
  truckPlate: string;
  totalStops: number;
  completedStops: number;
  totalDistance: number;
  estimatedDuration: number;
  startTime: string;
}

const RouteView: React.FC = () => {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Mock route info
  const routeInfo: RouteInfo = {
    routeId: 'ROUTE-001',
    truckPlate: 'ABC-123',
    totalStops: 8,
    completedStops: 3,
    totalDistance: 45.5,
    estimatedDuration: 240,
    startTime: '09:00 AM',
  };

  // Mock stops data
  const stops: Stop[] = [
    {
      id: 'stop-1',
      sequence: 1,
      orderNumber: 'ORD-000123',
      customerName: 'John Doe',
      address: '123 Main St, Downtown',
      phone: '+1-555-0101',
      timeWindow: '09:00 - 10:00',
      status: 'completed',
      items: 3,
      weight: 25,
      requiresSignature: true,
      estimatedArrival: '09:15 AM',
      distance: 5.2,
    },
    {
      id: 'stop-2',
      sequence: 2,
      orderNumber: 'ORD-000124',
      customerName: 'Jane Smith',
      address: '456 Oak Ave, Downtown',
      phone: '+1-555-0102',
      timeWindow: '09:30 - 10:30',
      status: 'completed',
      items: 2,
      weight: 18,
      requiresSignature: false,
      estimatedArrival: '09:45 AM',
      distance: 2.1,
    },
    {
      id: 'stop-3',
      sequence: 3,
      orderNumber: 'ORD-000125',
      customerName: 'Bob Johnson',
      address: '789 Pine Rd, North District',
      phone: '+1-555-0103',
      timeWindow: '10:00 - 11:00',
      status: 'completed',
      items: 5,
      weight: 42,
      requiresSignature: true,
      specialInstructions: 'Call before arrival',
      estimatedArrival: '10:20 AM',
      distance: 6.8,
    },
    {
      id: 'stop-4',
      sequence: 4,
      orderNumber: 'ORD-000126',
      customerName: 'Alice Williams',
      address: '321 Elm St, North District',
      phone: '+1-555-0104',
      timeWindow: '10:30 - 11:30',
      status: 'in_progress',
      items: 4,
      weight: 35,
      requiresSignature: true,
      estimatedArrival: '10:50 AM',
      distance: 3.5,
    },
    {
      id: 'stop-5',
      sequence: 5,
      orderNumber: 'ORD-000127',
      customerName: 'Charlie Brown',
      address: '654 Maple Dr, East District',
      phone: '+1-555-0105',
      timeWindow: '11:00 - 12:00',
      status: 'pending',
      items: 3,
      weight: 28,
      requiresSignature: false,
      estimatedArrival: '11:25 AM',
      distance: 8.2,
    },
    {
      id: 'stop-6',
      sequence: 6,
      orderNumber: 'ORD-000128',
      customerName: 'David Lee',
      address: '987 Cedar Ln, East District',
      phone: '+1-555-0106',
      timeWindow: '11:30 - 12:30',
      status: 'pending',
      items: 2,
      weight: 15,
      requiresSignature: true,
      specialInstructions: 'Leave at front desk',
      estimatedArrival: '11:55 AM',
      distance: 4.3,
    },
    {
      id: 'stop-7',
      sequence: 7,
      orderNumber: 'ORD-000129',
      customerName: 'Emma Wilson',
      address: '246 Birch Ave, South District',
      phone: '+1-555-0107',
      timeWindow: '12:00 - 13:00',
      status: 'pending',
      items: 6,
      weight: 48,
      requiresSignature: true,
      estimatedArrival: '12:30 PM',
      distance: 9.7,
    },
    {
      id: 'stop-8',
      sequence: 8,
      orderNumber: 'ORD-000130',
      customerName: 'Frank Miller',
      address: '135 Spruce St, South District',
      phone: '+1-555-0108',
      timeWindow: '12:30 - 13:30',
      status: 'pending',
      items: 3,
      weight: 22,
      requiresSignature: false,
      estimatedArrival: '13:00 PM',
      distance: 5.7,
    },
  ];

  // Get current stop
  const currentStop = stops.find((s) => s.status === 'in_progress');
  const nextStop = stops.find((s) => s.status === 'pending');

  // Calculate progress
  const progress = (routeInfo.completedStops / routeInfo.totalStops) * 100;

  // Handle view details
  const handleViewDetails = (stop: Stop) => {
    setSelectedStop(stop);
    setDetailsDialogOpen(true);
  };

  // Handle navigate
  const handleNavigate = (stop: Stop) => {
    console.log('Navigate to:', stop.address);
    // In real app, open maps with coordinates
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.address)}`, '_blank');
  };

  // Handle call customer
  const handleCall = (phone: string) => {
    console.log('Call:', phone);
    window.location.href = `tel:${phone}`;
  };

  // Get status color
  const getStatusColor = (status: Stop['status']) => {
    const colors = {
      pending: 'default',
      in_progress: 'primary',
      completed: 'success',
      failed: 'error',
    };
    return colors[status] as 'default' | 'primary' | 'success' | 'error';
  };

  // Get status icon
  const getStatusIcon = (status: Stop['status']) => {
    if (status === 'completed') return <CheckCircleIcon />;
    if (status === 'in_progress') return <DirectionsCarIcon />;
    return <LocationIcon />;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Today's Route
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {routeInfo.routeId} • Truck {routeInfo.truckPlate}
        </Typography>
      </Box>

      {/* Route Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Route Progress</Typography>
            <Chip
              label={`${routeInfo.completedStops} / ${routeInfo.totalStops} Stops`}
              color="primary"
              icon={<CheckCircleIcon />}
            />
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 1, mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total Distance
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {routeInfo.totalDistance} km
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Est. Duration
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {Math.floor(routeInfo.estimatedDuration / 60)}h {routeInfo.estimatedDuration % 60}m
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Start Time
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {routeInfo.startTime}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Current Stop */}
      {currentStop && (
        <Card sx={{ mb: 3, border: 2, borderColor: 'primary.main' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="overline" color="primary">
                  Current Stop
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Stop #{currentStop.sequence} - {currentStop.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentStop.address}
                </Typography>
              </Box>
              <Chip label="In Progress" color="primary" icon={<DirectionsCarIcon />} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<NavigationIcon />}
                onClick={() => handleNavigate(currentStop)}
                fullWidth
              >
                Navigate
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => handleCall(currentStop.phone)}
                fullWidth
              >
                Call
              </Button>
            </Box>
            <Alert severity="info" icon={<ScheduleIcon />}>
              Time Window: {currentStop.timeWindow} • ETA: {currentStop.estimatedArrival}
            </Alert>
            {currentStop.specialInstructions && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1 }}>
                {currentStop.specialInstructions}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Stop Preview */}
      {nextStop && (
        <Card sx={{ mb: 3, bgcolor: 'action.hover' }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Next Stop
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Stop #{nextStop.sequence} - {nextStop.customerName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {nextStop.address} • {nextStop.distance} km away
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* All Stops List */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">All Stops</Typography>
            <Button startIcon={<MapIcon />} variant="outlined" size="small">
              View Map
            </Button>
          </Box>
          <List>
            {stops.map((stop, index) => (
              <React.Fragment key={stop.id}>
                <ListItem
                  sx={{
                    bgcolor: stop.status === 'in_progress' ? 'primary.light' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: stop.status === 'completed' ? 'success.main' : stop.status === 'in_progress' ? 'primary.main' : 'action.selected',
                        color: 'white',
                      }}
                    >
                      {stop.status === 'completed' ? (
                        <CheckCircleIcon />
                      ) : (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {stop.sequence}
                        </Typography>
                      )}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {stop.customerName}
                        </Typography>
                        <Chip label={stop.status} size="small" color={getStatusColor(stop.status)} />
                        {stop.requiresSignature && (
                          <Chip label="Signature" size="small" variant="outlined" sx={{ height: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {stop.address}
                        </Typography>
                        <br />
                        <Typography variant="caption" component="span" color="text.secondary">
                          {stop.orderNumber} • {stop.items} items • {stop.weight} kg • {stop.timeWindow}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleViewDetails(stop)}>
                      <InfoIcon />
                    </IconButton>
                    {stop.status !== 'completed' && (
                      <>
                        <IconButton size="small" onClick={() => handleNavigate(stop)}>
                          <NavigationIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCall(stop.phone)}>
                          <PhoneIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </ListItem>
                {index < stops.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Stop Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Stop Details</DialogTitle>
        <DialogContent>
          {selectedStop && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stop #{selectedStop.sequence}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Order Number
                  </Typography>
                  <Typography variant="body1">{selectedStop.orderNumber}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1">{selectedStop.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStop.phone}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Delivery Address
                  </Typography>
                  <Typography variant="body1">{selectedStop.address}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Time Window
                  </Typography>
                  <Typography variant="body1">{selectedStop.timeWindow}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ETA: {selectedStop.estimatedArrival}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Package Details
                  </Typography>
                  <Typography variant="body1">
                    {selectedStop.items} items • {selectedStop.weight} kg
                  </Typography>
                  {selectedStop.requiresSignature && (
                    <Chip label="Signature Required" size="small" color="warning" sx={{ mt: 1 }} />
                  )}
                </Box>
                {selectedStop.specialInstructions && (
                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Special Instructions:</strong> {selectedStop.specialInstructions}
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedStop && selectedStop.status !== 'completed' && (
            <>
              <Button onClick={() => handleCall(selectedStop.phone)} startIcon={<PhoneIcon />}>
                Call Customer
              </Button>
              <Button
                variant="contained"
                onClick={() => handleNavigate(selectedStop)}
                startIcon={<NavigationIcon />}
              >
                Navigate
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RouteView;

// Made with Bob
