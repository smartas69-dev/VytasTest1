import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'primary',
}) => {
  const isPositive = change !== undefined && change >= 0;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 20, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                >
                  {Math.abs(change)}%
                </Typography>
                {changeLabel && (
                  <Typography variant="caption" color="text.secondary">
                    {changeLabel}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.50`,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

interface StatusCardProps {
  title: string;
  items: Array<{
    label: string;
    value: number;
    total: number;
    color: string;
  }>;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, items }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mt: 2 }}>
          {items.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{item.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.value} / {item.total}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(item.value / item.total) * 100}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: item.color,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

interface RecentActivityItem {
  id: string;
  type: 'order' | 'delivery' | 'alert';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities: RecentActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Activity</Typography>
          <IconButton size="small">
            <RefreshIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activities.map((activity) => (
            <Paper
              key={activity.id}
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                  {activity.status && (
                    <Chip
                      label={activity.status}
                      size="small"
                      color={activity.status}
                      sx={{ height: 20 }}
                    />
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  // Mock data - In real app, fetch from API
  const metrics = {
    totalOrders: 1247,
    ordersChange: 12.5,
    activeDeliveries: 34,
    deliveriesChange: -5.2,
    completedToday: 89,
    completedChange: 8.3,
    pendingOrders: 156,
    pendingChange: 15.7,
  };

  const fleetStatus = [
    { label: 'Active', value: 12, total: 20, color: '#4caf50' },
    { label: 'Idle', value: 5, total: 20, color: '#ff9800' },
    { label: 'Maintenance', value: 3, total: 20, color: '#f44336' },
  ];

  const driverStatus = [
    { label: 'On Duty', value: 15, total: 25, color: '#4caf50' },
    { label: 'Off Duty', value: 8, total: 25, color: '#9e9e9e' },
    { label: 'Break', value: 2, total: 25, color: '#ff9800' },
  ];

  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: 'New Order #ORD-001247',
      description: 'Customer: John Doe - Zone: Downtown',
      time: '5 min ago',
      status: 'info',
    },
    {
      id: '2',
      type: 'delivery',
      title: 'Delivery Completed #ORD-001240',
      description: 'Driver: Jane Smith - 15 items delivered',
      time: '12 min ago',
      status: 'success',
    },
    {
      id: '3',
      type: 'alert',
      title: 'Low Stock Alert',
      description: 'Item: Laptop Computer - Only 5 units left',
      time: '25 min ago',
      status: 'warning',
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Route Optimized',
      description: 'Route #RT-456 - 8 stops, 23.5 km',
      time: '1 hour ago',
      status: 'success',
    },
    {
      id: '5',
      type: 'order',
      title: 'Order Cancelled #ORD-001235',
      description: 'Reason: Customer request',
      time: '2 hours ago',
      status: 'error',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your deliveries today.
        </Typography>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            change={metrics.ordersChange}
            changeLabel="vs last month"
            icon={<ShoppingCartIcon sx={{ fontSize: 32, color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Deliveries"
            value={metrics.activeDeliveries}
            change={metrics.deliveriesChange}
            changeLabel="vs yesterday"
            icon={<LocalShippingIcon sx={{ fontSize: 32, color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Completed Today"
            value={metrics.completedToday}
            change={metrics.completedChange}
            changeLabel="vs yesterday"
            icon={<CheckCircleIcon sx={{ fontSize: 32, color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Orders"
            value={metrics.pendingOrders}
            change={metrics.pendingChange}
            changeLabel="vs yesterday"
            icon={<ScheduleIcon sx={{ fontSize: 32, color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Status Cards and Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatusCard title="Fleet Status" items={fleetStatus} />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatusCard title="Driver Status" items={driverStatus} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Delivery Time
                  </Typography>
                  <Typography variant="h6">32 minutes</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    On-Time Delivery Rate
                  </Typography>
                  <Typography variant="h6">94.5%</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Customer Satisfaction
                  </Typography>
                  <Typography variant="h6">4.8 / 5.0</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Box sx={{ mt: 3 }}>
        <RecentActivity activities={recentActivities} />
      </Box>
    </Box>
  );
};

export default Dashboard;

// Made with Bob
