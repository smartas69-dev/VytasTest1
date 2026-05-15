-- Populate Sample Data for Last Mile Delivery System

-- Insert Delivery Zones
INSERT INTO "DeliveryZone" (id, name, code, polygon, "maxDailyCapacity", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Downtown', 'DT-001', '{"type":"Polygon","coordinates":[[[24.9384,60.1695],[24.9584,60.1695],[24.9584,60.1795],[24.9384,60.1795],[24.9384,60.1695]]]}', 100, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'North District', 'ND-001', '{"type":"Polygon","coordinates":[[[24.9284,60.1795],[24.9684,60.1795],[24.9684,60.1995],[24.9284,60.1995],[24.9284,60.1795]]]}', 80, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'South District', 'SD-001', '{"type":"Polygon","coordinates":[[[24.9284,60.1495],[24.9684,60.1495],[24.9684,60.1695],[24.9284,60.1695],[24.9284,60.1495]]]}', 80, true, NOW(), NOW());

-- Insert Warehouses
INSERT INTO "warehouses" (id, name, address, coordinates, "totalCapacityM3", "usedCapacityM3", "isActive", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Main Distribution Center', '123 Warehouse Street, Helsinki', '{"lat":60.1699,"lng":24.9384}', 1000, 0, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'North Hub', '456 Storage Avenue, Vantaa', '{"lat":60.2934,"lng":25.0378}', 500, 0, true, NOW(), NOW());

-- Insert Inventory Items
INSERT INTO "inventory_items" (id, sku, name, description, category, "weightKg", "volumeM3", "dimensionsCm", "isFragile", "requiresRefrigeration", "stockQuantity", "reservedQuantity", "unitPrice", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440020', 'ELEC-001', 'Laptop Computer', '15-inch business laptop', 'Electronics', 2.5, 0.006, '40x30x5', true, false, 100, 0, 999.99, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'ELEC-002', 'Smartphone', 'Latest model smartphone', 'Electronics', 0.2, 0.00012, '15x8x1', true, false, 150, 0, 699.99, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'FURN-001', 'Office Chair', 'Ergonomic office chair', 'Furniture', 15, 0.432, '60x60x120', false, false, 50, 0, 299.99, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'FOOD-001', 'Fresh Vegetables Box', 'Assorted fresh vegetables', 'Food', 5, 0.024, '40x30x20', false, true, 200, 0, 29.99, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'BOOK-001', 'Programming Book', 'Advanced TypeScript guide', 'Books', 0.8, 0.0015, '25x20x3', false, false, 300, 0, 39.99, NOW(), NOW());

-- Insert Trucks
INSERT INTO "trucks" (id, "registrationNumber", type, "maxWeightKg", "maxVolumeM3", "currentWeightKg", "currentVolumeM3", "fuelType", status, "currentLocation", "warehouseId", "hasRefrigeration", "hasLiftGate", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440030', 'ABC-123', 'Mercedes Sprinter', 3500, 15, 0, 0, 'Diesel', 'available', '{"lat":60.1699,"lng":24.9384}', '550e8400-e29b-41d4-a716-446655440010', true, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440031', 'DEF-456', 'Ford Transit', 2500, 12, 0, 0, 'Diesel', 'available', '{"lat":60.2934,"lng":25.0378}', '550e8400-e29b-41d4-a716-446655440011', false, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440032', 'GHI-789', 'Volkswagen Crafter', 3000, 14, 0, 0, 'Diesel', 'available', '{"lat":60.1699,"lng":24.9384}', '550e8400-e29b-41d4-a716-446655440010', true, false, NOW(), NOW());

-- Insert Drivers
INSERT INTO "drivers" (id, "employeeId", "firstName", "lastName", email, phone, "licenseNumber", "licenseExpiry", status, "currentTruckId", "shiftStart", "shiftEnd", "maxHoursPerDay", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440040', 'DRV-001', 'John', 'Driver', 'john.driver@lastmile.com', '+358401234567', 'DL-001-2024', '2028-12-31', 'available', '550e8400-e29b-41d4-a716-446655440030', '08:00:00', '16:00:00', 8, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440041', 'DRV-002', 'Jane', 'Wilson', 'jane.wilson@lastmile.com', '+358401234568', 'DL-002-2024', '2029-06-30', 'available', '550e8400-e29b-41d4-a716-446655440031', '08:00:00', '16:00:00', 8, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440042', 'DRV-003', 'Mike', 'Anderson', 'mike.anderson@lastmile.com', '+358401234569', 'DL-003-2024', '2027-12-31', 'available', '550e8400-e29b-41d4-a716-446655440032', '09:00:00', '17:00:00', 8, NOW(), NOW());

-- Insert Customers
INSERT INTO "customers" (id, email, "firstName", "lastName", phone, "defaultAddress", "defaultCoordinates", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440050', 'alice.smith@example.com', 'Alice', 'Smith', '+358501234567', '10 Main Street, Helsinki', '{"lat":60.1695,"lng":24.9384}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440051', 'bob.johnson@example.com', 'Bob', 'Johnson', '+358501234568', '20 North Avenue, Helsinki', '{"lat":60.1895,"lng":24.9484}', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440052', 'carol.williams@example.com', 'Carol', 'Williams', '+358501234569', '30 South Road, Helsinki', '{"lat":60.1595,"lng":24.9484}', NOW(), NOW());

-- Insert Time Slots (next 7 days, 8 slots per day)
INSERT INTO "time_slots" (id, "zoneId", date, "startTime", "endTime", "totalCapacity", "availableCapacity", "priceMultiplier", status, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    z.id,
    CURRENT_DATE + (d || ' days')::interval,
    ('09:00:00'::time + (h || ' hours')::interval)::time,
    ('10:00:00'::time + (h || ' hours')::interval)::time,
    10,
    10,
    1.0,
    'active',
    NOW(),
    NOW()
FROM 
    (SELECT id FROM "DeliveryZone" LIMIT 3) z,
    generate_series(0, 6) d,
    generate_series(0, 7) h;

-- Insert Sample Orders
INSERT INTO "orders" (id, "orderNumber", "customerId", "deliveryAddress", "deliveryCoordinates", "zoneId", status, priority, "totalWeightKg", "totalVolumeM3", "estimatedDurationMinutes", "requiresSignature", "createdAt", "updatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440060', 'ORD-000001', '550e8400-e29b-41d4-a716-446655440050', '10 Main Street, Helsinki', '{"lat":60.1695,"lng":24.9384}', '550e8400-e29b-41d4-a716-446655440001', 'pending', 0, 2.5, 0.006, 30, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440061', 'ORD-000002', '550e8400-e29b-41d4-a716-446655440051', '20 North Avenue, Helsinki', '{"lat":60.1895,"lng":24.9484}', '550e8400-e29b-41d4-a716-446655440002', 'confirmed', 1, 15, 0.432, 30, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440062', 'ORD-000003', '550e8400-e29b-41d4-a716-446655440052', '30 South Road, Helsinki', '{"lat":60.1595,"lng":24.9484}', '550e8400-e29b-41d4-a716-446655440003', 'assigned', 0, 5, 0.024, 30, true, NOW(), NOW());

-- Insert Order Items
INSERT INTO "order_items" (id, "orderId", "inventoryItemId", quantity, "unitPrice", "totalPrice", "createdAt") VALUES
('550e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440020', 1, 999.99, 999.99, NOW()),
('550e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440022', 1, 299.99, 299.99, NOW()),
('550e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440023', 2, 29.99, 59.98, NOW());

-- Made with Bob
