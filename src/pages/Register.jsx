import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  
  // State for form inputs
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Handle typing in fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Register Button Click
  const handleRegister = async () => {
    setError(''); // Clear previous errors

    try {
      // === FIX: Updated URL to match server.js ('/api/users') ===
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // === SUCCESS ===
        // Navigate to Home ('/') and send a signal to open the Login Dialog
        navigate('/', { 
          state: { 
            openLogin: true, 
            message: "Registration Successful! Please Login." 
          } 
        }); 
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Is the backend running?");
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Create Account</Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField 
          fullWidth label="Full Name" name="name" margin="normal" 
          value={formData.name} onChange={handleChange} 
        />
        <TextField 
          fullWidth label="Email" name="email" margin="normal" 
          value={formData.email} onChange={handleChange} 
        />
        <TextField 
          fullWidth label="Password" name="password" type="password" margin="normal" 
          value={formData.password} onChange={handleChange} 
        />

        <Button 
          fullWidth variant="contained" 
          sx={{ mt: 3, mb: 2, bgcolor: '#fb641b', fontWeight: 'bold' }}
          onClick={handleRegister}
        >
          Register
        </Button>

        {/* Clicking this navigates home and opens the login dialog via the updated Navbar logic */}
        <Typography 
            variant="body2" 
            sx={{ cursor: 'pointer', color: '#2874f0' }} 
            onClick={() => navigate('/', { state: { openLogin: true } })}
        >
          Existing User? Log in
        </Typography>
      </Paper>
    </Container>
  );
};

export default Register;