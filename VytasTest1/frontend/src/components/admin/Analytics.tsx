import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalShipping as TruckIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [tabValue, setTabValue] = useState(0);

  // Mock data for metrics
  const metrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$45,230',
      change: 12.5,
      trend: 'up',
      icon: <MoneyIcon />,
      color: '#4caf50',
    },
    {
      title: 'Total Deliveries',
      value: 1248,
      change: 8.2,
      trend: 'up',
      icon: <TruckIcon />,
      color: '#2196f3',
    },
    {
      title: 'Active Drivers',
      value: 24,
      change: -3.1,
      trend: 'down',
      icon: <PersonIcon />,
      color: '#ff9800',
    },
    {
      title: 'Items Delivered',
      value: 5432,
      change: 15.8,
      trend: 'up',
      icon: <InventoryIcon />,
      color: '#9c27b0',
    },
  ];

  // Mock data for delivery status
  const deliveryStatusData: ChartData[] = [
    { label: 'Delivered', value: 856, color: '#4caf50' },
    { label: 'In Transit', value: 234, color: '#2196f3' },
    { label: 'Pending', value: 98, color: '#ff9800' },
    { label: 'Cancelled', value: 60, color: '#f44336' },
  ];

  // Mock data for zone performance
  const zonePerformanceData = [
    { zone: 'Downtown', deliveries: 342, revenue: 12450, avgTime: 28, onTimeRate: 94 },
    { zone: 'North District', deliveries: 298, revenue: 10890, avgTime: 32, onTimeRate: 91 },
    { zone: 'South District', deliveries: 276, revenue: 9870, avgTime: 35, onTimeRate: 88 },
    { zone: 'East District', deliveries: 189, revenue: 6780, avgTime: 30, onTimeRate: 92 },
    { zone: 'West District', deliveries: 143, revenue: 5240, avgTime: 38, onTimeRate: 85 },
  ];

  // Mock data for driver performance
  const driverPerformanceData = [
    { name: 'John Doe', deliveries: 156, onTime: 148, rating: 4.8, revenue: 5680 },
    { name: 'Jane Smith', deliveries: 142, onTime: 138, rating: 4.9, revenue: 5240 },
    { name: 'Bob Johnson', deliveries: 128, onTime: 118, rating: 4.6, revenue: 4560 },
    { name: 'Alice Williams', deliveries: 134, onTime: 126, rating: 4.7, revenue: 4890 },
    { name: 'Charlie Brown', deliveries: 98, onTime: 89, rating: 4.5, revenue: 3450 },
  ];

  // Mock data for hourly deliveries
  const hourlyDeliveriesData: ChartData[] = [
    { label: '9 AM', value: 45 },
    { label: '10 AM', value: 78 },
    { label: '11 AM', value: 92 },
    { label: '12 PM', value: 105 },
    { label: '1 PM', value: 88 },
    { label: '2 PM', value: 95 },
    { label: '3 PM', value: 112 },
    { label: '4 PM', value: 98 },
    { label: '5 PM', value: 67 },
  ];

  // Mock data for weekly trend
  const weeklyTrendData: ChartData[] = [
    { label: 'Mon', value: 178 },
    { label: 'Tue', value: 192 },
    { label: 'Wed', value: 185 },
    { label: 'Thu', value: 201 },
    { label: 'Fri', value: 215 },
    { label: 'Sat', value: 156 },
    { label: 'Sun', value: 121 },
  ];

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate total for delivery status
  const totalDeliveries = deliveryStatusData.reduce((sum, item) => sum + item.value, 0);

  // Get max value for bar chart scaling
  const maxHourlyValue = Math.max(...hourlyDeliveriesData.map((d) => d.value));
  const maxWeeklyValue = Math.max(...weeklyTrendData.map((d) => d.value));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Performance metrics and insights
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="7d">Last 7 Days</MenuItem>
            <MenuItem value="30d">Last 30 Days</MenuItem>
            <MenuItem value="90d">Last 90 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {metric.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {metric.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${metric.color}20`,
                      color: metric.color,
                    }}
                  >
                    {metric.icon}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {metric.trend === 'up' ? (
                    <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main', mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 20, color: 'error.main', mr: 0.5 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: metric.trend === 'up' ? 'success.main' : 'error.main', fontWeight: 600 }}
                  >
                    {Math.abs(metric.change)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    vs last period
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Delivery Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Status
              </Typography>
              <Box sx={{ mt: 3 }}>
                {deliveryStatusData.map((item, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.value} ({((item.value / totalDeliveries) * 100).toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(item.value / totalDeliveries) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: `${item.color}20`,
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
        </Grid>

        {/* Hourly Deliveries */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hourly Deliveries
              </Typography>
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-end', gap: 1, height: 200 }}>
                {hourlyDeliveriesData.map((item, index) => (
                  <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ mb: 1, fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: `${(item.value / maxHourlyValue) * 150}px`,
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Weekly Trend */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weekly Delivery Trend
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-end', gap: 2, height: 200 }}>
            {weeklyTrendData.map((item, index) => (
              <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  {item.value}
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: `${(item.value / maxWeeklyValue) * 150}px`,
                    bgcolor: 'success.main',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'success.dark',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Performance Tables */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Zone Performance" />
            <Tab label="Driver Performance" />
          </Tabs>
        </Box>

        {/* Zone Performance Tab */}
        {tabValue === 0 && (
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Zone</TableCell>
                    <TableCell align="right">Deliveries</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg Time (min)</TableCell>
                    <TableCell align="right">On-Time Rate</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zonePerformanceData.map((zone, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {zone.zone}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{zone.deliveries}</TableCell>
                      <TableCell align="right">${zone.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">{zone.avgTime}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${zone.onTimeRate}%`}
                          size="small"
                          color={zone.onTimeRate >= 90 ? 'success' : zone.onTimeRate >= 85 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={zone.onTimeRate}
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            color={zone.onTimeRate >= 90 ? 'success' : zone.onTimeRate >= 85 ? 'warning' : 'error'}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                            {zone.onTimeRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}

        {/* Driver Performance Tab */}
        {tabValue === 1 && (
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Driver</TableCell>
                    <TableCell align="right">Deliveries</TableCell>
                    <TableCell align="right">On-Time</TableCell>
                    <TableCell align="right">Rating</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell>Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {driverPerformanceData.map((driver, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {driver.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{driver.deliveries}</TableCell>
                      <TableCell align="right">
                        {driver.onTime} / {driver.deliveries}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>
                            {driver.rating.toFixed(1)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            / 5.0
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${driver.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(driver.onTime / driver.deliveries) * 100}
                            sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            color={
                              (driver.onTime / driver.deliveries) * 100 >= 90
                                ? 'success'
                                : (driver.onTime / driver.deliveries) * 100 >= 85
                                ? 'warning'
                                : 'error'
                            }
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                            {((driver.onTime / driver.deliveries) * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        )}
      </Card>
    </Box>
  );
};

export default Analytics;

// Made with Bob
