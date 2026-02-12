import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Radio, RadioGroup, FormControlLabel, 
  Button, Divider, CircularProgress, Dialog 
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../context/CartContext'; // Import context to clear cart

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart(); // Optional: Clear cart after order

  // Data from Checkout Page
  const { products, shippingAddress, totalAmount } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // === PLACE ORDER FUNCTION ===
  const handlePlaceOrder = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    const orderData = {
      orderItems: products.map(p => ({
        name: p.title,
        quantity: p.quantity || 1,
        image: p.image,
        price: p.price,
        product: p._id // Ensure this matches your Product ID field
      })),
      shippingAddress: {
        address: shippingAddress.address,
        city: shippingAddress.city,
        postalCode: shippingAddress.pincode,
        country: 'India' // Defaulting for now
      },
      paymentMethod: paymentMethod,
      totalPrice: totalAmount,
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        // === SUCCESS ANIMATION TRIGGER ===
        setOrderSuccess(true);
        
        // Optional: Clear Cart Context here if these items came from cart
        // clearCart(); 

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        alert("Failed to place order");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto', minHeight: '80vh' }}>
      
      {/* SUCCESS POPUP ANIMATION */}
      <Dialog 
        open={orderSuccess} 
        PaperProps={{
          style: { 
            backgroundColor: 'transparent', 
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ 
          bgcolor: 'white', p: 5, borderRadius: 4, textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#333' }}>Order Placed!</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Redirecting to your orders...</Typography>
        </Box>
        <style>{`
          @keyframes popIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </Dialog>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Payment Options</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Select Payment Mode</Typography>
          
          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel 
              value="cod" 
              control={<Radio />} 
              label={<Typography fontWeight="500">Cash on Delivery (COD)</Typography>} 
              sx={{ mb: 1, border: '1px solid #eee', p: 1, borderRadius: 1, width: '100%' }}
            />
            <FormControlLabel 
              value="upi" 
              control={<Radio />} 
              label={<Typography fontWeight="500">UPI (PhonePe, GPay, Paytm)</Typography>} 
              sx={{ mb: 1, border: '1px solid #eee', p: 1, borderRadius: 1, width: '100%' }}
            />
            <FormControlLabel 
              value="card" 
              control={<Radio />} 
              label={<Typography fontWeight="500">Credit / Debit / ATM Card</Typography>} 
              sx={{ mb: 1, border: '1px solid #eee', p: 1, borderRadius: 1, width: '100%' }}
            />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Total Amount to Pay:</Typography>
            <Typography variant="h4" fontWeight="bold" color="primary">₹{totalAmount}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          
          <Button 
            fullWidth 
            variant="contained" 
            size="large" 
            onClick={handlePlaceOrder}
            disabled={loading || orderSuccess}
            sx={{ 
              bgcolor: '#fb641b', height: 50, fontSize: '18px', fontWeight: 'bold',
              '&:hover': { bgcolor: '#e05c1f' } 
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : `PLACE ORDER`}
          </Button>
        </CardContent>
      </Card>

    </Box>
  );
};

export default Payment;