import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Button, CircularProgress, IconButton, Grid, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CategoryBar from '../components/CategoryBar'; 

// === BANNER DATA ===
const bannerImages = [
  "/banner.png",   // Your existing banner
  "/banner1.png",   // Placeholder
  "/banner2.png"    // Placeholder
];

// === CAROUSEL COMPONENT (Unchanged) ===
const BannerCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000); 
    return () => clearInterval(interval); 
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === bannerImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      maxWidth: '1100px', 
      mx: 'auto', 
      mt: 2, 
      overflow: 'hidden',
      borderRadius: '10px', 
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        transform: `translateX(-${currentIndex * 100}%)`, 
        transition: 'transform 0.5s ease-in-out' 
      }}>
        {bannerImages.map((src, index) => (
          <Box 
            key={index} 
            component="img"
            src={src}
            alt={`Banner ${index + 1}`}
            sx={{ 
              width: '100%', 
              flexShrink: 0, 
              objectFit: 'cover',
              maxHeight: { xs: '180px', sm: '250px', md: '350px' } 
            }}
          />
        ))}
      </Box>

      {/* LEFT ARROW */}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, display: 'flex', alignItems: 'center', px: 1 }}>
        <IconButton 
          onClick={handlePrev}
          sx={{ 
            bgcolor: 'white', height: '80px', width: '40px', borderRadius: '0 4px 4px 0', 
            boxShadow: '2px 0 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f0f0f0' } 
          }}
        >
          <ArrowBackIosNewIcon sx={{ fontSize: '18px', color: '#333' }} />
        </IconButton>
      </Box>

      {/* RIGHT ARROW */}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', px: 1 }}>
        <IconButton 
          onClick={handleNext}
          sx={{ 
            bgcolor: 'white', height: '80px', width: '40px', borderRadius: '4px 0 0 4px', 
            boxShadow: '-2px 0 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f0f0f0' } 
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: '18px', color: '#333' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

// === PRO CATEGORY ROW COMPONENT (Unchanged) ===
const CategorySection = ({ title, apiCategory }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/products?category=${apiCategory}`)
      .then(res => res.json())
      .then(data => {
        const displayData = data.length < 5 ? [...data, ...data] : data;
        setProducts(displayData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [apiCategory]);

  const handleViewAll = () => {
    navigate('/products', { state: { category: apiCategory } });
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} sx={{ color: '#00796b' }} /></Box>;
  if (products.length === 0) return null;

  return (
    <Box sx={{ margin: '30px 0', padding: '0 10px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>{title}</Typography>
        <Button 
          endIcon={<ArrowForwardIcon />} 
          onClick={handleViewAll}
          sx={{ color: '#2874f0', fontWeight: 'bold', textTransform: 'none', fontSize: '1rem' }}
        >
          View All
        </Button>
      </Box>
      <Box sx={{ 
        display: 'flex', overflowX: 'auto', gap: 2.5, padding: '10px 5px 20px 5px', 
        scrollBehavior: 'smooth', '&::-webkit-scrollbar': { display: 'none' },
        '-ms-overflow-style': 'none', 'scrollbar-width': 'none',
      }}>
        {products.map((product, index) => (
          <Card 
            key={`${product._id}-${index}`} 
            onClick={() => navigate(`/product/${product._id}`, { state: { product: product } })}
            sx={{ 
              minWidth: 220, maxWidth: 220, borderRadius: '12px', border: '1px solid #f0f0f0',
              boxShadow: 'none', cursor: 'pointer', flexShrink: 0, transition: 'all 0.3s ease',
              backgroundColor: '#fff', position: 'relative',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)', borderColor: 'transparent' }
            }}
          >
            <Box sx={{ height: 180, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <CardMedia component="img" image={product.image} alt={product.title} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </Box>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: '#212121', mb: 0.5 }}>{product.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.price.toLocaleString('en-IN')}</Typography>
                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: '#878787' }}>₹{Math.round(product.price * 1.25).toLocaleString('en-IN')}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#388e3c', fontWeight: 700, mt: 0.5, display: 'block' }}>20% Off • Free Delivery</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

// === MAIN HOME PAGE (Updated with Search Logic) ===
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current URL query params

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // === SEARCH EFFECT ===
  useEffect(() => {
    // 1. Get the search query from URL (e.g., ?search=iphone)
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');

    if (searchQuery) {
      setIsSearching(true);
      setLoadingSearch(true);
      
      // 2. Fetch results from backend
      fetch(`http://localhost:5000/api/products?search=${searchQuery}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data);
          setLoadingSearch(false);
        })
        .catch(err => {
          console.error("Search Error:", err);
          setLoadingSearch(false);
        });
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [location.search]); // Re-run whenever the URL changes

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 4 }}>
      <CategoryBar isHome={true} />
      
      {/* CONDITIONAL RENDERING: Search Results OR Default Home */}
      {isSearching ? (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Search Results {searchResults.length > 0 && `(${searchResults.length} items)`}
          </Typography>

          {loadingSearch ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
          ) : searchResults.length === 0 ? (
             <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h6" color="text.secondary">No products found matching your search.</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Go Back Home</Button>
             </Box>
          ) : (
            <Grid container spacing={3}>
              {searchResults.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card 
                    onClick={() => navigate(`/product/${product._id}`, { state: { product: product } })}
                    sx={{ 
                      borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: 'none', 
                      cursor: 'pointer', transition: 'all 0.3s ease',
                      '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }
                    }}
                  >
                    <Box sx={{ height: 200, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CardMedia component="img" image={product.image} alt={product.title} sx={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    </Box>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>{product.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{product.price.toLocaleString('en-IN')}</Typography>
                        <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'gray' }}>₹{Math.round(product.price * 1.2).toLocaleString('en-IN')}</Typography>
                        <Typography variant="caption" sx={{ color: 'green', fontWeight: 'bold' }}>20% off</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      ) : (
        /* === DEFAULT HOME LAYOUT === */
        <>
          <BannerCarousel />
          <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
            <CategorySection title="Best of Electronics" apiCategory="electronics" />
            <CategorySection title="Fashion Top Picks" apiCategory="fashion" />
            <CategorySection title="Latest Mobiles" apiCategory="mobiles" />
            <CategorySection title="Jewellery Collection" apiCategory="jewelry" />
            <CategorySection title="Home Appliances" apiCategory="appliances" />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Home;