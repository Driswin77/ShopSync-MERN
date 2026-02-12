import React, { useState, useEffect } from "react";
import { 
  Box, Typography, TextField, Button, Grid, Avatar, Paper, 
  CircularProgress, Snackbar, Alert, Divider, MenuItem, Container 
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';

function UserProfile() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "male"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // === 1. LOAD DATA ===
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const nameParts = data.name ? data.name.split(' ') : ["User", ""];
          setUser({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(' ') || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            dateOfBirth: data.dateOfBirth || "",
            gender: data.gender || "male"
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // === 2. SAVE DATA ===
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user) 
      });

      if (res.ok) {
        setIsEditing(false);
        setToast({ open: true, msg: "Profile updated successfully!", severity: "success" });
        localStorage.setItem('userName', user.firstName);
      } else {
        setToast({ open: true, msg: "Failed to update profile", severity: "error" });
      }
    } catch (err) {
      setToast({ open: true, msg: "Server Error", severity: "error" });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Optional: You could re-fetch data here to reset changes
  };

  const getInitials = () => {
    return `${user.firstName.charAt(0) || ''}${user.lastName.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress sx={{ color: '#00796b' }} />
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '90vh', py: 5 }}>
      <Container maxWidth="md">
        
        {/* TOAST NOTIFICATION */}
        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open:false})} anchorOrigin={{vertical:'bottom', horizontal:'center'}}>
          <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: 2 }}>{toast.msg}</Alert>
        </Snackbar>

        <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121' }}>My Profile</Typography>
            <Typography variant="body2" color="text.secondary">Manage your personal information and delivery details</Typography>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: '16px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          
          {/* === HEADER BANNER === */}
          <Box sx={{ 
            background: 'linear-gradient(135deg, #00796b 0%, #004d40 100%)', 
            height: '140px', 
            position: 'relative' 
          }} />

          {/* === AVATAR SECTION === */}
          <Box sx={{ px: 4, display: 'flex', alignItems: 'flex-end', mt: -6, mb: 3 }}>
            <Avatar sx={{ 
                width: 120, height: 120, 
                border: '5px solid white', 
                bgcolor: '#fb641b', 
                fontSize: '3rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              {getInitials() || <PersonIcon sx={{ fontSize: 60 }} />}
            </Avatar>
            <Box sx={{ ml: 3, mb: 1.5, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="h5" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">ShopSync Member</Typography>
            </Box>
            
            {/* ACTION BUTTONS (DESKTOP) */}
            <Box sx={{ ml: 'auto', mb: 2, display: { xs: 'none', sm: 'block' } }}>
               {!isEditing ? (
                 <Button 
                   variant="contained" 
                   startIcon={<EditIcon />} 
                   onClick={() => setIsEditing(true)}
                   sx={{ bgcolor: '#00796b', '&:hover': { bgcolor: '#004d40' }, borderRadius: 20, px: 3 }}
                 >
                   Edit Profile
                 </Button>
               ) : (
                 <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} color="error" sx={{ borderRadius: 20 }}>
                        Cancel
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ bgcolor: '#fb641b', '&:hover': { bgcolor: '#e05c1f' }, borderRadius: 20 }}>
                        Save
                    </Button>
                 </Box>
               )}
            </Box>
          </Box>

          <Divider />

          {/* === FORM SECTION === */}
          <Box sx={{ p: 4 }}>
            <Grid container spacing={3}>
                
                {/* Personal Information */}
                <Grid item xs={12}><Typography variant="h6" sx={{ fontWeight: 600, color: '#444' }}>Personal Information</Typography></Grid>

                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="First Name" name="firstName" 
                        value={user.firstName} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Last Name" name="lastName" 
                        value={user.lastName} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Email Address" name="email" 
                        value={user.email} disabled={true} variant="filled"
                        helperText="Email cannot be changed"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Phone Number" name="phone" 
                        value={user.phone} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth select label="Gender" name="gender" 
                        value={user.gender} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                    >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField 
                        fullWidth label="Date of Birth" name="dateOfBirth" type="date"
                        value={user.dateOfBirth} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                {/* Address Section */}
                <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="h6" sx={{ fontWeight: 600, color: '#444' }}>Address Details</Typography></Grid>
                
                <Grid item xs={12}>
                    <TextField 
                        fullWidth multiline rows={3} label="Delivery Address" name="address" 
                        value={user.address} onChange={handleChange} 
                        disabled={!isEditing} variant="outlined"
                        placeholder="Enter your full delivery address..."
                    />
                </Grid>

                {/* MOBILE ACTION BUTTONS */}
                <Grid item xs={12} sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', gap: 2, mt: 2 }}>
                    {!isEditing ? (
                        <Button fullWidth variant="contained" onClick={() => setIsEditing(true)} sx={{ bgcolor: '#00796b' }}>Edit Profile</Button>
                    ) : (
                        <>
                            <Button fullWidth variant="outlined" color="error" onClick={handleCancel}>Cancel</Button>
                            <Button fullWidth variant="contained" onClick={handleSave} sx={{ bgcolor: '#fb641b' }}>Save</Button>
                        </>
                    )}
                </Grid>

            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default UserProfile;