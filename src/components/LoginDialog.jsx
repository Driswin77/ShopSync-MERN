import React, { useState } from 'react';
import { 
  Dialog, DialogContent, TextField, Button, Typography, Box, IconButton, Alert, CircularProgress 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const LoginDialog = ({ open, handleClose, setUser }) => { 
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    // This route must now handle searching both Admins and Users collections sequentially
    const url = 'http://localhost:5000/api/users/login';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // The backend should return data.isAdmin after checking the Admin collection first
        if (data.isAdmin || (data.user && data.user.isAdmin)) {
            // ADMIN SUCCESS: Save Admin Token specifically for the Dashboard
            localStorage.setItem("adminToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user || data));
            handleClose();
            navigate("/admin"); // Redirect to Admin Dashboard
        } else {
            // USER SUCCESS: Standard login for regular customers
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.name || (data.user && data.user.name));
            localStorage.setItem('user', JSON.stringify(data.user || data)); 

            setUser(data.user || data); 
            handleClose();
        }
        
        // Reload to update global state and Navbar links
        window.location.reload(); 

      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    handleClose();
    navigate('/register');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </Box>

      <DialogContent sx={{ padding: '0 40px 40px', textAlign: 'center' }}>
        
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2874f0', mb: 1 }}>
            Login
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Get access to your Orders, Wishlist and Recommendations
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, fontSize: '12px' }}>{error}</Alert>}

        <TextField
          fullWidth label="Enter Email" variant="standard" margin="normal"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          fullWidth label="Enter Password" type="password" variant="standard" margin="normal"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />

        <Button 
          fullWidth variant="contained" onClick={handleLogin} disabled={loading}
          sx={{ 
            backgroundColor: '#fb641b', 
            mt: 4, height: 48, fontWeight: 'bold', fontSize: '16px', textTransform: 'none',
            '&:hover': { backgroundColor: '#e05c1f' }
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Login"}
        </Button>

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" component="span" sx={{ color: '#2874f0', cursor: 'pointer', fontWeight: 600 }} onClick={handleRegisterClick}>
              New to ShopSync? Create an account
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;