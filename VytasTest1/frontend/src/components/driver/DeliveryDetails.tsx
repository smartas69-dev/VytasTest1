import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Navigation as NavigationIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Camera as CameraIcon,
  Description as DescriptionIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  isFragile: boolean;
  requiresRefrigeration: boolean;
}

interface DeliveryDetails {
  id: string;
  orderNumber: string;
  sequence: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  timeWindow: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  items: DeliveryItem[];
  totalWeight: number;
  requiresSignature: boolean;
  specialInstructions?: string;
  estimatedArrival: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  signatureUrl?: string;
  photoUrls?: string[];
  priority: 'low' | 'medium' | 'high';
}

const DeliveryDetailsComponent: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [failDialogOpen, setFailDialogOpen] = useState(false);
  const [signatureRequired, setSignatureRequired] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [failureReason, setFailureReason] = useState('');

  // Mock delivery data
  const delivery: DeliveryDetails = {
    id: id || 'del-4',
    orderNumber: 'ORD-000126',
    sequence: 4,
    customerName: 'Alice Williams',
    customerEmail: 'alice.williams@example.com',
    customerPhone: '+1-555-0104',
    deliveryAddress: '321 Elm St, North District, City, State 12345',
    timeWindow: '10:30 - 11:30',
    status: 'in_transit',
    items: [
      {
        id: 'item-1',
        name: 'Office Chair',
        quantity: 2,
        weight: 15,
        isFragile: false,
        requiresRefrigeration: false,
      },
      {
        id: 'item-2',
        name: 'Glass Table Top',
        quantity: 1,
        weight: 12,
        isFragile: true,
        requiresRefrigeration: false,
      },
      {
        id: 'item-3',
        name: 'Desk Lamp',
        quantity: 3,
        weight: 8,
        isFragile: true,
        requiresRefrigeration: false,
      },
    ],
    totalWeight: 35,
    requiresSignature: true,
    specialInstructions: 'Please call 5 minutes before arrival. Use service entrance.',
    estimatedArrival: '10:50 AM',
    priority: 'high',
  };

  // Handle back
  const handleBack = () => {
    navigate('/driver');
  };

  // Handle navigate
  const handleNavigate = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.deliveryAddress)}`,
      '_blank'
    );
  };

  // Handle call
  const handleCall = () => {
    window.location.href = `tel:${delivery.customerPhone}`;
  };

  // Handle complete delivery
  const handleCompleteDelivery = () => {
    console.log('Complete delivery:', {
      id: delivery.id,
      notes: deliveryNotes,
      signatureRequired,
    });
    setCompleteDialogOpen(false);
    navigate('/driver');
  };

  // Handle fail delivery
  const handleFailDelivery = () => {
    console.log('Fail delivery:', {
      id: delivery.id,
      reason: failureReason,
    });
    setFailDialogOpen(false);
    navigate('/driver');
  };

  // Handle take photo
  const handleTakePhoto = () => {
    console.log('Take photo');
    // In real app, open camera
  };

  // Get status color
  const getStatusColor = (status: DeliveryDetails['status']) => {
    const colors = {
      pending: 'default',
      in_transit: 'primary',
      delivered: 'success',
      failed: 'error',
    };
    return colors[status] as 'default' | 'primary' | 'success' | 'error';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Delivery #{delivery.sequence}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {delivery.orderNumber}
          </Typography>
        </Box>
        <Chip label={delivery.status.replace('_', ' ')} color={getStatusColor(delivery.status)} />
      </Box>

      {/* Status Alert */}
      {delivery.status === 'in_transit' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            This delivery is currently in progress. Complete or report an issue when finished.
          </Typography>
        </Alert>
      )}

      {/* Special Instructions */}
      {delivery.specialInstructions && (
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Special Instructions:
          </Typography>
          <Typography variant="body2">{delivery.specialInstructions}</Typography>
        </Alert>
      )}

      {/* Customer Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Customer Information</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {delivery.customerName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{delivery.customerEmail}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">{delivery.customerPhone}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<PhoneIcon />} onClick={handleCall} fullWidth>
              Call Customer
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Delivery Address</Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {delivery.deliveryAddress}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Time Window
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleIcon fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {delivery.timeWindow}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                ETA
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {delivery.estimatedArrival}
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<NavigationIcon />} onClick={handleNavigate} fullWidth>
            Navigate to Address
          </Button>
        </CardContent>
      </Card>

      {/* Package Items */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Package Items</Typography>
          </Box>
          <List>
            {delivery.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                        {item.isFragile && (
                          <Chip label="Fragile" size="small" color="warning" sx={{ height: 20 }} />
                        )}
                        {item.requiresRefrigeration && (
                          <Chip label="Cold" size="small" color="info" sx={{ height: 20 }} />
                        )}
                      </Box>
                    }
                    secondary={`Quantity: ${item.quantity} • Weight: ${item.weight} kg`}
                  />
                </ListItem>
                {index < delivery.items.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Total Items
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {delivery.items.reduce((sum, item) => sum + item.quantity, 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Total Weight
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {delivery.totalWeight} kg
              </Typography>
            </Box>
          </Box>
          {delivery.requiresSignature && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Signature Required:</strong> Customer signature must be collected upon delivery.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {delivery.status === 'in_transit' && (
        <Paper sx={{ p: 2, position: 'sticky', bottom: 0, zIndex: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={handleTakePhoto}
                fullWidth
                size="large"
              >
                Take Photo
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setFailDialogOpen(true)}
                fullWidth
                size="large"
              >
                Report Issue
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => setCompleteDialogOpen(true)}
                fullWidth
                size="large"
              >
                Complete
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Complete Delivery Dialog */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Delivery</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="success">
              <Typography variant="body2">
                Confirm that the delivery has been completed successfully.
              </Typography>
            </Alert>
            {delivery.requiresSignature && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={signatureRequired}
                    onChange={(e) => setSignatureRequired(e.target.checked)}
                  />
                }
                label="Signature collected"
              />
            )}
            <TextField
              label="Delivery Notes (Optional)"
              multiline
              rows={3}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Add any notes about the delivery..."
              fullWidth
            />
            <Button variant="outlined" startIcon={<CameraIcon />} onClick={handleTakePhoto}>
              Add Photo Proof
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCompleteDelivery}
            disabled={delivery.requiresSignature && !signatureRequired}
          >
            Confirm Completion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fail Delivery Dialog */}
      <Dialog open={failDialogOpen} onClose={() => setFailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Report Delivery Issue</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="error">
              <Typography variant="body2">
                Report why the delivery could not be completed.
              </Typography>
            </Alert>
            <TextField
              label="Reason for Failure"
              multiline
              rows={4}
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              placeholder="Customer not available, wrong address, etc..."
              required
              fullWidth
            />
            <Button variant="outlined" startIcon={<CameraIcon />} onClick={handleTakePhoto}>
              Add Photo Evidence
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFailDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleFailDelivery}
            disabled={!failureReason.trim()}
          >
            Report Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryDetailsComponent;

// Made with Bob
