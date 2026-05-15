/**
 * Customers Management Page
 * Main page for managing customers with list, details, and form views
 */

import React, { useState } from 'react';
import { Box, Container, Breadcrumbs, Link, Typography } from '@mui/material';
import { Home as HomeIcon, People as PeopleIcon } from '@mui/icons-material';
import CustomersList from '../components/admin/CustomersList';
import CustomerDetails from '../components/admin/CustomerDetails';
import CustomerForm from '../components/admin/CustomerForm';

type ViewMode = 'list' | 'details' | 'create' | 'edit';

const CustomersPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Handle view customer
  const handleViewCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setViewMode('details');
  };

  // Handle edit customer
  const handleEditCustomer = (customerId?: string) => {
    if (customerId) {
      setSelectedCustomerId(customerId);
      setViewMode('edit');
    } else if (selectedCustomerId) {
      setViewMode('edit');
    }
  };

  // Handle create customer
  const handleCreateCustomer = () => {
    setSelectedCustomerId(null);
    setViewMode('create');
  };

  // Handle back to list
  const handleBackToList = () => {
    setSelectedCustomerId(null);
    setViewMode('list');
  };

  // Handle form success
  const handleFormSuccess = () => {
    setSelectedCustomerId(null);
    setViewMode('list');
  };

  // Get breadcrumb text
  const getBreadcrumbText = () => {
    switch (viewMode) {
      case 'details':
        return 'Customer Details';
      case 'create':
        return 'Add Customer';
      case 'edit':
        return 'Edit Customer';
      default:
        return 'Customers';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={handleBackToList}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color={viewMode === 'list' ? 'text.primary' : 'inherit'}
          onClick={handleBackToList}
        >
          <PeopleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Customers
        </Link>
        {viewMode !== 'list' && (
          <Typography color="text.primary">{getBreadcrumbText()}</Typography>
        )}
      </Breadcrumbs>

      {/* Content */}
      <Box>
        {viewMode === 'list' && (
          <CustomersList
            onViewCustomer={handleViewCustomer}
            onEditCustomer={handleEditCustomer}
            onCreateCustomer={handleCreateCustomer}
          />
        )}

        {viewMode === 'details' && selectedCustomerId && (
          <CustomerDetails
            customerId={selectedCustomerId}
            onEdit={() => handleEditCustomer()}
            onBack={handleBackToList}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <CustomerForm
            customerId={viewMode === 'edit' ? selectedCustomerId || undefined : undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleBackToList}
          />
        )}
      </Box>
    </Container>
  );
};

export default CustomersPage;

// Made with Bob