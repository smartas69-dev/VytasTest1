/**
 * Orders API
 * RTK Query API for order management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

// Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  slotId?: string;
  deliveryAddress: string;
  deliveryCoordinates: string;
  zoneId?: string;
  status: string;
  priority: number;
  totalWeightKg?: number;
  totalVolumeM3?: number;
  estimatedDurationMinutes?: number;
  specialInstructions?: string;
  requiresSignature: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderDTO {
  customerId?: string;
  slotId?: string;
  deliveryAddress: string;
  deliveryCoordinates: string;
  zoneId?: string;
  priority?: number;
  specialInstructions?: string;
  requiresSignature?: boolean;
  items: Array<{
    inventoryItemId: string;
    quantity: number;
  }>;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
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

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Order', 'OrderStatistics'],
  endpoints: (builder) => ({
    // Get orders with filtering
    getOrders: builder.query<ApiResponse<Order[]>, {
      status?: string;
      customerId?: string;
      slotId?: string;
      zoneId?: string;
      startDate?: string;
      endDate?: string;
    } | void>({
      query: (params) => ({
        url: '/orders',
        params: params || undefined,
      }),
      providesTags: ['Order'],
    }),

    // Get order by ID
    getOrderById: builder.query<ApiResponse<OrderWithItems>, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    // Get order by order number
    getOrderByNumber: builder.query<ApiResponse<OrderWithItems>, string>({
      query: (orderNumber) => `/orders/number/${orderNumber}`,
      providesTags: (result, error, orderNumber) => [{ type: 'Order', id: orderNumber }],
    }),

    // Create order
    createOrder: builder.mutation<ApiResponse<OrderWithItems>, CreateOrderDTO>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
      }),
      invalidatesTags: ['Order', 'OrderStatistics'],
    }),

    // Update order status
    updateOrderStatus: builder.mutation<ApiResponse<Order>, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order',
        'OrderStatistics',
      ],
    }),

    // Confirm order
    confirmOrder: builder.mutation<ApiResponse<Order>, string>({
      query: (id) => ({
        url: `/orders/${id}/confirm`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Order', id },
        'Order',
        'OrderStatistics',
      ],
    }),

    // Cancel order
    cancelOrder: builder.mutation<ApiResponse<Order>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/orders/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        'Order',
        'OrderStatistics',
      ],
    }),

    // Get orders by slot
    getOrdersBySlot: builder.query<ApiResponse<Order[]>, string>({
      query: (slotId) => `/orders/slot/${slotId}`,
      providesTags: ['Order'],
    }),

    // Get unassigned orders
    getUnassignedOrders: builder.query<ApiResponse<Order[]>, {
      zoneId?: string;
      slotId?: string;
    } | void>({
      query: (params) => ({
        url: '/orders/unassigned',
        params: params || undefined,
      }),
      providesTags: ['Order'],
    }),

    // Get order statistics
    getOrderStatistics: builder.query<ApiResponse<OrderStatistics>, {
      startDate?: string;
      endDate?: string;
      zoneId?: string;
    } | void>({
      query: (params) => ({
        url: '/orders/statistics',
        params: params || undefined,
      }),
      providesTags: ['OrderStatistics'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderByNumberQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useConfirmOrderMutation,
  useCancelOrderMutation,
  useGetOrdersBySlotQuery,
  useGetUnassignedOrdersQuery,
  useGetOrderStatisticsQuery,
} = ordersApi;

// Made with Bob
