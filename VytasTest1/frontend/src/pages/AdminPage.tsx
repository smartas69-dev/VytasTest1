/**
 * Admin Page
 * Unified admin interface with tabs for all management functions
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalShipping as TruckIcon,
  Inventory as InventoryIcon,
  LocationOn as ZoneIcon,
  Warehouse as WarehouseIcon,
  Person as CustomerIcon,
} from '@mui/icons-material';
import DriversManagement from '../components/admin/DriversManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// Placeholder components for other tabs
const CustomersManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Customers Management
    </Typography>
    <Typography color="text.secondary">
      Customer management interface - Implementation in progress
    </Typography>
  </Box>
);

const TrucksManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Trucks Management
    </Typography>
    <Typography color="text.secondary">
      Truck fleet management interface - Implementation in progress
    </Typography>
  </Box>
);

const InventoryManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Inventory Management
    </Typography>
    <Typography color="text.secondary">
      Inventory items management interface - Implementation in progress
    </Typography>
  </Box>
);

const ZonesManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Delivery Zones Management
    </Typography>
    <Typography color="text.secondary">
      Delivery zones management interface - Implementation in progress
    </Typography>
  </Box>
);

const WarehousesManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Warehouses Management
    </Typography>
    <Typography color="text.secondary">
      Warehouses management interface - Implementation in progress
    </Typography>
  </Box>
);

const AdminPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Administration
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all system master data and configurations
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="admin tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<PeopleIcon />} label="Drivers" iconPosition="start" />
          <Tab icon={<CustomerIcon />} label="Customers" iconPosition="start" />
          <Tab icon={<TruckIcon />} label="Trucks" iconPosition="start" />
          <Tab icon={<InventoryIcon />} label="Inventory" iconPosition="start" />
          <Tab icon={<ZoneIcon />} label="Zones" iconPosition="start" />
          <Tab icon={<WarehouseIcon />} label="Warehouses" iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={currentTab} index={0}>
        <DriversManagement />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <CustomersManagement />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <TrucksManagement />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <InventoryManagement />
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <ZonesManagement />
      </TabPanel>
      <TabPanel value={currentTab} index={5}>
        <WarehousesManagement />
      </TabPanel>
    </Container>
  );
};

export default AdminPage;

// Made with Bob