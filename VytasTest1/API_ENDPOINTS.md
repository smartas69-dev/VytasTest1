# API Endpoints Reference

Base URL: `http://localhost:3000/api`

## Health Check
- **GET** `/health` - Check API status

## Drivers
- **GET** `/drivers` - List all drivers
  - Query params: `status`, `search`
- **GET** `/drivers/:id` - Get driver by ID
- **POST** `/drivers` - Create new driver
- **PUT** `/drivers/:id` - Update driver
- **DELETE** `/drivers/:id` - Delete driver

## Customers
- **GET** `/customers` - List all customers
  - Query params: `status`, `search`
- **GET** `/customers/:id` - Get customer by ID
- **POST** `/customers` - Create new customer
- **PUT** `/customers/:id` - Update customer
- **DELETE** `/customers/:id` - Delete customer

## Trucks
- **GET** `/trucks` - List all trucks
  - Query params: `status`, `search`
- **GET** `/trucks/:id` - Get truck by ID
- **POST** `/trucks` - Create new truck
- **PUT** `/trucks/:id` - Update truck
- **DELETE** `/trucks/:id` - Delete truck

## Inventory Items
- **GET** `/inventory` - List all inventory items
  - Query params: `category`, `search`
- **GET** `/inventory/:id` - Get item by ID
- **POST** `/inventory` - Create new item
- **PUT** `/inventory/:id` - Update item
- **DELETE** `/inventory/:id` - Delete item

## Delivery Zones
- **GET** `/delivery-zones` - List all zones
  - Query params: `search`
- **GET** `/delivery-zones/:id` - Get zone by ID
- **POST** `/delivery-zones` - Create new zone
- **PUT** `/delivery-zones/:id` - Update zone
- **DELETE** `/delivery-zones/:id` - Delete zone

## Warehouses
- **GET** `/warehouses` - List all warehouses
  - Query params: `search`
- **GET** `/warehouses/:id` - Get warehouse by ID
- **POST** `/warehouses` - Create new warehouse
- **PUT** `/warehouses/:id` - Update warehouse
- **DELETE** `/warehouses/:id` - Delete warehouse

## Testing with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Get all drivers
curl http://localhost:3000/api/drivers

# Get drivers with status filter
curl "http://localhost:3000/api/drivers?status=ACTIVE"

# Get single driver
curl http://localhost:3000/api/drivers/1

# Create new driver
curl -X POST http://localhost:3000/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "licenseNumber": "DL123456",
    "phone": "+1234567890",
    "email": "john.doe@example.com",
    "status": "ACTIVE"
  }'

# Update driver
curl -X PUT http://localhost:3000/api/drivers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "INACTIVE"
  }'

# Delete driver
curl -X DELETE http://localhost:3000/api/drivers/1
```

## Made with Bob