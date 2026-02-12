import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Card, CardContent, Button, Radio, RadioGroup, 
  FormControlLabel, Divider, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Select, IconButton 
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get products passed from Cart or Buy Now button
  const checkoutItems = location.state?.products || [];
  
  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'home'
  });

  // Calculate Total
  const totalAmount = checkoutItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

  // === 1. FETCH ADDRESSES FROM DB ===
  const fetchAddresses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAddresses(data);
      // Auto-select default or first address
      if (data.length > 0) {
        const defaultAddr = data.find(a => a.isDefault) || data[0];
        setSelectedAddressId(defaultAddr._id);
      }
    } catch (err) {
      console.error("Error fetching addresses", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // === 2. SAVE NEW ADDRESS TO DB ===
  const handleSaveAddress = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });
      
      if (res.ok) {
        setOpenAddressDialog(false);
        fetchAddresses(); // Refresh list
        setNewAddress({ name: '', phone: '', address: '', city: '', state: '', pincode: '', type: 'home' });
      }
    } catch (err) {
      console.error("Error saving address", err);
    }
  };

  // === 3. PROCEED TO PAYMENT ===
  const handleProceedToPayment = () => {
    if (!selectedAddressId) return alert("Please select a delivery address");
    
    const shippingAddress = addresses.find(a => a._id === selectedAddressId);
    
    navigate('/payment', { 
      state: { 
        products: checkoutItems,
        shippingAddress: shippingAddress,
        totalAmount: totalAmount
      } 
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto', minHeight: '80vh' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Checkout</Typography>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: ADDRESS & PRODUCTS */}
        <Grid item xs={12} md={8}>
          
          {/* ADDRESS SECTION */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Delivery Address</Typography>
                <Button startIcon={<AddIcon />} onClick={() => setOpenAddressDialog(true)}>Add New Address</Button>
              </Box>

              {addresses.length === 0 ? (
                <Typography color="text.secondary">No addresses found. Please add one.</Typography>
              ) : (
                <RadioGroup value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
                  {addresses.map((addr) => (
                    <FormControlLabel
                      key={addr._id}
                      value={addr._id}
                      control={<Radio />}
                      label={
                        <Box sx={{ ml: 1 }}>
                          <Typography fontWeight="bold">{addr.name} <span style={{fontSize:'12px', color:'gray', border:'1px solid #ccc', padding:'2px 6px', borderRadius:'4px'}}>{addr.type}</span></Typography>
                          <Typography variant="body2">{addr.address}, {addr.city} - {addr.pincode}</Typography>
                          <Typography variant="body2">Phone: {addr.phone}</Typography>
                        </Box>
                      }
                      sx={{ mb: 2, alignItems: 'flex-start' }}
                    />
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* PRODUCT REVIEW SECTION */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Order Items</Typography>
              {checkoutItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2, borderBottom: '1px solid #eee', pb: 2 }}>
                  <img src={item.image} alt={item.title} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                  <Box sx={{ ml: 2 }}>
                    <Typography fontWeight="bold">{item.title}</Typography>
                    <Typography color="text.secondary">Quantity: {item.quantity || 1}</Typography>
                    <Typography variant="h6" color="primary">₹{item.price}</Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN: PRICE DETAILS */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: 'gray' }}>PRICE DETAILS</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Price ({checkoutItems.length} items)</Typography>
                <Typography>₹{totalAmount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Delivery Charges</Typography>
                <Typography color="success.main">FREE</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Total Payable</Typography>
                <Typography variant="h6" fontWeight="bold">₹{totalAmount}</Typography>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={handleProceedToPayment}
                sx={{ bgcolor: '#fb641b', '&:hover': { bgcolor: '#e05c1f' } }}
              >
                CONTINUE TO PAYMENT
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ADD ADDRESS DIALOG */}
      <Dialog open={openAddressDialog} onClose={() => setOpenAddressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
           {/* Form Fields same as Address Page */}
           <TextField fullWidth label="Name" margin="dense" value={newAddress.name} onChange={(e)=>setNewAddress({...newAddress, name:e.target.value})} />
           <TextField fullWidth label="Phone" margin="dense" value={newAddress.phone} onChange={(e)=>setNewAddress({...newAddress, phone:e.target.value})} />
           <TextField fullWidth label="Address (Area and Street)" margin="dense" value={newAddress.address} onChange={(e)=>setNewAddress({...newAddress, address:e.target.value})} />
           <TextField fullWidth label="City" margin="dense" value={newAddress.city} onChange={(e)=>setNewAddress({...newAddress, city:e.target.value})} />
           <TextField fullWidth label="State" margin="dense" value={newAddress.state} onChange={(e)=>setNewAddress({...newAddress, state:e.target.value})} />
           <TextField fullWidth label="Pincode" margin="dense" value={newAddress.pincode} onChange={(e)=>setNewAddress({...newAddress, pincode:e.target.value})} />
           
           <Typography variant="subtitle2" sx={{ mt: 2 }}>Address Type</Typography>
           <RadioGroup row value={newAddress.type} onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}>
             <FormControlLabel value="home" control={<Radio />} label="Home" />
             <FormControlLabel value="work" control={<Radio />} label="Work" />
           </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddressDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAddress}>Save Address</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Checkout;