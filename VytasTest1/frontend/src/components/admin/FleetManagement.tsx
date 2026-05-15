import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  LocalShipping as TruckIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface Truck {
  id: string;
  licensePlate: string;
  model: string;
  capacity: number;
  maxWeight: number;
  status: 'available' | 'in_use' | 'maintenance';
  currentDriver?: string;
  currentLocation?: string;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'on_duty' | 'off_duty' | 'on_break';
  assignedTruck?: string;
  currentLocation?: string;
  totalDeliveries: number;
  rating: number;
  joinedDate: string;
}

const FleetManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [truckDialogOpen, setTruckDialogOpen] = useState(false);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuType, setMenuType] = useState<'truck' | 'driver'>('truck');

  // Mock data
  const mockTrucks: Truck[] = [
    {
      id: 'truck-1',
      licensePlate: 'ABC-123',
      model: 'Mercedes Sprinter',
      capacity: 15,
      maxWeight: 3500,
      status: 'in_use',
      currentDriver: 'John Doe',
      currentLocation: 'Downtown',
      mileage: 45000,
      lastMaintenance: '2026-04-15',
      nextMaintenance: '2026-06-15',
    },
    {
      id: 'truck-2',
      licensePlate: 'XYZ-789',
      model: 'Ford Transit',
      capacity: 12,
      maxWeight: 3000,
      status: 'available',
      mileage: 32000,
      lastMaintenance: '2026-05-01',
      nextMaintenance: '2026-07-01',
    },
    {
      id: 'truck-3',
      licensePlate: 'DEF-456',
      model: 'Mercedes Sprinter',
      capacity: 15,
      maxWeight: 3500,
      status: 'maintenance',
      mileage: 78000,
      lastMaintenance: '2026-05-10',
      nextMaintenance: '2026-05-20',
    },
    {
      id: 'truck-4',
      licensePlate: 'GHI-321',
      model: 'Iveco Daily',
      capacity: 18,
      maxWeight: 4000,
      status: 'in_use',
      currentDriver: 'Jane Smith',
      currentLocation: 'North District',
      mileage: 56000,
      lastMaintenance: '2026-03-20',
      nextMaintenance: '2026-05-20',
    },
    {
      id: 'truck-5',
      licensePlate: 'JKL-654',
      model: 'Ford Transit',
      capacity: 12,
      maxWeight: 3000,
      status: 'available',
      mileage: 23000,
      lastMaintenance: '2026-05-05',
      nextMaintenance: '2026-07-05',
    },
  ];

  const mockDrivers: Driver[] = [
    {
      id: 'driver-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      licenseNumber: 'DL-123456',
      status: 'on_duty',
      assignedTruck: 'ABC-123',
      currentLocation: 'Downtown',
      totalDeliveries: 1250,
      rating: 4.8,
      joinedDate: '2024-01-15',
    },
    {
      id: 'driver-2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0102',
      licenseNumber: 'DL-234567',
      status: 'on_duty',
      assignedTruck: 'GHI-321',
      currentLocation: 'North District',
      totalDeliveries: 980,
      rating: 4.9,
      joinedDate: '2024-03-20',
    },
    {
      id: 'driver-3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phone: '+1-555-0103',
      licenseNumber: 'DL-345678',
      status: 'off_duty',
      totalDeliveries: 750,
      rating: 4.6,
      joinedDate: '2024-06-10',
    },
    {
      id: 'driver-4',
      name: 'Alice Williams',
      email: 'alice.williams@example.com',
      phone: '+1-555-0104',
      licenseNumber: 'DL-456789',
      status: 'on_break',
      assignedTruck: 'XYZ-789',
      currentLocation: 'South District',
      totalDeliveries: 1100,
      rating: 4.7,
      joinedDate: '2024-02-28',
    },
    {
      id: 'driver-5',
      name: 'Charlie Brown',
      email: 'charlie.brown@example.com',
      phone: '+1-555-0105',
      licenseNumber: 'DL-567890',
      status: 'off_duty',
      totalDeliveries: 450,
      rating: 4.5,
      joinedDate: '2025-09-15',
    },
  ];

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    item: Truck | Driver,
    type: 'truck' | 'driver'
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuType(type);
    if (type === 'truck') {
      setSelectedTruck(item as Truck);
    } else {
      setSelectedDriver(item as Driver);
    }
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get status color
  const getTruckStatusColor = (status: Truck['status']) => {
    const colors = {
      available: 'success',
      in_use: 'primary',
      maintenance: 'warning',
    };
    return colors[status] as 'success' | 'primary' | 'warning';
  };

  const getDriverStatusColor = (status: Driver['status']) => {
    const colors = {
      on_duty: 'success',
      off_duty: 'default',
      on_break: 'warning',
    };
    return colors[status] as 'success' | 'default' | 'warning';
  };

  // Calculate fleet statistics
  const fleetStats = {
    totalTrucks: mockTrucks.length,
    availableTrucks: mockTrucks.filter((t) => t.status === 'available').length,
    inUseTrucks: mockTrucks.filter((t) => t.status === 'in_use').length,
    maintenanceTrucks: mockTrucks.filter((t) => t.status === 'maintenance').length,
    totalDrivers: mockDrivers.length,
    onDutyDrivers: mockDrivers.filter((d) => d.status === 'on_duty').length,
    offDutyDrivers: mockDrivers.filter((d) => d.status === 'off_duty').length,
    onBreakDrivers: mockDrivers.filter((d) => d.status === 'on_break').length,
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Fleet Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage trucks, drivers, and assignments
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TruckIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Truck Fleet</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h4">{fleetStats.totalTrucks}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {fleetStats.availableTrucks}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    In Use
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {fleetStats.inUseTrucks}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Maintenance
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {fleetStats.maintenanceTrucks}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Utilization Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(fleetStats.inUseTrucks / fleetStats.totalTrucks) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Driver Team</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h4">{fleetStats.totalDrivers}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    On Duty
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {fleetStats.onDutyDrivers}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Off Duty
                  </Typography>
                  <Typography variant="h4">{fleetStats.offDutyDrivers}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    On Break
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {fleetStats.onBreakDrivers}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Active Rate
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(fleetStats.onDutyDrivers / fleetStats.totalDrivers) * 100}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Trucks" />
            <Tab label="Drivers" />
          </Tabs>
        </Box>

        {/* Trucks Tab */}
        {tabValue === 0 && (
          <Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setTruckDialogOpen(true)}
              >
                Add Truck
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>License Plate</TableCell>
                    <TableCell>Model</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Current Driver</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Mileage</TableCell>
                    <TableCell>Next Maintenance</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockTrucks.map((truck) => (
                    <TableRow key={truck.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {truck.licensePlate}
                        </Typography>
                      </TableCell>
                      <TableCell>{truck.model}</TableCell>
                      <TableCell>
                        {truck.capacity} m³ / {truck.maxWeight} kg
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={truck.status.replace('_', ' ')}
                          size="small"
                          color={getTruckStatusColor(truck.status)}
                          icon={
                            truck.status === 'maintenance' ? (
                              <BuildIcon />
                            ) : truck.status === 'in_use' ? (
                              <TruckIcon />
                            ) : (
                              <CheckCircleIcon />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>{truck.currentDriver || '-'}</TableCell>
                      <TableCell>{truck.currentLocation || '-'}</TableCell>
                      <TableCell>{truck.mileage.toLocaleString()} km</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(truck.nextMaintenance)}
                        </Typography>
                        {new Date(truck.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <Chip
                            label="Due Soon"
                            size="small"
                            color="warning"
                            sx={{ mt: 0.5, height: 20 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, truck, 'truck')}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Drivers Tab */}
        {tabValue === 1 && (
          <Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDriverDialogOpen(true)}
              >
                Add Driver
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Driver</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>License</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned Truck</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Deliveries</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockDrivers.map((driver) => (
                    <TableRow key={driver.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {driver.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {driver.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined {formatDate(driver.joinedDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{driver.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {driver.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={driver.status.replace('_', ' ')}
                          size="small"
                          color={getDriverStatusColor(driver.status)}
                        />
                      </TableCell>
                      <TableCell>{driver.assignedTruck || '-'}</TableCell>
                      <TableCell>{driver.currentLocation || '-'}</TableCell>
                      <TableCell>{driver.totalDeliveries.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>
                            {driver.rating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            / 5.0
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, driver, 'driver')}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAssignDialogOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <AssignmentIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {menuType === 'truck' ? 'Assign Driver' : 'Assign Truck'}
          </ListItemText>
        </MenuItem>
        {menuType === 'truck' && (
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <BuildIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Schedule Maintenance</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Add/Edit Truck Dialog */}
      <Dialog open={truckDialogOpen} onClose={() => setTruckDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Truck</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="License Plate" fullWidth required />
            <TextField label="Model" fullWidth required />
            <TextField label="Capacity (m³)" type="number" fullWidth required />
            <TextField label="Max Weight (kg)" type="number" fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="available">
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="in_use">In Use</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Current Mileage (km)" type="number" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTruckDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setTruckDialogOpen(false)}>
            Add Truck
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Driver Dialog */}
      <Dialog open={driverDialogOpen} onClose={() => setDriverDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Driver</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name" fullWidth required />
            <TextField label="Email" type="email" fullWidth required />
            <TextField label="Phone" fullWidth required />
            <TextField label="License Number" fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="off_duty">
                <MenuItem value="on_duty">On Duty</MenuItem>
                <MenuItem value="off_duty">Off Duty</MenuItem>
                <MenuItem value="on_break">On Break</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDriverDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDriverDialogOpen(false)}>
            Add Driver
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {menuType === 'truck' ? 'Assign Driver to Truck' : 'Assign Truck to Driver'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {menuType === 'truck'
                ? `Assigning driver to truck ${selectedTruck?.licensePlate}`
                : `Assigning truck to driver ${selectedDriver?.name}`}
            </Alert>
            <FormControl fullWidth>
              <InputLabel>
                {menuType === 'truck' ? 'Select Driver' : 'Select Truck'}
              </InputLabel>
              <Select label={menuType === 'truck' ? 'Select Driver' : 'Select Truck'}>
                {menuType === 'truck'
                  ? mockDrivers
                      .filter((d) => !d.assignedTruck)
                      .map((driver) => (
                        <MenuItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.status}
                        </MenuItem>
                      ))
                  : mockTrucks
                      .filter((t) => t.status === 'available')
                      .map((truck) => (
                        <MenuItem key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.model}
                        </MenuItem>
                      ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAssignDialogOpen(false)}>
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FleetManagement;

// Made with Bob
