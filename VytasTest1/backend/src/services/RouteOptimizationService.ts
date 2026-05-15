/**
 * Route Optimization Service
 * Implements TSP solver using Nearest Neighbor + 2-opt improvement
 * Optimizes delivery routes to minimize distance and time
 */

import { prisma } from '../config/database';
import { setCache, getCache, CacheKeys, CacheTTL } from '../config/redis';
import {
  RouteOptimizationResult,
  RouteData,
  RouteWaypoint,
  Coordinates,
  OptimizationMetrics,
} from '../types';

export class RouteOptimizationService {
  /**
   * Optimize route for a truck load
   */
  async optimizeRoute(loadId: string): Promise<RouteOptimizationResult> {
    const startTime = Date.now();

    // Try cache first
    const cacheKey = CacheKeys.route(loadId);
    const cached = await getCache<RouteOptimizationResult>(cacheKey);

    if (cached) {
      return cached;
    }

    // Fetch load with orders
    const load = await prisma.truckLoad.findUnique({
      where: { id: loadId },
      include: {
        truck: {
          include: {
            warehouse: true,
          },
        },
        loadItems: {
          include: {
            order: true,
          },
          orderBy: {
            sequenceNumber: 'asc',
          },
        },
      },
    });

    if (!load) {
      throw new Error(`Load ${loadId} not found`);
    }

    if (!load.truck?.warehouse) {
      throw new Error(`Load ${loadId} has no warehouse information`);
    }

    // Parse warehouse coordinates
    const warehouseCoords = this.parseCoordinates(load.truck.warehouse.coordinates);

    // Build delivery points
    const deliveryPoints: RouteWaypoint[] = load.loadItems.map((item, index) => {
      const coords = this.parseCoordinates(item.order.deliveryCoordinates);
      return {
        orderId: item.order.id,
        address: item.order.deliveryAddress,
        coordinates: coords,
        sequenceNumber: index,
        estimatedDuration: item.order.estimatedDurationMinutes || 15,
      };
    });

    if (deliveryPoints.length === 0) {
      throw new Error(`Load ${loadId} has no delivery points`);
    }

    // Run optimization
    const route = await this.optimizeDeliveryRoute(warehouseCoords, deliveryPoints);

    // Calculate metrics
    const executionTime = Date.now() - startTime;
    const naiveDistance = this.calculateNaiveDistance(warehouseCoords, deliveryPoints);
    const improvement = ((naiveDistance - route.totalDistance) / naiveDistance) * 100;

    const metrics: OptimizationMetrics = {
      algorithm: 'Nearest Neighbor + 2-opt',
      executionTime,
      improvementPercentage: improvement,
      iterations: route.optimizationMetrics?.iterations,
    };

    const result: RouteOptimizationResult = {
      loadId,
      route,
      totalDistance: route.totalDistance,
      totalDuration: route.totalDuration,
      metrics,
    };

    // Cache result for 1 hour
    await setCache(cacheKey, result, CacheTTL.LONG);

    return result;
  }

  /**
   * Optimize delivery route using Nearest Neighbor + 2-opt
   */
  private async optimizeDeliveryRoute(
    warehouseCoords: Coordinates,
    deliveryPoints: RouteWaypoint[]
  ): Promise<RouteData> {
    // Step 1: Get initial solution using Nearest Neighbor
    const initialRoute = this.nearestNeighborTSP(warehouseCoords, deliveryPoints);

    // Step 2: Improve solution using 2-opt
    const improvedRoute = this.twoOptImprovement(warehouseCoords, initialRoute);

    // Step 3: Calculate final metrics
    const totalDistance = this.calculateRouteDistance(warehouseCoords, improvedRoute);
    const totalDuration = this.calculateRouteDuration(improvedRoute);

    // Step 4: Add estimated arrival times
    const waypoints = this.calculateArrivalTimes(warehouseCoords, improvedRoute);

    return {
      waypoints,
      totalDistance,
      totalDuration,
      optimizationMetrics: {
        algorithm: 'Nearest Neighbor + 2-opt',
        executionTime: 0, // Will be set by caller
        iterations: improvedRoute.length,
      },
    };
  }

  /**
   * Nearest Neighbor algorithm for initial TSP solution
   */
  private nearestNeighborTSP(
    start: Coordinates,
    points: RouteWaypoint[]
  ): RouteWaypoint[] {
    const unvisited = [...points];
    const route: RouteWaypoint[] = [];
    let current = start;

    while (unvisited.length > 0) {
      // Find nearest unvisited point
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(current, unvisited[0].coordinates);

      for (let i = 1; i < unvisited.length; i++) {
        const distance = this.calculateDistance(current, unvisited[i].coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Add nearest point to route
      const nearest = unvisited.splice(nearestIndex, 1)[0];
      route.push(nearest);
      current = nearest.coordinates;
    }

    return route;
  }

  /**
   * 2-opt improvement algorithm
   * Iteratively improves route by reversing segments
   */
  private twoOptImprovement(
    start: Coordinates,
    route: RouteWaypoint[]
  ): RouteWaypoint[] {
    if (route.length < 2) return route;

    let improved = true;
    let currentRoute = [...route];
    let iterations = 0;
    const maxIterations = 100;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 0; i < currentRoute.length - 1; i++) {
        for (let j = i + 2; j < currentRoute.length; j++) {
          // Calculate current distance
          const point1 = i === 0 ? start : currentRoute[i - 1].coordinates;
          const point2 = currentRoute[i].coordinates;
          const point3 = currentRoute[j].coordinates;
          const point4 = j === currentRoute.length - 1 ? start : currentRoute[j + 1].coordinates;

          const currentDist =
            this.calculateDistance(point1, point2) +
            this.calculateDistance(point3, point4);

          // Calculate distance after reversing segment
          const newDist =
            this.calculateDistance(point1, point3) +
            this.calculateDistance(point2, point4);

          // If improvement found, reverse segment
          if (newDist < currentDist) {
            const newRoute = [
              ...currentRoute.slice(0, i),
              ...currentRoute.slice(i, j + 1).reverse(),
              ...currentRoute.slice(j + 1),
            ];
            currentRoute = newRoute;
            improved = true;
          }
        }
      }
    }

    return currentRoute;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Calculate total route distance
   */
  private calculateRouteDistance(
    start: Coordinates,
    route: RouteWaypoint[]
  ): number {
    let totalDistance = 0;
    let current = start;

    for (const point of route) {
      totalDistance += this.calculateDistance(current, point.coordinates);
      current = point.coordinates;
    }

    // Add return to warehouse
    totalDistance += this.calculateDistance(current, start);

    return totalDistance;
  }

  /**
   * Calculate total route duration in minutes
   */
  private calculateRouteDuration(route: RouteWaypoint[]): number {
    const averageSpeedKmh = 40; // Average city driving speed
    const totalDistance = route.reduce((sum, point, index) => {
      if (index === 0) return 0;
      return sum + this.calculateDistance(
        route[index - 1].coordinates,
        point.coordinates
      );
    }, 0);

    const drivingTimeMinutes = (totalDistance / averageSpeedKmh) * 60;
    const deliveryTimeMinutes = route.reduce(
      (sum, point) => sum + (point.estimatedDuration || 15),
      0
    );

    return Math.round(drivingTimeMinutes + deliveryTimeMinutes);
  }

  /**
   * Calculate estimated arrival times for each waypoint
   */
  private calculateArrivalTimes(
    start: Coordinates,
    route: RouteWaypoint[]
  ): RouteWaypoint[] {
    const averageSpeedKmh = 40;
    const startTime = new Date();
    let currentTime = new Date(startTime);
    let current = start;

    return route.map((point, index) => {
      // Calculate travel time to this point
      const distance = this.calculateDistance(current, point.coordinates);
      const travelTimeMinutes = (distance / averageSpeedKmh) * 60;

      // Add travel time
      currentTime = new Date(currentTime.getTime() + travelTimeMinutes * 60000);

      const estimatedArrival = new Date(currentTime);

      // Add delivery time for next leg
      currentTime = new Date(
        currentTime.getTime() + (point.estimatedDuration || 15) * 60000
      );

      current = point.coordinates;

      return {
        ...point,
        sequenceNumber: index + 1,
        estimatedArrival,
      };
    });
  }

  /**
   * Calculate naive distance (no optimization)
   */
  private calculateNaiveDistance(
    start: Coordinates,
    points: RouteWaypoint[]
  ): number {
    let totalDistance = 0;
    let current = start;

    for (const point of points) {
      totalDistance += this.calculateDistance(current, point.coordinates);
      current = point.coordinates;
    }

    totalDistance += this.calculateDistance(current, start);
    return totalDistance;
  }

  /**
   * Parse coordinates from string format
   */
  private parseCoordinates(coordString: string): Coordinates {
    // Handle different formats: "lat,lng" or "POINT(lng lat)" or JSON
    try {
      // Try JSON format first
      const parsed = JSON.parse(coordString);
      if (parsed.latitude && parsed.longitude) {
        return {
          latitude: parsed.latitude,
          longitude: parsed.longitude,
        };
      }
    } catch {
      // Not JSON, try other formats
    }

    // Try "lat,lng" format
    if (coordString.includes(',')) {
      const [lat, lng] = coordString.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { latitude: lat, longitude: lng };
      }
    }

    // Try POINT format
    const pointMatch = coordString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (pointMatch) {
      return {
        latitude: parseFloat(pointMatch[2]),
        longitude: parseFloat(pointMatch[1]),
      };
    }

    throw new Error(`Invalid coordinate format: ${coordString}`);
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get route summary
   */
  async getRouteSummary(loadId: string): Promise<{
    totalStops: number;
    totalDistance: number;
    totalDuration: number;
    estimatedStartTime: Date;
    estimatedEndTime: Date;
  }> {
    const result = await this.optimizeRoute(loadId);

    const estimatedStartTime = new Date();
    const estimatedEndTime = new Date(
      estimatedStartTime.getTime() + result.totalDuration * 60000
    );

    return {
      totalStops: result.route.waypoints.length,
      totalDistance: result.totalDistance,
      totalDuration: result.totalDuration,
      estimatedStartTime,
      estimatedEndTime,
    };
  }

  /**
   * Compare routes (for testing/analysis)
   */
  async compareRoutes(
    loadId: string
  ): Promise<{
    optimized: RouteOptimizationResult;
    naive: {
      totalDistance: number;
      totalDuration: number;
    };
    improvement: {
      distanceSaved: number;
      timeSaved: number;
      percentageImprovement: number;
    };
  }> {
    const optimized = await this.optimizeRoute(loadId);

    // Calculate naive route (original order)
    const load = await prisma.truckLoad.findUnique({
      where: { id: loadId },
      include: {
        truck: { include: { warehouse: true } },
        loadItems: {
          include: { order: true },
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });

    if (!load?.truck?.warehouse) {
      throw new Error('Load not found');
    }

    const warehouseCoords = this.parseCoordinates(load.truck.warehouse.coordinates);
    const naivePoints = load.loadItems.map((item) => ({
      orderId: item.order.id,
      address: item.order.deliveryAddress,
      coordinates: this.parseCoordinates(item.order.deliveryCoordinates),
      sequenceNumber: item.sequenceNumber,
      estimatedDuration: item.order.estimatedDurationMinutes || 15,
    }));

    const naiveDistance = this.calculateRouteDistance(warehouseCoords, naivePoints);
    const naiveDuration = this.calculateRouteDuration(naivePoints);

    const distanceSaved = naiveDistance - optimized.totalDistance;
    const timeSaved = naiveDuration - optimized.totalDuration;
    const percentageImprovement = (distanceSaved / naiveDistance) * 100;

    return {
      optimized,
      naive: {
        totalDistance: naiveDistance,
        totalDuration: naiveDuration,
      },
      improvement: {
        distanceSaved,
        timeSaved,
        percentageImprovement,
      },
    };
  }

  /**
   * Validate route feasibility
   */
  async validateRoute(loadId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const result = await this.optimizeRoute(loadId);

      // Check if route is too long
      if (result.totalDistance > 200) {
        warnings.push(`Route distance ${result.totalDistance.toFixed(1)}km exceeds 200km`);
      }

      // Check if duration is too long
      if (result.totalDuration > 480) {
        // 8 hours
        warnings.push(
          `Route duration ${Math.round(result.totalDuration / 60)}h exceeds 8 hours`
        );
      }

      // Check for missing coordinates
      const invalidPoints = result.route.waypoints.filter(
        (wp) => !wp.coordinates.latitude || !wp.coordinates.longitude
      );

      if (invalidPoints.length > 0) {
        errors.push(`${invalidPoints.length} waypoints have invalid coordinates`);
      }
    } catch (error) {
      errors.push(`Route optimization failed: ${(error as Error).message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default new RouteOptimizationService();

// Made with Bob
