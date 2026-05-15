import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Alert,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Warning as WarningIcon,
  AcUnit as AcUnitIcon,
} from '@mui/icons-material';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface CartItem {
  item: {
    id: string;
    name: string;
    sku: string;
    category: string;
    weightKg: number;
    volumeM3: number;
    unitPrice: number;
    isFragile: boolean;
    requiresRefrigeration: boolean;
  };
  quantity: number;
}

interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZoneId: string;
  specialInstructions: string;
  requiresSignature: boolean;
  contactBeforeDelivery: boolean;
}

interface DeliveryZone {
  id: string;
  name: string;
  code: string;
}

interface BookingConfirmationProps {
  timeSlot: TimeSlot;
  cartItems: CartItem[];
  orderData: OrderFormData;
  deliveryZone: DeliveryZone;
  onConfirm: () => void;
  onEdit: () => void;
  loading?: boolean;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  timeSlot,
  cartItems,
  orderData,
  deliveryZone,
  onConfirm,
  onEdit,
  loading = false,
}) => {
  // Calculate totals
  const totals = cartItems.reduce(
    (acc, item) => ({
      weight: acc.weight + item.item.weightKg * item.quantity,
      volume: acc.volume + item.item.volumeM3 * item.quantity,
      price: acc.price + item.item.unitPrice * item.quantity,
      items: acc.items + item.quantity,
    }),
    { weight: 0, volume: 0, price: 0, items: 0 }
  );

  // Check for special handling requirements
  const hasFragileItems = cartItems.some((item) => item.item.isFragile);
  const hasRefrigeratedItems = cartItems.some((item) => item.item.requiresRefrigeration);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Box>
      {/* Success Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          bgcolor: 'success.50',
          border: '1px solid',
          borderColor: 'success.main',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.dark' }}>
              Review Your Order
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please review all details before confirming your delivery
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Delivery Time */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Delivery Time</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                {formatDate(timeSlot.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
              </Typography>
              <Chip
                label={deliveryZone.name}
                size="small"
                color="primary"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Contact Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ fontSize: 20, color: 'action.active' }} />
                  <Typography variant="body2">{orderData.customerName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 20, color: 'action.active' }} />
                  <Typography variant="body2">{orderData.customerEmail}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 20, color: 'action.active' }} />
                  <Typography variant="body2">{orderData.customerPhone}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Address */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Delivery Address</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">{orderData.deliveryAddress}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Zone: {deliveryZone.name} ({deliveryZone.code})
              </Typography>
              {orderData.specialInstructions && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Special Instructions:
                  </Typography>
                  <Typography variant="body2">{orderData.specialInstructions}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Order Items ({totals.items})</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List>
                {cartItems.map((cartItem, index) => (
                  <React.Fragment key={cartItem.item.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {cartItem.quantity}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">{cartItem.item.name}</Typography>
                            {cartItem.item.isFragile && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Fragile"
                                size="small"
                                color="warning"
                              />
                            )}
                            {cartItem.item.requiresRefrigeration && (
                              <Chip
                                icon={<AcUnitIcon />}
                                label="Cold"
                                size="small"
                                color="info"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {cartItem.item.sku} | Category: {cartItem.item.category}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {cartItem.item.weightKg} kg × {cartItem.quantity} ={' '}
                              {(cartItem.item.weightKg * cartItem.quantity).toFixed(2)} kg
                            </Typography>
                          </Box>
                        }
                      />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {formatPrice(cartItem.item.unitPrice * cartItem.quantity)}
                      </Typography>
                    </ListItem>
                    {index < cartItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                  <Typography variant="h6">{totals.items}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Weight
                  </Typography>
                  <Typography variant="h6">{totals.weight.toFixed(2)} kg</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
                  </Typography>
                  <Typography variant="h6">{totals.volume.toFixed(3)} m³</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Price
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(totals.price)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Preferences */}
        {(orderData.requiresSignature || orderData.contactBeforeDelivery) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocalShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Delivery Preferences</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {orderData.requiresSignature && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Signature required upon delivery"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {orderData.contactBeforeDelivery && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Contact before delivery"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Special Handling Alerts */}
        {(hasFragileItems || hasRefrigeratedItems) && (
          <Grid item xs={12}>
            <Alert severity="info" icon={<LocalShippingIcon />}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Special Handling Required
              </Typography>
              {hasFragileItems && (
                <Typography variant="body2">
                  • Your order contains fragile items that will be handled with extra care
                </Typography>
              )}
              {hasRefrigeratedItems && (
                <Typography variant="body2">
                  • Your order contains items requiring refrigeration during transport
                </Typography>
              )}
            </Alert>
          </Grid>
        )}

        {/* Terms and Conditions */}
        <Grid item xs={12}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Important:</strong> By confirming this order, you agree to our terms and
              conditions. You will receive email and SMS notifications about your delivery status.
              Please ensure someone is available to receive the delivery during the selected time
              slot.
            </Typography>
          </Alert>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="large"
              onClick={onEdit}
              disabled={loading}
            >
              Edit Order
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={onConfirm}
              disabled={loading}
              startIcon={<CheckCircleIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingConfirmation;

// Made with Bob
