/**
 * Customers API
 * RTK Query API for customer management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

// Types
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface CustomerWithOrders extends Customer {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    deliveryAddress: string;
    createdAt: string;
  }>;
}

export interface CreateCustomerDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
}

export interface UpdateCustomerDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    totalCount?: number;
  };
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    // Get all customers
    getCustomers: builder.query<ApiResponse<Customer[]>, { search?: string } | void>({
      query: (params) => ({
        url: '/customers',
        params: params || undefined,
      }),
      providesTags: ['Customer'],
    }),

    // Get customer by ID
    getCustomerById: builder.query<ApiResponse<CustomerWithOrders>, string>({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    // Create customer
    createCustomer: builder.mutation<ApiResponse<Customer>, CreateCustomerDTO>({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),

    // Update customer
    updateCustomer: builder.mutation<ApiResponse<Customer>, { id: string; data: UpdateCustomerDTO }>({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }, 'Customer'],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;

// Made with Bob