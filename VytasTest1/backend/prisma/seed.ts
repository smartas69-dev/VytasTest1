import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in correct order (respecting foreign keys)
  console.log('🧹 Cleaning existing data...');
  await prisma.inventoryTransaction.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.loadItem.deleteMany();
  await prisma.truckLoad.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.deliveryZone.deleteMany();

  // 1. Create Delivery Zones
  console.log('📍 Creating delivery zones...');
  const zones = await Promise.all([
    prisma.deliveryZone.create({
      data: {
        name: 'Downtown',
        code: 'DT-001',
        polygon: JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [24.9384, 60.1695],
            [24.9584, 60.1695],
            [24.9584, 60.1795],
            [24.9384, 60.1795],
            [24.9384, 60.1695],
          ]],
        }),
        maxDailyCapacity: 100,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'North District',
        code: 'ND-001',
        polygon: JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [24.9284, 60.1795],
            [24.9684, 60.1795],
            [24.9684, 60.1995],
            [24.9284, 60.1995],
            [24.9284, 60.1795],
          ]],
        }),
        maxDailyCapacity: 80,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'South District',
        code: 'SD-001',
        polygon: JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [24.9284, 60.1495],
            [24.9684, 60.1495],
            [24.9684, 60.1695],
            [24.9284, 60.1695],
            [24.9284, 60.1495],
          ]],
        }),
        maxDailyCapacity: 80,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'East District',
        code: 'ED-001',
        polygon: JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [24.9684, 60.1595],
            [24.9984, 60.1595],
            [24.9984, 60.1795],
            [24.9684, 60.1795],
            [24.9684, 60.1595],
          ]],
        }),
        maxDailyCapacity: 60,
        isActive: true,
      },
    }),
    prisma.deliveryZone.create({
      data: {
        name: 'West District',
        code: 'WD-001',
        polygon: JSON.stringify({
          type: 'Polygon',
          coordinates: [[
            [24.8984, 60.1595],
            [24.9284, 60.1595],
            [24.9284, 60.1795],
            [24.8984, 60.1795],
            [24.8984, 60.1595],
          ]],
        }),
        maxDailyCapacity: 60,
        isActive: true,
      },
    }),
  ]);

  // 2. Create Warehouses
  console.log('🏭 Creating warehouses...');
  const warehouses = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: 'Main Distribution Center',
        address: '123 Warehouse Street, Helsinki',
        coordinates: JSON.stringify({ lat: 60.1699, lng: 24.9384 }),
        totalCapacityM3: 1000,
        usedCapacityM3: 0,
        isActive: true,
      },
    }),
    prisma.warehouse.create({
      data: {
        name: 'North Hub',
        address: '456 Storage Avenue, Vantaa',
        coordinates: JSON.stringify({ lat: 60.2934, lng: 25.0378 }),
        totalCapacityM3: 500,
        usedCapacityM3: 0,
        isActive: true,
      },
    }),
  ]);

  // 3. Create Inventory Items
  console.log('📦 Creating inventory items...');
  const items = await Promise.all([
    // Electronics
    prisma.inventoryItem.create({
      data: {
        sku: 'ELEC-001',
        name: 'Laptop Computer',
        description: '15-inch business laptop',
        category: 'Electronics',
        weightKg: 2.5,
        volumeM3: 0.006,
        dimensionsCm: '40x30x5',
        isFragile: true,
        requiresRefrigeration: false,
        stockQuantity: 100,
        reservedQuantity: 0,
        unitPrice: 999.99,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'ELEC-002',
        name: 'Smartphone',
        description: 'Latest model smartphone',
        category: 'Electronics',
        weightKg: 0.2,
        volumeM3: 0.00012,
        dimensionsCm: '15x8x1',
        isFragile: true,
        requiresRefrigeration: false,
        stockQuantity: 150,
        reservedQuantity: 0,
        unitPrice: 699.99,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'ELEC-003',
        name: 'Tablet',
        description: '10-inch tablet',
        category: 'Electronics',
        weightKg: 0.5,
        volumeM3: 0.00045,
        dimensionsCm: '25x18x1',
        isFragile: true,
        requiresRefrigeration: false,
        stockQuantity: 120,
        reservedQuantity: 0,
        unitPrice: 499.99,
      },
    }),
    // Furniture
    prisma.inventoryItem.create({
      data: {
        sku: 'FURN-001',
        name: 'Office Chair',
        description: 'Ergonomic office chair',
        category: 'Furniture',
        weightKg: 15,
        volumeM3: 0.432,
        dimensionsCm: '60x60x120',
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 50,
        reservedQuantity: 0,
        unitPrice: 299.99,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'FURN-002',
        name: 'Standing Desk',
        description: 'Adjustable standing desk',
        category: 'Furniture',
        weightKg: 30,
        volumeM3: 1.2,
        dimensionsCm: '150x80x10',
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 40,
        reservedQuantity: 0,
        unitPrice: 599.99,
      },
    }),
    // Food
    prisma.inventoryItem.create({
      data: {
        sku: 'FOOD-001',
        name: 'Fresh Vegetables Box',
        description: 'Assorted fresh vegetables',
        category: 'Food',
        weightKg: 5,
        volumeM3: 0.024,
        dimensionsCm: '40x30x20',
        isFragile: false,
        requiresRefrigeration: true,
        stockQuantity: 200,
        reservedQuantity: 0,
        unitPrice: 29.99,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'FOOD-002',
        name: 'Frozen Meals Pack',
        description: 'Pack of 10 frozen meals',
        category: 'Food',
        weightKg: 3,
        volumeM3: 0.01125,
        dimensionsCm: '30x25x15',
        isFragile: false,
        requiresRefrigeration: true,
        stockQuantity: 180,
        reservedQuantity: 0,
        unitPrice: 49.99,
      },
    }),
    // Books
    prisma.inventoryItem.create({
      data: {
        sku: 'BOOK-001',
        name: 'Programming Book',
        description: 'Advanced TypeScript guide',
        category: 'Books',
        weightKg: 0.8,
        volumeM3: 0.0015,
        dimensionsCm: '25x20x3',
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 300,
        reservedQuantity: 0,
        unitPrice: 39.99,
      },
    }),
    prisma.inventoryItem.create({
      data: {
        sku: 'BOOK-002',
        name: 'Fiction Novel',
        description: 'Bestselling fiction',
        category: 'Books',
        weightKg: 0.5,
        volumeM3: 0.0006,
        dimensionsCm: '20x15x2',
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 350,
        reservedQuantity: 0,
        unitPrice: 19.99,
      },
    }),
    // Clothing
    prisma.inventoryItem.create({
      data: {
        sku: 'CLTH-001',
        name: 'Winter Jacket',
        description: 'Insulated winter jacket',
        category: 'Clothing',
        weightKg: 1.2,
        volumeM3: 0.03,
        dimensionsCm: '60x50x10',
        isFragile: false,
        requiresRefrigeration: false,
        stockQuantity: 100,
        reservedQuantity: 0,
        unitPrice: 149.99,
      },
    }),
  ]);

  // 4. Create Trucks
  console.log('🚚 Creating trucks...');
  const trucks = await Promise.all([
    prisma.truck.create({
      data: {
        registrationNumber: 'ABC-123',
        type: 'Mercedes Sprinter',
        maxWeightKg: 3500,
        maxVolumeM3: 15,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        fuelType: 'Diesel',
        status: 'available',
        currentLocation: JSON.stringify({ lat: 60.1699, lng: 24.9384 }),
        warehouseId: warehouses[0].id,
        hasRefrigeration: true,
        hasLiftGate: true,
      },
    }),
    prisma.truck.create({
      data: {
        registrationNumber: 'DEF-456',
        type: 'Ford Transit',
        maxWeightKg: 2500,
        maxVolumeM3: 12,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        fuelType: 'Diesel',
        status: 'available',
        currentLocation: JSON.stringify({ lat: 60.2934, lng: 25.0378 }),
        warehouseId: warehouses[1].id,
        hasRefrigeration: false,
        hasLiftGate: true,
      },
    }),
    prisma.truck.create({
      data: {
        registrationNumber: 'GHI-789',
        type: 'Volkswagen Crafter',
        maxWeightKg: 3000,
        maxVolumeM3: 14,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        fuelType: 'Diesel',
        status: 'available',
        currentLocation: JSON.stringify({ lat: 60.1699, lng: 24.9384 }),
        warehouseId: warehouses[0].id,
        hasRefrigeration: true,
        hasLiftGate: false,
      },
    }),
    prisma.truck.create({
      data: {
        registrationNumber: 'JKL-012',
        type: 'Renault Master',
        maxWeightKg: 2800,
        maxVolumeM3: 13,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        fuelType: 'Diesel',
        status: 'available',
        currentLocation: JSON.stringify({ lat: 60.2934, lng: 25.0378 }),
        warehouseId: warehouses[1].id,
        hasRefrigeration: false,
        hasLiftGate: false,
      },
    }),
    prisma.truck.create({
      data: {
        registrationNumber: 'MNO-345',
        type: 'Iveco Daily',
        maxWeightKg: 3200,
        maxVolumeM3: 14.5,
        currentWeightKg: 0,
        currentVolumeM3: 0,
        fuelType: 'Diesel',
        status: 'available',
        currentLocation: JSON.stringify({ lat: 60.1699, lng: 24.9384 }),
        warehouseId: warehouses[0].id,
        hasRefrigeration: true,
        hasLiftGate: true,
      },
    }),
  ]);

  // 5. Create Drivers
  console.log('👨‍✈️ Creating drivers...');
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        employeeId: 'DRV-001',
        firstName: 'John',
        lastName: 'Driver',
        email: 'john.driver@lastmile.com',
        phone: '+358401234567',
        licenseNumber: 'DL-001-2024',
        licenseExpiry: new Date('2028-12-31'),
        status: 'available',
        currentTruckId: trucks[0].id,
        shiftStart: new Date('1970-01-01T08:00:00Z'),
        shiftEnd: new Date('1970-01-01T16:00:00Z'),
        maxHoursPerDay: 8,
      },
    }),
    prisma.driver.create({
      data: {
        employeeId: 'DRV-002',
        firstName: 'Jane',
        lastName: 'Wilson',
        email: 'jane.wilson@lastmile.com',
        phone: '+358401234568',
        licenseNumber: 'DL-002-2024',
        licenseExpiry: new Date('2029-06-30'),
        status: 'available',
        currentTruckId: trucks[1].id,
        shiftStart: new Date('1970-01-01T08:00:00Z'),
        shiftEnd: new Date('1970-01-01T16:00:00Z'),
        maxHoursPerDay: 8,
      },
    }),
    prisma.driver.create({
      data: {
        employeeId: 'DRV-003',
        firstName: 'Mike',
        lastName: 'Anderson',
        email: 'mike.anderson@lastmile.com',
        phone: '+358401234569',
        licenseNumber: 'DL-003-2024',
        licenseExpiry: new Date('2027-12-31'),
        status: 'available',
        currentTruckId: trucks[2].id,
        shiftStart: new Date('1970-01-01T09:00:00Z'),
        shiftEnd: new Date('1970-01-01T17:00:00Z'),
        maxHoursPerDay: 8,
      },
    }),
    prisma.driver.create({
      data: {
        employeeId: 'DRV-004',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@lastmile.com',
        phone: '+358401234570',
        licenseNumber: 'DL-004-2024',
        licenseExpiry: new Date('2028-03-31'),
        status: 'available',
        shiftStart: new Date('1970-01-01T09:00:00Z'),
        shiftEnd: new Date('1970-01-01T17:00:00Z'),
        maxHoursPerDay: 8,
      },
    }),
    prisma.driver.create({
      data: {
        employeeId: 'DRV-005',
        firstName: 'Tom',
        lastName: 'Brown',
        email: 'tom.brown@lastmile.com',
        phone: '+358401234571',
        licenseNumber: 'DL-005-2024',
        licenseExpiry: new Date('2029-09-30'),
        status: 'off_duty',
        shiftStart: new Date('1970-01-01T10:00:00Z'),
        shiftEnd: new Date('1970-01-01T18:00:00Z'),
        maxHoursPerDay: 8,
      },
    }),
  ]);

  // 6. Create Customers
  console.log('👤 Creating customers...');
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        email: 'alice.smith@example.com',
        firstName: 'Alice',
        lastName: 'Smith',
        phone: '+358501234567',
        defaultAddress: '10 Main Street, Helsinki',
        defaultCoordinates: JSON.stringify({ lat: 60.1695, lng: 24.9384 }),
      },
    }),
    prisma.customer.create({
      data: {
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '+358501234568',
        defaultAddress: '20 North Avenue, Helsinki',
        defaultCoordinates: JSON.stringify({ lat: 60.1895, lng: 24.9484 }),
      },
    }),
    prisma.customer.create({
      data: {
        email: 'carol.williams@example.com',
        firstName: 'Carol',
        lastName: 'Williams',
        phone: '+358501234569',
        defaultAddress: '30 South Road, Helsinki',
        defaultCoordinates: JSON.stringify({ lat: 60.1595, lng: 24.9484 }),
      },
    }),
    prisma.customer.create({
      data: {
        email: 'david.brown@example.com',
        firstName: 'David',
        lastName: 'Brown',
        phone: '+358501234570',
        defaultAddress: '40 East Street, Helsinki',
        defaultCoordinates: JSON.stringify({ lat: 60.1695, lng: 24.9784 }),
      },
    }),
    prisma.customer.create({
      data: {
        email: 'emma.davis@example.com',
        firstName: 'Emma',
        lastName: 'Davis',
        phone: '+358501234571',
        defaultAddress: '50 West Boulevard, Helsinki',
        defaultCoordinates: JSON.stringify({ lat: 60.1695, lng: 24.9184 }),
      },
    }),
  ]);

  // 7. Create Time Slots (next 14 days)
  console.log('⏰ Creating time slots...');
  const now = new Date();
  const slotsPerDay = 8; // 8 time slots per day (9 AM - 5 PM)
  
  for (let day = 0; day < 14; day++) {
    for (let slot = 0; slot < slotsPerDay; slot++) {
      const slotDate = new Date(now);
      slotDate.setDate(slotDate.getDate() + day);
      slotDate.setHours(0, 0, 0, 0);
      
      const startTime = new Date('1970-01-01');
      startTime.setHours(9 + slot, 0, 0, 0);
      
      const endTime = new Date('1970-01-01');
      endTime.setHours(10 + slot, 0, 0, 0);

      for (const zone of zones) {
        await prisma.timeSlot.create({
          data: {
            zoneId: zone.id,
            date: slotDate,
            startTime: startTime,
            endTime: endTime,
            totalCapacity: 10,
            availableCapacity: 10,
            priceMultiplier: 1.0,
            status: 'active',
          },
        });
      }
    }
  }

  // 8. Create Sample Orders
  console.log('📝 Creating sample orders...');
  
  for (let i = 0; i < 25; i++) {
    const customer = customers[i % customers.length];
    const zone = zones[i % zones.length];
    
    // Get a time slot for this zone
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        zoneId: zone.id,
        availableCapacity: { gt: 0 },
      },
      take: 1,
    });
    
    if (timeSlots.length === 0) continue;
    
    const timeSlot = timeSlots[0];
    
    // Determine order status based on index
    let status = 'pending';
    if (i < 5) status = 'pending';
    else if (i < 10) status = 'confirmed';
    else if (i < 15) status = 'assigned';
    else if (i < 20) status = 'in_transit';
    else status = 'delivered';
    
    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
        customerId: customer.id,
        slotId: timeSlot.id,
        deliveryAddress: customer.defaultAddress || 'Unknown Address',
        deliveryCoordinates: customer.defaultCoordinates || JSON.stringify({ lat: 60.1699, lng: 24.9384 }),
        zoneId: zone.id,
        status: status,
        priority: Math.floor(Math.random() * 3),
        totalWeightKg: 0,
        totalVolumeM3: 0,
        estimatedDurationMinutes: 30,
        specialInstructions: i % 3 === 0 ? 'Please call before delivery' : null,
        requiresSignature: i % 2 === 0,
      },
    });
    
    // Add order items
    const numItems = Math.floor(Math.random() * 3) + 1;
    let totalWeight = 0;
    let totalVolume = 0;
    
    for (let j = 0; j < numItems; j++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      const unitPrice = Number(item.unitPrice || 0);
      
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          inventoryItemId: item.id,
          quantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice * quantity,
        },
      });
      
      totalWeight += Number(item.weightKg) * quantity;
      totalVolume += Number(item.volumeM3) * quantity;
    }
    
    // Update order totals
    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalWeightKg: totalWeight,
        totalVolumeM3: totalVolume,
      },
    });
    
    // Update time slot capacity
    await prisma.timeSlot.update({
      where: { id: timeSlot.id },
      data: {
        availableCapacity: { decrement: 1 },
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Delivery Zones: ${await prisma.deliveryZone.count()}`);
  console.log(`- Warehouses: ${await prisma.warehouse.count()}`);
  console.log(`- Inventory Items: ${await prisma.inventoryItem.count()}`);
  console.log(`- Trucks: ${await prisma.truck.count()}`);
  console.log(`- Drivers: ${await prisma.driver.count()}`);
  console.log(`- Customers: ${await prisma.customer.count()}`);
  console.log(`- Time Slots: ${await prisma.timeSlot.count()}`);
  console.log(`- Orders: ${await prisma.order.count()}`);
  console.log(`- Order Items: ${await prisma.orderItem.count()}`);
  
  console.log('\n📧 Test Customer Emails:');
  console.log('- alice.smith@example.com');
  console.log('- bob.johnson@example.com');
  console.log('- carol.williams@example.com');
  console.log('- david.brown@example.com');
  console.log('- emma.davis@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Made with Bob
