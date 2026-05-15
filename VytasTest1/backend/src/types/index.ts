/**
 * Type definitions for Last Mile Delivery System
 * Generated from Prisma schema and business logic requirements
 */

// ============================================================================
// Enums
// ============================================================================

export enum TruckType {
  VAN = 'van',
  TRUCK = 'truck',
  REFRIGERATED_TRUCK = 'refrigerated_truck',
}

export enum TruckStatus {
  AVAILABLE = 'available',
  LOADING = 'loading',
  IN_TRANSIT = 'in_transit',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
}

export enum DriverStatus {
  AVAILABLE = 'available',
  ON_DUTY = 'on_duty',
  OFF_DUTY = 'off_duty',
  ON_LEAVE = 'on_leave',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum LoadStatus {
  PLANNING = 'planning',
  READY = 'ready',
  LOADING = 'loading',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SlotStatus {
  ACTIVE = 'active',
  FULL = 'full',
  DISABLED = 'disabled',
}

export enum ReservationStatus {
  ACTIVE = 'active',
  CONFIRMED = 'confirmed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  IN = 'in',
  OUT = 'out',
  RESERVED = 'reserved',
  RELEASED = 'released',
  ADJUSTMENT = 'adjustment',
}

export enum FuelType {
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  GASOLINE = 'gasoline',
}

// ============================================================================
// Core Domain Types
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  coordinates: Coordinates;
}

// ============================================================================
// Delivery Zone Types
// ============================================================================

export interface DeliveryZone {
  id: string;
  name: string;
  code: string;
  polygon?: string;
  maxDailyCapacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDeliveryZoneDTO {
  name: string;
  code: string;
  polygon?: string;
  maxDailyCapacity: number;
}

// ============================================================================
// Time Slot Types
// ============================================================================

export interface TimeSlot {
  id: string;
  zoneId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalCapacity: number;
  availableCapacity: number;
  priceMultiplier: number;
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeSlotDTO {
  zoneId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalCapacity: number;
}

export interface SlotAvailabilityQuery {
  zoneId: string;
  startDate: Date;
  endDate: Date;
}

export interface GenerateSlotsParams {
  zoneId: string;
  startDate: Date;
  endDate: Date;
  timeWindows: TimeWindow[];
  capacityPerSlot: number;
}

// ============================================================================
// Inventory Types
// ============================================================================

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  weightKg: number;
  volumeM3: number;
  dimensionsCm?: string;
  isFragile: boolean;
  requiresRefrigeration: boolean;
  stockQuantity: number;
  reservedQuantity: number;
  unitPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemDTO {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  weightKg: number;
  volumeM3: number;
  dimensionsCm?: string;
  isFragile?: boolean;
  requiresRefrigeration?: boolean;
  stockQuantity?: number;
  unitPrice?: number;
}

export interface InventoryTransaction {
  id: string;
  inventoryItemId?: string;
  transactionType: TransactionType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  warehouseId?: string;
  notes?: string;
  createdAt: Date;
}

export interface StockAdjustmentDTO {
  itemId: string;
  quantity: number;
  transactionType: TransactionType;
  warehouseId?: string;
  notes?: string;
}

// ============================================================================
// Warehouse Types
// ============================================================================

export interface Warehouse {
  id: string;
  name: string;
  address: string;
  coordinates: string;
  totalCapacityM3: number;
  usedCapacityM3: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarehouseDTO {
  name: string;
  address: string;
  coordinates: string;
  totalCapacityM3: number;
}

// ============================================================================
// Truck/Fleet Types
// ============================================================================

export interface Truck {
  id: string;
  registrationNumber: string;
  type: TruckType;
  maxWeightKg: number;
  maxVolumeM3: number;
  currentWeightKg: number;
  currentVolumeM3: number;
  fuelType?: FuelType;
  status: TruckStatus;
  currentLocation?: string;
  warehouseId?: string;
  hasRefrigeration: boolean;
  hasLiftGate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTruckDTO {
  registrationNumber: string;
  type: TruckType;
  maxWeightKg: number;
  maxVolumeM3: number;
  fuelType?: FuelType;
  warehouseId?: string;
  hasRefrigeration?: boolean;
  hasLiftGate?: boolean;
}

export interface TruckAvailability {
  truckId: string;
  isAvailable: boolean;
  currentLoad: number;
  availableCapacity: {
    weight: number;
    volume: number;
  };
  nextAvailableTime?: Date;
}

// ============================================================================
// Driver Types
// ============================================================================

export interface Driver {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: DriverStatus;
  currentTruckId?: string;
  shiftStart?: Date;
  shiftEnd?: Date;
  maxHoursPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDriverDTO {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  shiftStart?: Date;
  shiftEnd?: Date;
  maxHoursPerDay?: number;
}

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  defaultAddress?: string;
  defaultCoordinates?: string;
}

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  slotId?: string;
  deliveryAddress: string;
  deliveryCoordinates: string;
  zoneId?: string;
  status: OrderStatus;
  priority: number;
  totalWeightKg?: number;
  totalVolumeM3?: number;
  estimatedDurationMinutes?: number;
  specialInstructions?: string;
  requiresSignature: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  inventoryItemId: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  createdAt: Date;
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
  items: CreateOrderItemDTO[];
}

export interface CreateOrderItemDTO {
  inventoryItemId: string;
  quantity: number;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

// ============================================================================
// Truck Load Types
// ============================================================================

export interface TruckLoad {
  id: string;
  truckId?: string;
  driverId?: string;
  slotId?: string;
  status: LoadStatus;
  totalWeightKg?: number;
  totalVolumeM3?: number;
  orderCount?: number;
  plannedRoute?: RouteData;
  actualRoute?: RouteData;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  actualDistanceKm?: number;
  actualDurationMinutes?: number;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  id: string;
  loadId: string;
  orderId: string;
  sequenceNumber: number;
  loadedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface CreateTruckLoadDTO {
  truckId: string;
  driverId: string;
  slotId: string;
  orderIds: string[];
}

export interface LoadWithItems extends TruckLoad {
  items: LoadItem[];
}

// ============================================================================
// Reservation Types
// ============================================================================

export interface Reservation {
  id: string;
  slotId?: string;
  orderId?: string;
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateReservationDTO {
  slotId: string;
  orderId: string;
  expiresAt: Date;
}

// ============================================================================
// Optimization Types
// ============================================================================

export interface RouteData {
  waypoints: RouteWaypoint[];
  totalDistance: number;
  totalDuration: number;
  optimizationMetrics?: OptimizationMetrics;
}

export interface RouteWaypoint {
  orderId: string;
  address: string;
  coordinates: Coordinates;
  sequenceNumber: number;
  estimatedArrival?: Date;
  estimatedDuration?: number;
}

export interface OptimizationMetrics {
  algorithm: string;
  executionTime: number;
  improvementPercentage?: number;
  iterations?: number;
}

export interface LoadOptimizationResult {
  loadId: string;
  truckId: string;
  orders: string[];
  sequence: number[];
  totalWeight: number;
  totalVolume: number;
  utilization: {
    weight: number;
    volume: number;
  };
  loadingInstructions: LoadingInstruction[];
  metrics: OptimizationMetrics;
}

export interface LoadingInstruction {
  sequenceNumber: number;
  orderId: string;
  position: string;
  notes?: string;
}

export interface RouteOptimizationResult {
  loadId: string;
  route: RouteData;
  totalDistance: number;
  totalDuration: number;
  metrics: OptimizationMetrics;
}

export interface OptimizationConstraints {
  maxWeight: number;
  maxVolume: number;
  maxOrders?: number;
  timeWindow?: TimeWindow;
  requiresRefrigeration?: boolean;
  avoidFragile?: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMetadata {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Service Layer Types
// ============================================================================

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
}

// ============================================================================
// Queue/Message Types
// ============================================================================

export interface QueueMessage<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: Date;
  retryCount?: number;
}

export interface LoadOptimizationMessage {
  loadId: string;
  truckId: string;
  orderIds: string[];
}

export interface RouteOptimizationMessage {
  loadId: string;
  warehouseCoordinates: Coordinates;
  deliveryPoints: RouteWaypoint[];
}

// ============================================================================
// Analytics/Reporting Types
// ============================================================================

export interface DeliveryMetrics {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  onTimePercentage: number;
}

export interface FleetUtilization {
  truckId: string;
  utilizationPercentage: number;
  totalTrips: number;
  totalDistance: number;
  totalDuration: number;
}

export interface InventoryMetrics {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  turnoverRate: number;
}

// ============================================================================
// All types are exported via interface declarations above
// ============================================================================

// Made with Bob
