import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const CategoryBar = ({ isHome = false }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // === FETCH CATEGORIES FROM DB ===
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/categories');
        const data = await res.json();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load categories", err);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
        </Box>
      );
  }

  return (
    <Box sx={{ 
      bgcolor: 'white', 
      py: 2, 
      display: 'flex', 
      justifyContent: 'center', 
      gap: isHome ? 4 : 4, // Adjust spacing based on page
      overflowX: 'auto', 
      borderBottom: '1px solid #f0f0f0',
      marginBottom: isHome ? 2 : 0,
      boxShadow: isHome ? '0 1px 1px 0 rgba(0,0,0,.16)' : 'none'
    }}>
      {categories.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No categories found</Typography>
      ) : (
          categories.map((cat, index) => (
            <Box 
              key={cat._id || index}
              onClick={() => navigate('/products', { state: { category: cat.name } })}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                cursor: 'pointer',
                minWidth: '80px',
                transition: '0.3s',
                '&:hover': { transform: 'translateY(-5px)', color: '#00796b' }
              }}
            >
              {/* Only show Image if we are on the Home Page */}
              {isHome && (
                <Box 
                  component="img" 
                  // Use icon from DB or a fallback image if missing
                  src={cat.icon || "https://via.placeholder.com/64?text=No+Img"} 
                  alt={cat.name}
                  sx={{ width: 64, height: 64, objectFit: 'contain', mb: 1 }} 
                />
              )}
              
              <Typography 
                variant={isHome ? "body2" : "body2"} 
                sx={{ fontWeight: 600, fontSize: '14px', color: '#333', textTransform: 'capitalize' }}
              >
                {cat.name}
              </Typography>
            </Box>
          ))
      )}
    </Box>
  );
};

export default CategoryBar;