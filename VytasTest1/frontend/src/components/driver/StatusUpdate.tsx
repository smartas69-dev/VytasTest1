import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  LocalShipping as TruckIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Restaurant as RestaurantIcon,
  Build as BuildIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface StatusLog {
  id: string;
  timestamp: string;
  status: string;
  location?: string;
  notes?: string;
}

const StatusUpdate: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<'on_duty' | 'on_break' | 'off_duty'>('on_duty');
  const [breakType, setBreakType] = useState<'lunch' | 'rest' | 'fuel' | 'maintenance'>('lunch');
  const [statusNotes, setStatusNotes] = useState('');
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false);

  // Mock status logs
  const statusLogs: StatusLog[] = [
    {
      id: 'log-1',
      timestamp: '09:00 AM',
      status: 'Started Shift',
      location: 'Warehouse',
      notes: 'Loaded truck ABC-123 with 8 deliveries',
    },
    {
      id: 'log-2',
      timestamp: '09:15 AM',
      status: 'En Route',
      location: 'Downtown',
    },
    {
      id: 'log-3',
      timestamp: '09:30 AM',
      status: 'Delivery Completed',
      location: '123 Main St',
      notes: 'Order ORD-000123 delivered successfully',
    },
    {
      id: 'log-4',
      timestamp: '10:00 AM',
      status: 'Delivery Completed',
      location: '456 Oak Ave',
      notes: 'Order ORD-000124 delivered successfully',
    },
    {
      id: 'log-5',
      timestamp: '10:30 AM',
      status: 'Delivery Completed',
      location: '789 Pine Rd',
      notes: 'Order ORD-000125 delivered successfully',
    },
  ];

  // Mock driver info
  const driverInfo = {
    name: 'John Doe',
    truckPlate: 'ABC-123',
    shiftStart: '09:00 AM',
    deliveriesCompleted: 3,
    deliveriesRemaining: 5,
    currentLocation: 'North District',
  };

  // Handle start break
  const handleStartBreak = () => {
    console.log('Start break:', breakType, statusNotes);
    setCurrentStatus('on_break');
    setBreakDialogOpen(false);
    setStatusNotes('');
  };

  // Handle end break
  const handleEndBreak = () => {
    console.log('End break');
    setCurrentStatus('on_duty');
  };

  // Handle end shift
  const handleEndShift = () => {
    console.log('End shift:', statusNotes);
    setCurrentStatus('off_duty');
    setEndShiftDialogOpen(false);
    setStatusNotes('');
  };

  // Get status color
  const getStatusColor = () => {
    switch (currentStatus) {
      case 'on_duty':
        return 'success';
      case 'on_break':
        return 'warning';
      case 'off_duty':
        return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'on_duty':
        return <TruckIcon />;
      case 'on_break':
        return <PauseIcon />;
      case 'off_duty':
        return <CheckCircleIcon />;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Status Update
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your shift and break status
        </Typography>
      </Box>

      {/* Current Status Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Status
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={getStatusIcon()}
                  label={currentStatus.replace('_', ' ').toUpperCase()}
                  color={getStatusColor()}
                  size="large"
                  sx={{ fontSize: '1rem', py: 2.5 }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Shift Started
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {driverInfo.shiftStart}
              </Typography>
            </Box>
          </Box>

          {/* Driver Info */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Driver
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {driverInfo.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Truck
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {driverInfo.truckPlate}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {driverInfo.currentLocation}
              </Typography>
            </Box>
          </Box>

          {/* Progress */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Deliveries Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {driverInfo.deliveriesCompleted} / {driverInfo.deliveriesCompleted + driverInfo.deliveriesRemaining}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Completed
                </Typography>
                <Typography variant="h6" color="success.main">
                  {driverInfo.deliveriesCompleted}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Remaining
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {driverInfo.deliveriesRemaining}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Status Actions */}
          {currentStatus === 'on_duty' && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PauseIcon />}
                onClick={() => setBreakDialogOpen(true)}
                fullWidth
                size="large"
              >
                Start Break
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CheckCircleIcon />}
                onClick={() => setEndShiftDialogOpen(true)}
                fullWidth
                size="large"
              >
                End Shift
              </Button>
            </Box>
          )}

          {currentStatus === 'on_break' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                You are currently on break. Resume your shift when ready.
              </Typography>
            </Alert>
          )}

          {currentStatus === 'on_break' && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleEndBreak}
              fullWidth
              size="large"
            >
              Resume Shift
            </Button>
          )}

          {currentStatus === 'off_duty' && (
            <Alert severity="info">
              <Typography variant="body2">
                Your shift has ended. Thank you for your work today!
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Status Log */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Today's Activity Log</Typography>
          </Box>
          <List>
            {statusLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: 'white',
                      }}
                    >
                      <InfoIcon />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {log.status}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.timestamp}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        {log.location && (
                          <Typography variant="body2" component="span">
                            📍 {log.location}
                          </Typography>
                        )}
                        {log.notes && (
                          <>
                            <br />
                            <Typography variant="body2" component="span" color="text.secondary">
                              {log.notes}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < statusLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Start Break Dialog */}
      <Dialog open={breakDialogOpen} onClose={() => setBreakDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Start Break
            <IconButton onClick={() => setBreakDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info">
              <Typography variant="body2">
                Select the type of break and add any notes if needed.
              </Typography>
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Break Type</InputLabel>
              <Select value={breakType} label="Break Type" onChange={(e) => setBreakType(e.target.value as any)}>
                <MenuItem value="lunch">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantIcon fontSize="small" />
                    Lunch Break
                  </Box>
                </MenuItem>
                <MenuItem value="rest">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PauseIcon fontSize="small" />
                    Rest Break
                  </Box>
                </MenuItem>
                <MenuItem value="fuel">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TruckIcon fontSize="small" />
                    Fuel Stop
                  </Box>
                </MenuItem>
                <MenuItem value="maintenance">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon fontSize="small" />
                    Vehicle Maintenance
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add any additional notes..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreakDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStartBreak} startIcon={<PauseIcon />}>
            Start Break
          </Button>
        </DialogActions>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={endShiftDialogOpen} onClose={() => setEndShiftDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            End Shift
            <IconButton onClick={() => setEndShiftDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="warning" icon={<WarningIcon />}>
              <Typography variant="body2">
                Are you sure you want to end your shift? Make sure all deliveries are completed or properly reported.
              </Typography>
            </Alert>

            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Shift Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Deliveries Completed:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {driverInfo.deliveriesCompleted}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Deliveries Remaining:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: driverInfo.deliveriesRemaining > 0 ? 'warning.main' : 'success.main' }}>
                  {driverInfo.deliveriesRemaining}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Shift Duration:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  ~4 hours
                </Typography>
              </Box>
            </Box>

            {driverInfo.deliveriesRemaining > 0 && (
              <Alert severity="warning">
                <Typography variant="body2">
                  You still have {driverInfo.deliveriesRemaining} pending deliveries. Please ensure they are reassigned or rescheduled.
                </Typography>
              </Alert>
            )}

            <TextField
              label="End of Shift Notes (Optional)"
              multiline
              rows={3}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Any issues, feedback, or notes about today's shift..."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndShiftDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleEndShift} startIcon={<CheckCircleIcon />}>
            End Shift
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatusUpdate;

// Made with Bob
