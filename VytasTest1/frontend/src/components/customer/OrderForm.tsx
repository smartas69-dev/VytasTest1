import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';

interface DeliveryZone {
  id: string;
  name: string;
  code: string;
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

interface OrderFormProps {
  onSubmit: (data: OrderFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<OrderFormData>;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    deliveryAddress: initialData?.deliveryAddress || '',
    deliveryZoneId: initialData?.deliveryZoneId || '',
    specialInstructions: initialData?.specialInstructions || '',
    requiresSignature: initialData?.requiresSignature || false,
    contactBeforeDelivery: initialData?.contactBeforeDelivery || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof OrderFormData, boolean>>>({});

  // Mock delivery zones - In real app, fetch from API
  const deliveryZones: DeliveryZone[] = [
    { id: '1', name: 'Downtown', code: 'DT-001' },
    { id: '2', name: 'North District', code: 'ND-001' },
    { id: '3', name: 'South District', code: 'SD-001' },
    { id: '4', name: 'East District', code: 'ED-001' },
    { id: '5', name: 'West District', code: 'WD-001' },
  ];

  // Validation rules
  const validateField = (name: keyof OrderFormData, value: any): string => {
    switch (name) {
      case 'customerName':
        if (!value || value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        break;
      case 'customerEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'customerPhone':
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        if (!value || !phoneRegex.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;
      case 'deliveryAddress':
        if (!value || value.trim().length < 10) {
          return 'Please enter a complete delivery address';
        }
        break;
      case 'deliveryZoneId':
        if (!value) {
          return 'Please select a delivery zone';
        }
        break;
      default:
        return '';
    }
    return '';
  };

  // Handle field change
  const handleChange = (name: keyof OrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur
  const handleBlur = (name: keyof OrderFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof OrderFormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      deliveryAddress: true,
      deliveryZoneId: true,
    });

    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Get selected zone
  const selectedZone = deliveryZones.find((z) => z.id === formData.deliveryZoneId);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Delivery Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide your contact and delivery details
          </Typography>

          <Grid container spacing={3}>
            {/* Customer Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                <PersonIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                required
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                onBlur={() => handleBlur('customerName')}
                error={touched.customerName && !!errors.customerName}
                helperText={touched.customerName && errors.customerName}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                required
                value={formData.customerEmail}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
                onBlur={() => handleBlur('customerEmail')}
                error={touched.customerEmail && !!errors.customerEmail}
                helperText={touched.customerEmail && errors.customerEmail}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                required
                value={formData.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                onBlur={() => handleBlur('customerPhone')}
                error={touched.customerPhone && !!errors.customerPhone}
                helperText={touched.customerPhone && errors.customerPhone}
                disabled={loading}
                placeholder="+1 (555) 123-4567"
                slotProps={{
                  input: {
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Delivery Address */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                <LocationOnIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                Delivery Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                required
                multiline
                rows={2}
                value={formData.deliveryAddress}
                onChange={(e) => handleChange('deliveryAddress', e.target.value)}
                onBlur={() => handleBlur('deliveryAddress')}
                error={touched.deliveryAddress && !!errors.deliveryAddress}
                helperText={
                  touched.deliveryAddress && errors.deliveryAddress
                    ? errors.deliveryAddress
                    : 'Include street number, apartment/unit if applicable'
                }
                disabled={loading}
                placeholder="123 Main Street, Apt 4B"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                required
                error={touched.deliveryZoneId && !!errors.deliveryZoneId}
                disabled={loading}
              >
                <InputLabel>Delivery Zone</InputLabel>
                <Select
                  value={formData.deliveryZoneId}
                  label="Delivery Zone"
                  onChange={(e) => handleChange('deliveryZoneId', e.target.value)}
                  onBlur={() => handleBlur('deliveryZoneId')}
                >
                  <MenuItem value="">
                    <em>Select a zone</em>
                  </MenuItem>
                  {deliveryZones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.code})
                    </MenuItem>
                  ))}
                </Select>
                {touched.deliveryZoneId && errors.deliveryZoneId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.deliveryZoneId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {selectedZone && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, bgcolor: 'primary.50' }}>
                  <Typography variant="caption" color="text.secondary">
                    Selected Zone
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedZone.name}
                  </Typography>
                  <Chip label={selectedZone.code} size="small" sx={{ mt: 1 }} />
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Special Instructions */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                <NotesIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Instructions"
                multiline
                rows={3}
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
                disabled={loading}
                placeholder="e.g., Gate code, parking instructions, preferred entrance..."
                helperText="Optional: Any special delivery instructions"
              />
            </Grid>

            {/* Delivery Preferences */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requiresSignature}
                    onChange={(e) => handleChange('requiresSignature', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Signature required upon delivery"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.contactBeforeDelivery}
                    onChange={(e) => handleChange('contactBeforeDelivery', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Contact me before delivery"
              />
            </Grid>

            {/* Info Alert */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> You will receive email and SMS notifications about your
                  delivery status. Make sure your contact information is correct.
                </Typography>
              </Alert>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                    size="large"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {loading ? 'Processing...' : 'Continue to Review'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </form>
  );
};

export default OrderForm;

// Made with Bob
