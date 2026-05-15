/**
 * Customer Form Component
 * Form for creating and editing customers
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerByIdQuery,
  CreateCustomerDTO,
} from '../../store/api/customersApi';

interface CustomerFormProps {
  customerId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  defaultAddress: string;
  defaultCoordinates: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customerId,
  onSuccess,
  onCancel,
}) => {
  const isEditMode = !!customerId;

  // API hooks
  const { data: customerResponse } = useGetCustomerByIdQuery(customerId!, {
    skip: !customerId,
  });
  const [createCustomer, { isLoading: isCreating, error: createError }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating, error: updateError }] = useUpdateCustomerMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    defaultAddress: '',
    defaultCoordinates: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load customer data in edit mode
  useEffect(() => {
    if (customerResponse?.data) {
      const customer = customerResponse.data;
      setFormData({
        email: customer.email || '',
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        phone: customer.phone || '',
        defaultAddress: customer.defaultAddress || '',
        defaultCoordinates: customer.defaultCoordinates || '',
      });
    }
  }, [customerResponse]);

  // Validation
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'firstName':
        if (!value) return 'First name is required';
        if (value.length < 2) return 'First name must be at least 2 characters';
        break;
      case 'lastName':
        if (!value) return 'Last name is required';
        if (value.length < 2) return 'Last name must be at least 2 characters';
        break;
      case 'phone':
        if (value && !/^[\d\s\-\+\(\)]{10,}$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;
      case 'defaultCoordinates':
        if (value && !/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(value)) {
          return 'Coordinates must be in format: latitude,longitude (e.g., 40.7128,-74.0060)';
        }
        break;
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate required fields
    (['email', 'firstName', 'lastName'] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Validate optional fields if they have values
    if (formData.phone) {
      const error = validateField('phone', formData.phone);
      if (error) {
        newErrors.phone = error;
        isValid = false;
      }
    }

    if (formData.defaultCoordinates) {
      const error = validateField('defaultCoordinates', formData.defaultCoordinates);
      if (error) {
        newErrors.defaultCoordinates = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle field change
  const handleChange = (name: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle field blur
  const handleBlur = (name: keyof FormData) => () => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Handle submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      defaultAddress: true,
      defaultCoordinates: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      const customerData: CreateCustomerDTO = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        defaultAddress: formData.defaultAddress || undefined,
        defaultCoordinates: formData.defaultCoordinates || undefined,
      };

      if (isEditMode && customerId) {
        await updateCustomer({ id: customerId, data: customerData }).unwrap();
      } else {
        await createCustomer(customerData).unwrap();
      }

      onSuccess?.();
    } catch (err) {
      console.error('Failed to save customer:', err);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEditMode ? 'Edit Customer' : 'Add New Customer'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isEditMode
              ? 'Update customer information'
              : 'Fill in the details to create a new customer'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to {isEditMode ? 'update' : 'create'} customer. Please try again.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Personal Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  <PersonIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  Personal Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      required
                      value={formData.firstName}
                      onChange={handleChange('firstName')}
                      onBlur={handleBlur('firstName')}
                      error={touched.firstName && !!errors.firstName}
                      helperText={touched.firstName && errors.firstName}
                      disabled={isLoading}
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      required
                      value={formData.lastName}
                      onChange={handleChange('lastName')}
                      onBlur={handleBlur('lastName')}
                      error={touched.lastName && !!errors.lastName}
                      helperText={touched.lastName && errors.lastName}
                      disabled={isLoading}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Contact Information */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  <EmailIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  Contact Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={isLoading}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    disabled={isLoading}
                    placeholder="+1 (555) 123-4567"
                    slotProps={{
                      input: {
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Default Address */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  <LocationOnIcon sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  Default Delivery Address (Optional)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    multiline
                    rows={2}
                    value={formData.defaultAddress}
                    onChange={handleChange('defaultAddress')}
                    onBlur={handleBlur('defaultAddress')}
                    error={touched.defaultAddress && !!errors.defaultAddress}
                    helperText={
                      touched.defaultAddress && errors.defaultAddress
                        ? errors.defaultAddress
                        : 'Customer\'s default delivery address'
                    }
                    disabled={isLoading}
                    placeholder="123 Main Street, Apt 4B, City, State, ZIP"
                  />
                  <TextField
                    fullWidth
                    label="Coordinates"
                    value={formData.defaultCoordinates}
                    onChange={handleChange('defaultCoordinates')}
                    onBlur={handleBlur('defaultCoordinates')}
                    error={touched.defaultCoordinates && !!errors.defaultCoordinates}
                    helperText={
                      touched.defaultCoordinates && errors.defaultCoordinates
                        ? errors.defaultCoordinates
                        : 'Format: latitude,longitude (e.g., 40.7128,-74.0060)'
                    }
                    disabled={isLoading}
                    placeholder="40.7128,-74.0060"
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={onCancel}
                  disabled={isLoading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading}
                  size="large"
                  sx={{ minWidth: 150 }}
                >
                  {isLoading
                    ? 'Saving...'
                    : isEditMode
                    ? 'Update Customer'
                    : 'Create Customer'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerForm;

// Made with Bob