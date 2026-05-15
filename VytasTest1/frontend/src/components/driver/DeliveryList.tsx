import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemAvatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  LocalShipping as InTransitIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
  Navigation as NavigationIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Delivery {
  id: string;
  orderNumber: string;
  sequence: number;
  customerName: string;
  address: string;
  phone: string;
  timeWindow: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  items: number;
  weight: number;
  requiresSignature: boolean;
  specialInstructions?: string;
  estimatedArrival: string;
  deliveredAt?: string;
  priority: 'low' | 'medium' | 'high';
}

const DeliveryList: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Mock deliveries data
  const deliveries: Delivery[] = [
    {
      id: 'del-1',
      orderNumber: 'ORD-000123',
      sequence: 1,
      customerName: 'John Doe',
      address: '123 Main St, Downtown',
      phone: '+1-555-0101',
      timeWindow: '09:00 - 10:00',
      status: 'delivered',
      items: 3,
      weight: 25,
      requiresSignature: true,
      estimatedArrival: '09:15 AM',
      deliveredAt: '09:12 AM',
      priority: 'high',
    },
    {
      id: 'del-2',
      orderNumber: 'ORD-000124',
      sequence: 2,
      customerName: 'Jane Smith',
      address: '456 Oak Ave, Downtown',
      phone: '+1-555-0102',
      timeWindow: '09:30 - 10:30',
      status: 'delivered',
      items: 2,
      weight: 18,
      requiresSignature: false,
      estimatedArrival: '09:45 AM',
      deliveredAt: '09:40 AM',
      priority: 'medium',
    },
    {
      id: 'del-3',
      orderNumber: 'ORD-000125',
      sequence: 3,
      customerName: 'Bob Johnson',
      address: '789 Pine Rd, North District',
      phone: '+1-555-0103',
      timeWindow: '10:00 - 11:00',
      status: 'delivered',
      items: 5,
      weight: 42,
      requiresSignature: true,
      specialInstructions: 'Call before arrival',
      estimatedArrival: '10:20 AM',
      deliveredAt: '10:18 AM',
      priority: 'high',
    },
    {
      id: 'del-4',
      orderNumber: 'ORD-000126',
      sequence: 4,
      customerName: 'Alice Williams',
      address: '321 Elm St, North District',
      phone: '+1-555-0104',
      timeWindow: '10:30 - 11:30',
      status: 'in_transit',
      items: 4,
      weight: 35,
      requiresSignature: true,
      estimatedArrival: '10:50 AM',
      priority: 'high',
    },
    {
      id: 'del-5',
      orderNumber: 'ORD-000127',
      sequence: 5,
      customerName: 'Charlie Brown',
      address: '654 Maple Dr, East District',
      phone: '+1-555-0105',
      timeWindow: '11:00 - 12:00',
      status: 'pending',
      items: 3,
      weight: 28,
      requiresSignature: false,
      estimatedArrival: '11:25 AM',
      priority: 'medium',
    },
    {
      id: 'del-6',
      orderNumber: 'ORD-000128',
      sequence: 6,
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
      priority: 'low',
    },
    {
      id: 'del-7',
      orderNumber: 'ORD-000129',
      sequence: 7,
      customerName: 'Emma Wilson',
      address: '246 Birch Ave, South District',
      phone: '+1-555-0107',
      timeWindow: '12:00 - 13:00',
      status: 'pending',
      items: 6,
      weight: 48,
      requiresSignature: true,
      estimatedArrival: '12:30 PM',
      priority: 'high',
    },
    {
      id: 'del-8',
      orderNumber: 'ORD-000130',
      sequence: 8,
      customerName: 'Frank Miller',
      address: '135 Spruce St, South District',
      phone: '+1-555-0108',
      timeWindow: '12:30 - 13:30',
      status: 'pending',
      items: 3,
      weight: 22,
      requiresSignature: false,
      estimatedArrival: '13:00 PM',
      priority: 'medium',
    },
  ];

  // Filter deliveries by tab
  const getFilteredDeliveries = () => {
    switch (tabValue) {
      case 0: // All
        return deliveries;
      case 1: // Pending
        return deliveries.filter((d) => d.status === 'pending');
      case 2: // In Transit
        return deliveries.filter((d) => d.status === 'in_transit');
      case 3: // Delivered
        return deliveries.filter((d) => d.status === 'delivered');
      default:
        return deliveries;
    }
  };

  const filteredDeliveries = getFilteredDeliveries();

  // Count by status
  const counts = {
    all: deliveries.length,
    pending: deliveries.filter((d) => d.status === 'pending').length,
    inTransit: deliveries.filter((d) => d.status === 'in_transit').length,
    delivered: deliveries.filter((d) => d.status === 'delivered').length,
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, delivery: Delivery) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDelivery(delivery);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle view details
  const handleViewDetails = (delivery: Delivery) => {
    navigate(`/driver/delivery/${delivery.id}`);
  };

  // Handle navigate
  const handleNavigate = (delivery: Delivery) => {
    console.log('Navigate to:', delivery.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery.address)}`, '_blank');
    handleMenuClose();
  };

  // Handle call
  const handleCall = (delivery: Delivery) => {
    console.log('Call:', delivery.phone);
    window.location.href = `tel:${delivery.phone}`;
    handleMenuClose();
  };

  // Handle start delivery
  const handleStartDelivery = (delivery: Delivery) => {
    console.log('Start delivery:', delivery.id);
    handleMenuClose();
    navigate(`/driver/delivery/${delivery.id}`);
  };

  // Get status icon
  const getStatusIcon = (status: Delivery['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'in_transit':
        return <InTransitIcon sx={{ color: 'primary.main' }} />;
      case 'failed':
        return <CancelIcon sx={{ color: 'error.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'action.disabled' }} />;
    }
  };

  // Get status color
  const getStatusColor = (status: Delivery['status']) => {
    const colors = {
      pending: 'default',
      in_transit: 'primary',
      delivered: 'success',
      failed: 'error',
    };
    return colors[status] as 'default' | 'primary' | 'success' | 'error';
  };

  // Get priority color
  const getPriorityColor = (priority: Delivery['priority']) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };
    return colors[priority] as 'error' | 'warning' | 'default';
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Deliveries
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your delivery checklist
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 150 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Total
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {counts.all}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 150 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
              {counts.pending}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 150 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              In Transit
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {counts.inTransit}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 150 }}>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Delivered
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
              {counts.delivered}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab
              label={
                <Badge badgeContent={counts.all} color="default">
                  All
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.pending} color="warning">
                  Pending
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.inTransit} color="primary">
                  In Transit
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={counts.delivered} color="success">
                  Delivered
                </Badge>
              }
            />
          </Tabs>
        </Box>

        {/* Deliveries List */}
        <List>
          {filteredDeliveries.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No deliveries in this category
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            filteredDeliveries.map((delivery, index) => (
              <React.Fragment key={delivery.id}>
                <ListItem
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" onClick={(e) => handleMenuOpen(e, delivery)}>
                      <MoreVertIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => handleViewDetails(delivery)}>
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor:
                            delivery.status === 'delivered'
                              ? 'success.main'
                              : delivery.status === 'in_transit'
                              ? 'primary.main'
                              : 'action.selected',
                        }}
                      >
                        {delivery.sequence}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {delivery.customerName}
                          </Typography>
                          <Chip label={delivery.status.replace('_', ' ')} size="small" color={getStatusColor(delivery.status)} />
                          {delivery.priority === 'high' && (
                            <Chip label="High Priority" size="small" color="error" variant="outlined" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {delivery.address}
                          </Typography>
                          <br />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<ScheduleIcon />}
                              label={delivery.timeWindow}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {delivery.orderNumber} • {delivery.items} items • {delivery.weight} kg
                            </Typography>
                            {delivery.requiresSignature && (
                              <Chip label="Signature" size="small" variant="outlined" sx={{ height: 20 }} />
                            )}
                            {delivery.specialInstructions && (
                              <Chip
                                icon={<WarningIcon />}
                                label="Special Instructions"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 20 }}
                              />
                            )}
                          </Box>
                          {delivery.deliveredAt && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                              ✓ Delivered at {delivery.deliveredAt}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemIcon sx={{ minWidth: 'auto' }}>{getStatusIcon(delivery.status)}</ListItemIcon>
                  </ListItemButton>
                </ListItem>
                {index < filteredDeliveries.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Card>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedDelivery && handleViewDetails(selectedDelivery)}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {selectedDelivery?.status === 'pending' && (
          <MenuItem onClick={() => selectedDelivery && handleStartDelivery(selectedDelivery)}>
            <ListItemIcon>
              <InTransitIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Start Delivery</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => selectedDelivery && handleNavigate(selectedDelivery)}>
          <ListItemIcon>
            <NavigationIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Navigate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedDelivery && handleCall(selectedDelivery)}>
          <ListItemIcon>
            <PhoneIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Call Customer</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DeliveryList;

// Made with Bob
