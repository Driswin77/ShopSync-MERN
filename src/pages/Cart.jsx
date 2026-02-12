import React from 'react';
import { 
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, 
  Button, IconButton, Divider, Paper, Stack, Chip 
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  // === CALCULATIONS ===
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 40; 
  const total = subtotal + shipping;
  
  // Fake "MRP" calculation to show savings (Real Price * 1.25 approx)
  const totalMRP = Math.round(subtotal * 1.25);
  const discount = totalMRP - subtotal;

  // Generic delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const dateString = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // === CHECKOUT HANDLER ===
  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        navigate('/login'); // Force Login if not logged in
        return;
    }

    // Send ALL cart items to Checkout Page
    navigate('/checkout', { 
        state: { 
            products: cartItems 
        } 
    });
  };

  // === EMPTY STATE ===
  if (cartItems.length === 0) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f1f3f6' }}>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: 'white' }}>
          <Box sx={{ mb: 3, opacity: 0.2 }}>
            <ShoppingCartCheckoutIcon sx={{ fontSize: 100, color: '#00796b' }} />
          </Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>Your Cart is Empty</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/')}
            sx={{ bgcolor: '#00796b', px: 6, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#004d40' } }}
          >
            Start Shopping
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f1f3f6', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#1a1a1a' }}>
          Shopping Cart <span style={{ fontSize: '0.8em', color: '#666', fontWeight: 400 }}>({cartItems.length} items)</span>
        </Typography>

        <Grid container spacing={4}>
          
          {/* === LEFT COLUMN: CART ITEMS === */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {cartItems.map((item) => (
                <Card key={item.id} elevation={0} sx={{ display: 'flex', p: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                  
                  {/* PRODUCT IMAGE */}
                  <Box sx={{ width: 120, height: 120, flexShrink: 0, p: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa', borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.title}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </Box>

                  {/* DETAILS SECTION - UPDATED LAYOUT */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 3 }}>
                    
                    {/* 1. Title */}
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5 }}>
                        {item.title}
                    </Typography>

                    {/* 2. Category & Delivery - Stacked below title */}
                    <Typography variant="caption" sx={{ display: 'flex', mb: 0.5, color: '#666' }}>
                        Category: {item.category}
                    </Typography>

                    <Typography variant="caption" sx={{ display: 'flex', color: '#444', fontWeight: 500 }}>
                        Delivery by {dateString}
                    </Typography>

                    {/* 3. Price */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>₹{item.price.toLocaleString('en-IN')}</Typography>
                        <Typography variant="body2" sx={{ textDecoration: 'line-through', color: '#999' }}>
                            ₹{Math.round(item.price * 1.25).toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#388e3c', fontWeight: 700 }}>20% Off</Typography>
                    </Box>

                    {/* 4. Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 2 }}>
                        
                        {/* QUANTITY */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.id, -1)} 
                            disabled={item.quantity <= 1}
                            sx={{ border: '1px solid #ddd', color: item.quantity <= 1 ? '#ccc' : '#333' }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          
                          <Typography sx={{ mx: 1, fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.id, 1)}
                            sx={{ border: '1px solid #333', color: '#333', bgcolor: '#fff', '&:hover': { bgcolor: '#f0f0f0' } }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* REMOVE BUTTON */}
                        <Button 
                          startIcon={<DeleteOutlineIcon />} 
                          onClick={() => removeFromCart(item.id)}
                          sx={{ textTransform: 'none', color: '#d32f2f', fontWeight: 600, '&:hover': { bgcolor: '#ffebee' } }}
                        >
                          Remove
                        </Button>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* === RIGHT COLUMN: BILLING === */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ color: '#878787', fontWeight: 700, mb: 2, letterSpacing: 1 }}>
                  PRICE DETAILS
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Price ({cartItems.length} items)</Typography>
                    <Typography variant="body1">₹{totalMRP.toLocaleString('en-IN')}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Discount</Typography>
                    <Typography variant="body1" color="success.main">- ₹{discount.toLocaleString('en-IN')}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Delivery Charges</Typography>
                    <Typography variant="body1" color="success.main">
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ borderStyle: 'dashed', mb: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Total Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>₹{total.toLocaleString('en-IN')}</Typography>
                </Box>

                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large" 
                  sx={{ 
                    backgroundColor: '#00796b', 
                    py: 1.5,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': { backgroundColor: '#004d40', boxShadow: 'none' }
                  }}
                  onClick={handleCheckout} 
                >
                  Place Order
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 3, color: '#666', justifyContent: 'center' }}>
                   <SecurityIcon sx={{ fontSize: 16 }} />
                   <Typography variant="caption" fontWeight={500}>
                      Safe and Secure Payments.
                   </Typography>
                </Box>

              </Paper>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
};

export default Cart;