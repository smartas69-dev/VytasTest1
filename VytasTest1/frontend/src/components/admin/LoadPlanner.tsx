import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalShipping as TruckIcon,
  Inventory as InventoryIcon,
  Route as RouteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AutoAwesome as OptimizeIcon,
} from '@mui/icons-material';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  deliveryZone: string;
  timeSlot: string;
  totalItems: number;
  totalWeight: number;
  totalVolume: number;
  requiresRefrigeration: boolean;
  isFragile: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface Truck {
  id: string;
  licensePlate: string;
  model: string;
  capacity: number;
  maxWeight: number;
  status: 'available' | 'in_use';
}

interface LoadItem {
  order: Order;
  sequence: number;
}

interface OptimizationResult {
  utilization: number;
  totalWeight: number;
  totalVolume: number;
  estimatedDistance: number;
  estimatedTime: number;
  warnings: string[];
}

const LoadPlanner: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTruck, setSelectedTruck] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [loadItems, setLoadItems] = useState<LoadItem[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const steps = ['Select Truck & Driver', 'Select Orders', 'Optimize Load', 'Review & Create'];

  // Mock data
  const mockTrucks: Truck[] = [
    { id: 'truck-1', licensePlate: 'ABC-123', model: 'Mercedes Sprinter', capacity: 15, maxWeight: 3500, status: 'available' },
    { id: 'truck-2', licensePlate: 'XYZ-789', model: 'Ford Transit', capacity: 12, maxWeight: 3000, status: 'available' },
    { id: 'truck-3', licensePlate: 'JKL-654', model: 'Iveco Daily', capacity: 18, maxWeight: 4000, status: 'available' },
  ];

  const mockDrivers = [
    { id: 'driver-1', name: 'John Doe', status: 'available' },
    { id: 'driver-2', name: 'Jane Smith', status: 'available' },
    { id: 'driver-3', name: 'Bob Johnson', status: 'available' },
  ];

  const mockOrders: Order[] = Array.from({ length: 20 }, (_, i) => ({
    id: `order-${i + 1}`,
    orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
    customerName: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'][i % 5],
    deliveryAddress: ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm St', '654 Maple Dr'][i % 5],
    deliveryZone: ['Downtown', 'North District', 'South District'][i % 3],
    timeSlot: '2026-05-15 09:00-10:00',
    totalItems: Math.floor(Math.random() * 5) + 1,
    totalWeight: Math.floor(Math.random() * 50) + 10,
    totalVolume: Math.floor(Math.random() * 2) + 0.5,
    requiresRefrigeration: i % 4 === 0,
    isFragile: i % 3 === 0,
    priority: ['low', 'medium', 'high'][i % 3] as Order['priority'],
  }));

  // Handle next step
  const handleNext = () => {
    if (activeStep === 2) {
      // Run optimization
      runOptimization();
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle order selection
  const handleOrderToggle = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  // Run optimization
  const runOptimization = () => {
    const orders = mockOrders.filter((o) => selectedOrders.includes(o.id));
    const truck = mockTrucks.find((t) => t.id === selectedTruck);

    if (!truck || orders.length === 0) return;

    // Sort orders by priority and zone
    const sortedOrders = [...orders].sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return a.deliveryZone.localeCompare(b.deliveryZone);
    });

    // Create load items with sequence
    const items: LoadItem[] = sortedOrders.map((order, index) => ({
      order,
      sequence: index + 1,
    }));

    setLoadItems(items);

    // Calculate metrics
    const totalWeight = orders.reduce((sum, o) => sum + o.totalWeight, 0);
    const totalVolume = orders.reduce((sum, o) => sum + o.totalVolume, 0);
    const utilization = (totalVolume / truck.capacity) * 100;

    // Generate warnings
    const warnings: string[] = [];
    if (totalWeight > truck.maxWeight) {
      warnings.push(`Total weight (${totalWeight} kg) exceeds truck capacity (${truck.maxWeight} kg)`);
    }
    if (utilization > 100) {
      warnings.push(`Total volume (${totalVolume.toFixed(1)} m³) exceeds truck capacity (${truck.capacity} m³)`);
    }
    if (orders.some((o) => o.requiresRefrigeration)) {
      warnings.push('Some orders require refrigeration - ensure truck has cooling capability');
    }
    if (orders.some((o) => o.isFragile)) {
      warnings.push('Some orders contain fragile items - load carefully');
    }

    // Estimate distance and time (mock calculation)
    const estimatedDistance = orders.length * 5 + Math.random() * 10; // km
    const estimatedTime = orders.length * 15 + Math.random() * 30; // minutes

    setOptimizationResult({
      utilization,
      totalWeight,
      totalVolume,
      estimatedDistance,
      estimatedTime,
      warnings,
    });
  };

  // Handle create load
  const handleCreateLoad = () => {
    console.log('Creating load:', {
      truck: selectedTruck,
      driver: selectedDriver,
      orders: selectedOrders,
      loadItems,
      optimization: optimizationResult,
    });
    // Reset form
    setActiveStep(0);
    setSelectedTruck('');
    setSelectedDriver('');
    setSelectedOrders([]);
    setLoadItems([]);
    setOptimizationResult(null);
  };

  // Get priority color
  const getPriorityColor = (priority: Order['priority']) => {
    const colors = { high: 'error', medium: 'warning', low: 'default' };
    return colors[priority] as 'error' | 'warning' | 'default';
  };

  // Get selected truck
  const selectedTruckData = mockTrucks.find((t) => t.id === selectedTruck);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Load Planner
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create and optimize delivery loads
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent>
          {/* Step 1: Select Truck & Driver */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select Truck and Driver
              </Typography>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Truck</InputLabel>
                    <Select
                      value={selectedTruck}
                      label="Select Truck"
                      onChange={(e) => setSelectedTruck(e.target.value)}
                    >
                      {mockTrucks.map((truck) => (
                        <MenuItem key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.model} ({truck.capacity} m³, {truck.maxWeight} kg)
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedTruckData && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Capacity:</strong> {selectedTruckData.capacity} m³
                      </Typography>
                      <Typography variant="body2">
                        <strong>Max Weight:</strong> {selectedTruckData.maxWeight} kg
                      </Typography>
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Driver</InputLabel>
                    <Select
                      value={selectedDriver}
                      label="Select Driver"
                      onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                      {mockDrivers.map((driver) => (
                        <MenuItem key={driver.id} value={driver.id}>
                          {driver.name} - {driver.status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Select Orders */}
          {activeStep === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Select Orders</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedOrders.length} orders selected
                </Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={selectedOrders.length > 0 && selectedOrders.length < mockOrders.length}
                          checked={selectedOrders.length === mockOrders.length}
                          onChange={(e) =>
                            setSelectedOrders(e.target.checked ? mockOrders.map((o) => o.id) : [])
                          }
                        />
                      </TableCell>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Zone</TableCell>
                      <TableCell>Time Slot</TableCell>
                      <TableCell align="right">Weight</TableCell>
                      <TableCell align="right">Volume</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Special</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        hover
                        selected={selectedOrders.includes(order.id)}
                        onClick={() => handleOrderToggle(order.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedOrders.includes(order.id)} />
                        </TableCell>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.deliveryZone}</TableCell>
                        <TableCell>{order.timeSlot}</TableCell>
                        <TableCell align="right">{order.totalWeight} kg</TableCell>
                        <TableCell align="right">{order.totalVolume.toFixed(1)} m³</TableCell>
                        <TableCell>
                          <Chip label={order.priority} size="small" color={getPriorityColor(order.priority)} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {order.requiresRefrigeration && (
                              <Chip label="Cold" size="small" color="info" sx={{ height: 20 }} />
                            )}
                            {order.isFragile && (
                              <Chip label="Fragile" size="small" color="warning" sx={{ height: 20 }} />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Step 3: Optimize Load */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Load Optimization
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Click "Next" to run the optimization algorithm. The system will analyze order weights, volumes,
                priorities, and delivery zones to create an optimal loading sequence.
              </Alert>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <TruckIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">{selectedOrders.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Orders Selected
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <InventoryIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">
                      {mockOrders
                        .filter((o) => selectedOrders.includes(o.id))
                        .reduce((sum, o) => sum + o.totalWeight, 0)
                        .toFixed(0)}{' '}
                      kg
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Weight
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <RouteIcon sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">
                      {mockOrders
                        .filter((o) => selectedOrders.includes(o.id))
                        .reduce((sum, o) => sum + o.totalVolume, 0)
                        .toFixed(1)}{' '}
                      m³
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Volume
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 4: Review & Create */}
          {activeStep === 3 && optimizationResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Load Plan
              </Typography>

              {/* Optimization Results */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Space Utilization
                      </Typography>
                      <Typography variant="h4" color={optimizationResult.utilization > 100 ? 'error' : 'success.main'}>
                        {optimizationResult.utilization.toFixed(1)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(optimizationResult.utilization, 100)}
                        color={optimizationResult.utilization > 100 ? 'error' : 'success'}
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Weight
                      </Typography>
                      <Typography variant="h4">{optimizationResult.totalWeight.toFixed(0)} kg</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Max: {selectedTruckData?.maxWeight} kg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Est. Distance
                      </Typography>
                      <Typography variant="h4">{optimizationResult.estimatedDistance.toFixed(1)} km</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Route optimized
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Est. Time
                      </Typography>
                      <Typography variant="h4">{Math.round(optimizationResult.estimatedTime)} min</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Including stops
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Warnings */}
              {optimizationResult.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Warnings:
                  </Typography>
                  {optimizationResult.warnings.map((warning, index) => (
                    <Typography key={index} variant="body2">
                      • {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* Loading Sequence */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Loading Sequence
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Orders are sorted by priority and delivery zone for optimal loading
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Seq</TableCell>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Zone</TableCell>
                      <TableCell align="right">Weight</TableCell>
                      <TableCell align="right">Volume</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadItems.map((item) => (
                      <TableRow key={item.order.id}>
                        <TableCell>
                          <Chip label={item.sequence} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{item.order.orderNumber}</TableCell>
                        <TableCell>{item.order.customerName}</TableCell>
                        <TableCell>{item.order.deliveryZone}</TableCell>
                        <TableCell align="right">{item.order.totalWeight} kg</TableCell>
                        <TableCell align="right">{item.order.totalVolume.toFixed(1)} m³</TableCell>
                        <TableCell>
                          <Chip label={item.order.priority} size="small" color={getPriorityColor(item.order.priority)} />
                        </TableCell>
                        <TableCell>
                          {item.order.requiresRefrigeration && 'Refrigeration required. '}
                          {item.order.isFragile && 'Handle with care.'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => setPreviewDialogOpen(true)}>
                  Preview Instructions
                </Button>
              </Box>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleCreateLoad}
                  startIcon={<CheckCircleIcon />}
                  disabled={optimizationResult?.warnings.some((w) => w.includes('exceeds'))}
                >
                  Create Load
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && (!selectedTruck || !selectedDriver)) ||
                    (activeStep === 1 && selectedOrders.length === 0)
                  }
                  startIcon={activeStep === 2 ? <OptimizeIcon /> : undefined}
                >
                  {activeStep === 2 ? 'Optimize' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onClose={() => setPreviewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Loading Instructions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Follow this sequence for optimal load distribution and delivery efficiency
          </Typography>
          <List>
            {loadItems.map((item, index) => (
              <React.Fragment key={item.order.id}>
                <ListItem>
                  <ListItemText
                    primary={`${index + 1}. ${item.order.orderNumber} - ${item.order.customerName}`}
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {item.order.deliveryAddress} ({item.order.deliveryZone})
                        </Typography>
                        <br />
                        <Typography variant="caption" component="span">
                          {item.order.totalWeight} kg • {item.order.totalVolume.toFixed(1)} m³
                          {item.order.requiresRefrigeration && ' • Refrigeration'}
                          {item.order.isFragile && ' • Fragile'}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < loadItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          <Button variant="contained">Print Instructions</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoadPlanner;

// Made with Bob
