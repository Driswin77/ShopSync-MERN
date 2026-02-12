import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Grid, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Radio,
  RadioGroup, FormControlLabel, Chip, Paper, CircularProgress, Snackbar, Alert
} from "@mui/material";
import {
  Add, Edit, Delete, LocationOn, Home, Work, Star, CheckCircle,
} from "@mui/icons-material";


function Addresses() {
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  
  // Real Data State
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  const [newAddress, setNewAddress] = useState({
    name: "", phone: "", address: "", city: "", state: "", pincode: "",
    type: "home", landmark: "", isDefault: false
  });

  // === 1. FETCH ADDRESSES ===
  const fetchAddresses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleOpenDialog = (address = null) => {
    if (address) {
      setEditMode(true);
      setCurrentAddress(address);
      setNewAddress(address);
    } else {
      setEditMode(false);
      setCurrentAddress(null);
      setNewAddress({
        name: "", phone: "", address: "", city: "", state: "", pincode: "",
        type: "home", landmark: "", isDefault: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // === 2. SAVE (ADD OR UPDATE) ===
  const handleSaveAddress = async () => {
    const token = localStorage.getItem('token');
    const url = editMode 
      ? `http://localhost:5000/api/addresses/${currentAddress._id}`
      : `http://localhost:5000/api/addresses`;
    
    const method = editMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (res.ok) {
        setToast({ open: true, msg: editMode ? "Address updated!" : "Address added!", severity: "success" });
        fetchAddresses(); // Refresh list
        handleCloseDialog();
      } else {
        setToast({ open: true, msg: "Failed to save address", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, msg: "Server error", severity: "error" });
    }
  };

  // === 3. DELETE ADDRESS ===
  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:5000/api/addresses/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setToast({ open: true, msg: "Address deleted", severity: "success" });
          fetchAddresses();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // === 4. SET DEFAULT ===
  const handleSetDefault = async (id) => {
    const token = localStorage.getItem('token');
    try {
      // Update specific address to be default
      const res = await fetch(`http://localhost:5000/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isDefault: true })
      });
      if (res.ok) {
        fetchAddresses(); // Refresh to update UI
        setToast({ open: true, msg: "Default address set!", severity: "success" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAddressTypeIcon = (type) => {
    switch (type) {
      case "home": return <Home />;
      case "work": return <Work />;
      default: return <LocationOn />;
    }
  };

  const getAddressTypeColor = (type) => {
    switch (type) {
      case "home": return "#4caf50";
      case "work": return "#2196f3";
      default: return "#9c27b0";
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="addresses-page" sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open:false})} anchorOrigin={{vertical:'bottom', horizontal:'center'}}>
        <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
      </Snackbar>

      {/* Header */}
      <Box className="addresses-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>My Addresses</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>Manage your delivery addresses</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mt: 2 }}>
          Add New Address
        </Button>
      </Box>

      {/* Address Cards */}
      <Grid container spacing={3} className="addresses-grid">
        {addresses.length === 0 ? (
          <Grid item xs={12}><Typography align="center" color="text.secondary">No addresses found. Add one now!</Typography></Grid>
        ) : (
          addresses.map((address) => (
            <Grid item xs={12} md={6} lg={4} key={address._id}>
              <Card className="address-card">
                <CardContent>
                  {/* Address Header */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ color: getAddressTypeColor(address.type), display: "flex", alignItems: "center" }}>
                        {getAddressTypeIcon(address.type)}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {address.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : 'Home'}
                      </Typography>
                      {address.isDefault && (
                        <Chip icon={<Star />} label="Default" size="small" color="primary" sx={{ ml: 1 }} />
                      )}
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenDialog(address)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteAddress(address._id)} sx={{ ml: 1 }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Address Details */}
                  <Typography variant="body1" gutterBottom fontWeight="medium">{address.name}</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {address.address}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                    <br />
                    Landmark: {address.landmark || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Phone: {address.phone}</Typography>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    {!address.isDefault && (
                      <Button size="small" variant="outlined" onClick={() => handleSetDefault(address._id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button size="small" variant="contained">Deliver Here</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add/Edit Address Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Address" : "Add New Address"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Landmark" value={newAddress.landmark} onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })} size="small" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>Address Type</Typography>
              <RadioGroup row value={newAddress.type} onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}>
                <FormControlLabel value="home" control={<Radio />} label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Home fontSize="small" /> Home</Box>} />
                <FormControlLabel value="work" control={<Radio />} label={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Work fontSize="small" /> Work</Box>} />
              </RadioGroup>
            </Grid>
            <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Radio 
                      checked={newAddress.isDefault} 
                      onClick={() => setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })}
                    />
                  } 
                  label="Make this my default address" 
                />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAddress} disabled={!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode}>
            {editMode ? "Update Address" : "Save Address"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default Addresses;