import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, 
  Button, Slider, IconButton, Chip, CircularProgress, Snackbar,
  Checkbox, FormGroup, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Divider
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import { useCart } from '../context/CartContext'; 

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // === STATE FOR DYNAMIC FILTERS ===
  const [filters, setFilters] = useState([]); 
  // Stores selected checkboxes: { Brand: ["Samsung", "Apple"], Color: ["Black"] }
  const [selectedFilters, setSelectedFilters] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart(); 

  // Get active category (defaults to 'mobiles' if accessed directly)
  const activeCategory = (location.state?.category || 'mobiles').toLowerCase();

  useEffect(() => {
    setLoading(true);
    
    // 1. Define Product API URL
    let productUrl = `http://localhost:5000/api/products?category=${activeCategory}`;
    if(activeCategory === 'all') productUrl = `http://localhost:5000/api/products`;

    // 2. Fetch Products
    const fetchProducts = fetch(productUrl).then(res => res.json());

    // 3. Fetch Filters (Dynamic from DB)
    const fetchFilters = fetch(`http://localhost:5000/api/filters/${activeCategory}`).then(res => res.json());

    // 4. Execute both requests in parallel
    Promise.all([fetchProducts, fetchFilters])
      .then(([productData, filterData]) => {
         // Update Products
         setProducts(productData);
         setFilteredProducts(productData);
         
         // Update Filters (Safety check: ensure it's an array)
         setFilters(Array.isArray(filterData) ? filterData : []);
         
         // Reset selected filters when category changes
         setSelectedFilters({});
         
         setLoading(false);
      })
      .catch(err => {
        console.error("Error connecting to backend:", err);
        setLoading(false);
      });

  }, [activeCategory]);

  // === HANDLE FILTER CHANGE ===
  const handleFilterChange = (filterTitle, option) => {
      setSelectedFilters(prev => {
          const currentOptions = prev[filterTitle] || [];
          const newOptions = currentOptions.includes(option)
              ? currentOptions.filter(o => o !== option) // Remove if already checked
              : [...currentOptions, option]; // Add if not checked
          
          // Return new state
          return { ...prev, [filterTitle]: newOptions };
      });
  };

  // === APPLY FILTERS LOGIC ===
  useEffect(() => {
    if (products.length > 0) {
      let result = products;

      // 1. Apply Price Filter
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

      // 2. Apply Dynamic Filters (Brand, Type, etc.)
      // Iterate over each filter category active in the state
      Object.keys(selectedFilters).forEach((key) => {
          const selectedOptions = selectedFilters[key];
          
          if (selectedOptions.length > 0) {
              // Convert Filter Title ("Brand") to match Product Key ("brand")
              const productKey = key.toLowerCase();
              
              result = result.filter(product => {
                  const productValue = product[productKey];

                  // If product doesn't have this feature, exclude it
                  if (!productValue) return false;
                  
                  // Handle Array values (e.g. product has colors: ["Black", "Blue"])
                  if (Array.isArray(productValue)) {
                      return productValue.some(val => selectedOptions.includes(val));
                  } 
                  // Handle String values (e.g. product has brand: "Samsung")
                  else {
                      return selectedOptions.includes(productValue);
                  }
              });
          }
      });

      setFilteredProducts(result);
    }
  }, [priceRange, selectedFilters, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setOpenSnackbar(true);
  };

  // === HELPER TO CALCULATE RATING ===
  const getProductRating = (product) => {
      if (product.reviews && product.reviews.length > 0) {
          const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
          return (total / product.reviews.length).toFixed(1);
      }
      if (typeof product.rating === 'number') return product.rating.toFixed(1);
      if (product.rating && product.rating.rate) return product.rating.rate;
      return 0; 
  };

  const getReviewCount = (product) => {
      if (product.reviews && product.reviews.length > 0) return product.reviews.length;
      if (product.numReviews !== undefined) return product.numReviews;
      if (product.rating && product.rating.count) return product.rating.count;
      return 0; 
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        
        {/* === SIDEBAR (FILTERS) === */}
        <Grid item xs={12} md={3}>
          <Box sx={{ backgroundColor: 'white', padding: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'sticky', top: 90 }}>
            
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>Filters</Typography>
              <Button size="small" onClick={() => { setPriceRange([0, 200000]); setSelectedFilters({}); }} sx={{ color: '#00796b' }}>CLEAR ALL</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {/* Price Slider */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#555' }}>PRICE</Typography>
              <Slider 
                value={priceRange} onChange={(e, val) => setPriceRange(val)} 
                min={0} max={100000} step={1000} valueLabelDisplay="auto" sx={{ color: '#00796b' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Chip label={`₹${priceRange[0]}`} size="small" sx={{ bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 'bold' }} />
                <Typography color="text.secondary" fontSize="12px">to</Typography>
                <Chip label={`₹${priceRange[1]}`} size="small" sx={{ bgcolor: '#e0f2f1', color: '#00796b', fontWeight: 'bold' }} />
              </Box>
            </Box>
            <Divider />

            {/* DYNAMIC FILTERS FROM DB */}
            {filters.length > 0 ? (
                filters.map((filter, index) => (
                  <Accordion key={index} disableGutters elevation={0} defaultExpanded={true} sx={{ '&:before': { display: 'none' } }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px', color: '#444' }}>{filter.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: '0 0 10px 10px' }}>
                      <FormGroup>
                        {filter.options?.map((option) => (
                          <FormControlLabel 
                            key={option} 
                            control={
                                <Checkbox 
                                    size="small" 
                                    sx={{ color: '#bdbdbd', '&.Mui-checked': { color: '#00796b' } }} 
                                    checked={selectedFilters[filter.title]?.includes(option) || false}
                                    onChange={() => handleFilterChange(filter.title, option)}
                                />
                            } 
                            label={<Typography variant="body2" color="text.secondary">{option}</Typography>} 
                          />
                        ))}
                      </FormGroup>
                    </AccordionDetails>
                  </Accordion>
                ))
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>No filters available</Typography>
            )}

          </Box>
        </Grid>

        {/* === PRODUCT LIST === */}
        <Grid item xs={12} md={9}>
          
          {/* Category Header */}
          <Box sx={{ mb: 3 }}>
             <Typography variant="h5" sx={{ fontWeight: 700, color: '#333', textTransform: 'capitalize' }}>
                {activeCategory}
             </Typography>
             <Typography variant="body2" color="text.secondary">{filteredProducts.length} Results Found</Typography>
          </Box>

          {/* Loading State or Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress sx={{ color: '#00796b' }} /></Box>
          ) : (
            <Grid container spacing={3}>
              {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product._id}>
                      <Card 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                          transition: '0.3s', 
                          minHeight: '400px', 
                          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } 
                        }}
                      >
                        <Box 
                          onClick={() => navigate(`/product/${product._id}`, { state: { product: product } })} 
                          sx={{ cursor: 'pointer', position: 'relative', pt: 2, display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                        >
                            <IconButton sx={{ position: 'absolute', top: 5, right: 5, zIndex: 1 }}>
                                <FavoriteBorderIcon sx={{ color: '#bdbdbd', '&:hover':{color: '#ff7043'} }} />
                            </IconButton>
                            
                            <Box sx={{ padding: 3, height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <CardMedia 
                                component="img" 
                                image={product.image} 
                                sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                              />
                            </Box>
                            
                            <CardContent sx={{ flexGrow: 1, padding: '10px 20px' }}>
                              <Typography variant="caption" sx={{ color: '#00796b', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                {product.brand}
                              </Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3, mt: 0.5, mb: 1, height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', color: '#2c3e50' }}>
                                {product.title}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                                   <Box sx={{ bgcolor: '#edf7ed', color: '#1b5e20', px: 0.8, py: 0.2, borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                                     {getProductRating(product)} <StarIcon sx={{ fontSize: '10px', ml: 0.2 }} />
                                   </Box>
                                   <Typography variant="caption" color="text.secondary">({getReviewCount(product)} Reviews)</Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h6" sx={{ fontWeight: '800', color: '#212121' }}>
                                  ₹{product.price.toLocaleString('en-IN')}
                                </Typography>
                              </Box>
                            </CardContent>
                        </Box>
                        
                        <Box sx={{ p: 2, pt: 0, marginTop: 'auto' }}>
                          <Button 
                            variant="contained" 
                            fullWidth 
                            disableElevation 
                            sx={{ backgroundColor: '#00796b', borderRadius: '10px', py: 1, textTransform: 'none', fontSize: '14px', fontWeight: 600, '&:hover': { backgroundColor: '#004d40' } }} 
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                          >
                            Add to Cart
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))
              ) : (
                  <Grid item xs={12}>
                      <Box sx={{ textAlign: 'center', py: 5 }}>
                          <Typography variant="h6" color="text.secondary">No products found in this category.</Typography>
                      </Box>
                  </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} message="Item added to cart" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </Box>
  );
};

export default Products;