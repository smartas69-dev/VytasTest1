import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
  AcUnit as AcUnitIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  weightKg: number;
  volumeM3: number;
  isFragile: boolean;
  requiresRefrigeration: boolean;
  stockQuantity: number;
  unitPrice: number;
}

interface CartItem {
  item: InventoryItem;
  quantity: number;
}

interface InventorySelectorProps {
  onCartChange: (items: CartItem[]) => void;
  maxWeight?: number;
  maxVolume?: number;
}

const InventorySelector: React.FC<InventorySelectorProps> = ({
  onCartChange,
  maxWeight = 1000,
  maxVolume = 10,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock inventory data - In real app, fetch from API
  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      sku: 'ELEC-001',
      name: 'Laptop Computer',
      description: '15-inch business laptop',
      category: 'Electronics',
      weightKg: 2.5,
      volumeM3: 0.006,
      isFragile: true,
      requiresRefrigeration: false,
      stockQuantity: 100,
      unitPrice: 999.99,
    },
    {
      id: '2',
      sku: 'ELEC-002',
      name: 'Smartphone',
      description: 'Latest model smartphone',
      category: 'Electronics',
      weightKg: 0.2,
      volumeM3: 0.00012,
      isFragile: true,
      requiresRefrigeration: false,
      stockQuantity: 150,
      unitPrice: 699.99,
    },
    {
      id: '3',
      sku: 'FURN-001',
      name: 'Office Chair',
      description: 'Ergonomic office chair',
      category: 'Furniture',
      weightKg: 15,
      volumeM3: 0.432,
      isFragile: false,
      requiresRefrigeration: false,
      stockQuantity: 50,
      unitPrice: 299.99,
    },
    {
      id: '4',
      sku: 'FOOD-001',
      name: 'Fresh Vegetables Box',
      description: 'Assorted fresh vegetables',
      category: 'Food',
      weightKg: 5,
      volumeM3: 0.024,
      isFragile: false,
      requiresRefrigeration: true,
      stockQuantity: 200,
      unitPrice: 29.99,
    },
    {
      id: '5',
      sku: 'BOOK-001',
      name: 'Programming Book',
      description: 'Advanced TypeScript guide',
      category: 'Books',
      weightKg: 0.8,
      volumeM3: 0.0015,
      isFragile: false,
      requiresRefrigeration: false,
      stockQuantity: 300,
      unitPrice: 39.99,
    },
  ]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(inventory.map((item) => item.category)))];

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate cart totals
  const cartTotals = cart.reduce(
    (acc, cartItem) => ({
      weight: acc.weight + cartItem.item.weightKg * cartItem.quantity,
      volume: acc.volume + cartItem.item.volumeM3 * cartItem.quantity,
      price: acc.price + cartItem.item.unitPrice * cartItem.quantity,
      items: acc.items + cartItem.quantity,
    }),
    { weight: 0, volume: 0, price: 0, items: 0 }
  );

  // Get item quantity in cart
  const getCartQuantity = (itemId: string): number => {
    const cartItem = cart.find((ci) => ci.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find((ci) => ci.item.id === item.id);
    let newCart: CartItem[];

    if (existingItem) {
      newCart = cart.map((ci) =>
        ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      );
    } else {
      newCart = [...cart, { item, quantity: 1 }];
    }

    setCart(newCart);
    onCartChange(newCart);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find((ci) => ci.item.id === itemId);
    let newCart: CartItem[];

    if (existingItem && existingItem.quantity > 1) {
      newCart = cart.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci
      );
    } else {
      newCart = cart.filter((ci) => ci.item.id !== itemId);
    }

    setCart(newCart);
    onCartChange(newCart);
  };

  // Check if adding item would exceed limits
  const wouldExceedLimits = (item: InventoryItem): boolean => {
    const newWeight = cartTotals.weight + item.weightKg;
    const newVolume = cartTotals.volume + item.volumeM3;
    return newWeight > maxWeight || newVolume > maxVolume;
  };

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Search and Filter */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Badge badgeContent={cartTotals.items} color="primary">
                <ShoppingCartIcon />
              </Badge>
              <Typography variant="caption" sx={{ ml: 1 }}>
                {cartTotals.items} items
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cart Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
                <Typography variant="h6">{cartTotals.items}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Weight
                </Typography>
                <Typography
                  variant="h6"
                  color={cartTotals.weight > maxWeight * 0.8 ? 'warning.main' : 'inherit'}
                >
                  {cartTotals.weight.toFixed(1)} kg
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {maxWeight} kg
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Volume
                </Typography>
                <Typography
                  variant="h6"
                  color={cartTotals.volume > maxVolume * 0.8 ? 'warning.main' : 'inherit'}
                >
                  {cartTotals.volume.toFixed(3)} m³
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  / {maxVolume} m³
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Total Price
                </Typography>
                <Typography variant="h6" color="primary">
                  {formatPrice(cartTotals.price)}
                </Typography>
              </Grid>
            </Grid>
            {(cartTotals.weight > maxWeight || cartTotals.volume > maxVolume) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Cart exceeds capacity limits. Please remove some items.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Grid */}
      <Grid container spacing={2}>
        {filteredInventory.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No items found matching your search.</Alert>
          </Grid>
        ) : (
          filteredInventory.map((item) => {
            const quantity = getCartQuantity(item.id);
            const isInCart = quantity > 0;
            const exceedsLimits = wouldExceedLimits(item);
            const outOfStock = item.stockQuantity === 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: outOfStock ? 0.6 : 1,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={item.category} size="small" color="primary" variant="outlined" />
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {item.isFragile && (
                          <Chip
                            icon={<WarningIcon />}
                            label="Fragile"
                            size="small"
                            color="warning"
                          />
                        )}
                        {item.requiresRefrigeration && (
                          <Chip
                            icon={<AcUnitIcon />}
                            label="Cold"
                            size="small"
                            color="info"
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        SKU: {item.sku}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Stock: {item.stockQuantity}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Weight: {item.weightKg} kg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Volume: {item.volumeM3.toFixed(4)} m³
                      </Typography>
                    </Box>

                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      {formatPrice(item.unitPrice)}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 2, pt: 0 }}>
                    {outOfStock ? (
                      <Button fullWidth variant="outlined" disabled>
                        Out of Stock
                      </Button>
                    ) : isInCart ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          color="primary"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography variant="h6">{quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => addToCart(item)}
                          color="primary"
                          disabled={exceedsLimits || quantity >= item.stockQuantity}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => addToCart(item)}
                        disabled={exceedsLimits}
                      >
                        {exceedsLimits ? 'Exceeds Limits' : 'Add to Cart'}
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
};

export default InventorySelector;

// Made with Bob
