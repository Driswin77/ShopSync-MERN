import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Grid, Typography, Button, Rating, Divider, 
  Table, TableBody, TableCell, TableContainer, TableRow, Chip, Paper,
  TextField, InputAdornment, CircularProgress, Avatar, Stack, 
  Snackbar, Alert, IconButton 
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocationOnIcon from '@mui/icons-material/LocationOn'; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; 
import FavoriteIcon from '@mui/icons-material/Favorite'; 
import LoginDialog from '../components/LoginDialog'; 
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { state } = useLocation();
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Use product from state if available, otherwise null (we will fetch it)
  const [product, setProduct] = useState(state?.product || null); 
  const [reviews, setReviews] = useState([]); 
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Wishlist State
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Pincode State
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [checking, setChecking] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  // === IMAGE UPLOAD STATES ===
  const [reviewImage, setReviewImage] = useState(null); // Stores the Base64 string for DB
  const [reviewImagePreview, setReviewImagePreview] = useState(null); // Stores URL for UI preview
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Popup State
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' });

  const showToast = (msg, severity = 'success') => {
    setToast({ open: true, msg, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // === HELPER: Get Real User Name ===
  const getRealUserName = () => {
    const name = localStorage.getItem('userName');
    if (name && name !== 'undefined' && name !== 'null') return name;

    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const userObj = JSON.parse(userStr);
            if (userObj.name) return userObj.name;
        } catch (e) {
            console.log("Error parsing user object", e);
        }
    }
    return null; 
  };

  // === 1. FETCH DATA, REVIEWS & WISHLIST STATUS ===
  useEffect(() => {
    window.scrollTo(0, 0);

    const currentId = product?._id || id;
    const token = localStorage.getItem('token');

    if (currentId) {
      setLoadingReviews(true);

      // Fetch Product & Reviews
      fetch(`http://localhost:5000/api/products/${currentId}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data);
          setReviews(data.reviews || []); 
          setLoadingReviews(false);
        })
        .catch((err) => {
          console.error("Failed to load data", err);
          setLoadingReviews(false);
        });

      // Fetch Wishlist Status (If Logged In)
      if (token) {
        fetch('http://localhost:5000/api/wishlist', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            // Check if this product ID is in the user's wishlist
            const exists = data.some(p => p._id === currentId);
            setIsInWishlist(exists);
        })
        .catch(err => console.error("Error fetching wishlist", err));
      }
    }
  }, [id]); 

  // === WISHLIST TOGGLE LOGIC ===
  const handleWishlistToggle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast("Please login to use Wishlist", "warning");
        setIsLoginOpen(true);
        return;
    }

    const currentId = product?._id || id;

    try {
        if (isInWishlist) {
            // Remove
            await fetch(`http://localhost:5000/api/wishlist/remove/${currentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsInWishlist(false);
            showToast("Removed from Wishlist", "info");
        } else {
            // Add
            await fetch('http://localhost:5000/api/wishlist/add', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ productId: currentId })
            });
            setIsInWishlist(true);
            showToast("Added to Wishlist", "success");
        }
    } catch (err) {
        console.error(err);
        showToast("Error updating wishlist", "error");
    }
  };

  // === DELIVERY CHECKER ===
  const checkDelivery = () => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      setIsError(true);
      setDeliveryMsg('Please enter a valid 6-digit Pincode');
      return;
    }
    setChecking(true);
    setDeliveryMsg('');
    setTimeout(() => {
      setIsError(false);
      const firstDigit = parseInt(pincode.toString()[0]);
      const days = (firstDigit === 6) ? 2 : (firstDigit === 5) ? 3 : 5;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      const formattedDate = deliveryDate.toLocaleDateString('en-US', options);
      setDeliveryMsg(`Delivery by ${formattedDate} | Free`);
      setChecking(false);
    }, 800);
  };

  // === HANDLE IMAGE UPLOAD (Convert to Base64) ===
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Create a preview URL for the UI
      setReviewImagePreview(URL.createObjectURL(file));

      // 2. Convert file to Base64 String for Database Storage
      const reader = new FileReader();
      reader.onloadend = () => {
          setReviewImage(reader.result); // This string goes to MongoDB
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
      setReviewImage(null);
      setReviewImagePreview(null);
  }

  // === BUY NOW LOGIC ===
  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    
    // 1. Check if user is logged in
    if (!token) {
        setIsLoginOpen(true); // Open Login Popup
        return;
    }

    // 2. Redirect to Checkout with THIS product directly
    navigate('/checkout', { 
        state: { 
            products: [{ ...product, quantity: 1 }] 
        } 
    });
  };

  // === 2. SUBMIT REVIEW LOGIC ===
  const handleSubmitReview = async () => {
    const token = localStorage.getItem('token'); 
    let userName = getRealUserName();
    
    if (!token) {
      console.log("No token found. Opening Login Dialog.");
      setIsLoginOpen(true);
      return;
    }

    if (!userName) userName = "ShopSync User";

    if (userRating === 0) {
        showToast("Please select a star rating!", "warning");
        return;
    }

    try {
      // Send the Review + Image to the Backend
      const res = await fetch(`http://localhost:5000/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          comment: reviewText,
          name: userName,
          image: reviewImage // Sending Base64 image string to DB
        }),
      });

      if (res.ok) {
        const newReview = {
            _id: Date.now(),
            userName: userName,
            rating: userRating,
            comment: reviewText,
            image: reviewImage, // Display immediately
            createdAt: new Date().toISOString()
        };
        
        setReviews([newReview, ...reviews]); 
        setReviewText('');
        setUserRating(0);
        clearImage(); // Clear image state
        
        showToast("Review Submitted Successfully!", "success");
      } else {
        const errorData = await res.json();
        showToast(errorData.message || "Failed to save review.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Server Error. Check your backend.", "error");
    }
  };

  if (!product) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  // === SMART SPECS RENDERER ===
  const renderSpecs = () => {
    const cat = product.category ? product.category.toLowerCase() : '';

    if (cat.includes('mobile') || cat.includes('electronic') || cat.includes('appliance') || product.ram) {
      return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2, mt: 2 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ color: '#666', fontWeight: 600, width: '30%', borderBottom: '1px solid #f0f0f0' }}>Brand</TableCell>
                <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>{product.brand || 'Generic'}</TableCell>
              </TableRow>
              {product.ram && (
                <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: '1px solid #f0f0f0' }}>RAM</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #f0f0f0' }}>{product.ram}</TableCell>
                </TableRow>
              )}
               <TableRow>
                  <TableCell sx={{ color: '#666', fontWeight: 600, borderBottom: 'none' }}>Warranty</TableCell>
                  <TableCell sx={{ borderBottom: 'none' }}>1 Year Manufacturer Warranty</TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    if (cat.includes('fashion') || cat.includes('clothing')) {
      return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
           <Typography variant="body2" sx={{ mb: 1, color: '#555' }}><strong>Brand:</strong> {product.brand || 'Generic'}</Typography>
           <Typography variant="body2" sx={{ mb: 1, color: '#555' }}><strong>Size:</strong> {product.size || 'Standard Fit'}</Typography>
           <Divider sx={{ my: 1 }} />
           <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#444' }}>{product.description}</Typography>
        </Box>
      );
    }
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.6 }}>{product.description}</Typography>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#fff', minHeight: '100vh', py: 4, px: { xs: 2, md: 6 } }}>
      
      <LoginDialog open={isLoginOpen} handleClose={() => setIsLoginOpen(false)} />

      {/* === SNACKBAR POPUP COMPONENT === */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>

      <Grid container spacing={6} justifyContent="center">
        
        {/* === LEFT: IMAGE === */}
        <Grid item xs={12} md={5}>
          <Box sx={{ 
            height: '350px', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, p: 4, 
            border: '1px solid #f0f0f0', borderRadius: '12px',
            position: 'relative' // Needed for heart icon
          }}>
            
            {/* --- WISHLIST ICON --- */}
            <IconButton 
                onClick={handleWishlistToggle}
                sx={{ 
                    position: 'absolute', top: 15, right: 15, 
                    bgcolor: 'white', boxShadow: 2, 
                    color: isInWishlist ? '#ff4081' : '#bdbdbd', 
                    '&:hover': { color: '#ff4081', bgcolor: '#fff0f5' } 
                }}
            >
                {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>

            <img 
              src={product.image} 
              alt={product.title} 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" size="large" startIcon={<ShoppingCartIcon />} onClick={() => addToCart(product)} sx={{ flex: 1, py: 1.5, borderColor: '#00796b', color: '#00796b', fontWeight: 600 }}>Add to Cart</Button>
            
            {/* BUY NOW BUTTON */}
            <Button 
                variant="contained" 
                size="large" 
                startIcon={<ShoppingBagIcon />} 
                onClick={handleBuyNow} 
                sx={{ flex: 1, py: 1.5, backgroundColor: '#00796b', fontWeight: 600, '&:hover': { backgroundColor: '#004d40' } }}
            >
                Buy Now
            </Button>
          </Box>
        </Grid>

        {/* === RIGHT: DETAILS === */}
        <Grid item xs={12} md={6}>
          <Chip label={product.category} size="small" sx={{ mb: 1, textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold', color: '#666' }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#212121', mb: 1 }}>{product.title}</Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1, color: '#878787' }}>
               ({reviews.length} Reviews)
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#212121' }}>₹{product.price.toLocaleString('en-IN')}</Typography>
            <Typography variant="body1" sx={{ textDecoration: 'line-through', color: '#878787' }}>₹{Math.round(product.price * 1.2).toLocaleString('en-IN')}</Typography>
            <Typography variant="body2" sx={{ color: '#388e3c', fontWeight: 700 }}>20% OFF</Typography>
          </Box>

          {/* CHECK DELIVERY */}
          <Box sx={{ mb: 4 }}>
             <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: '#666' }} /> Check Delivery
             </Typography>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField 
                  variant="standard" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)}
                  inputProps={{ maxLength: 6 }} sx={{ width: '250px' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={checkDelivery} disabled={checking} sx={{ textTransform: 'none', fontWeight: 'bold', color: '#00796b', minWidth: 'auto' }}>
                          {checking ? <CircularProgress size={16} /> : 'Check'}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
             </Box>
             {deliveryMsg && <Typography variant="body2" sx={{ mt: 1, color: isError ? 'red' : '#212121' }}>{deliveryMsg}</Typography>}
          </Box>

          {/* OFFERS */}
          <Box sx={{ mb: 4 }}>
             <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Available Offers</Typography>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalOfferIcon sx={{ color: '#388e3c', fontSize: 18 }} />
                <Typography variant="body2">Flat ₹200 off on HDFC Bank Credit Cards</Typography>
             </Box>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon sx={{ color: '#388e3c', fontSize: 18 }} />
                <Typography variant="body2">5% Cashback on Axis Bank Card</Typography>
             </Box>
          </Box>

          {/* SPECS */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '18px' }}>Product Details</Typography>
            {renderSpecs()}
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* === REAL REVIEW SECTION === */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Ratings & Reviews</Typography>

            {/* WRITE REVIEW */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>Write a Review</Typography>
              <Rating value={userRating} onChange={(e, val) => setUserRating(val)} size="medium" sx={{ mb: 1 }} />
              <TextField 
                fullWidth placeholder="What did you think?" size="small" variant="outlined" 
                value={reviewText} onChange={(e) => setReviewText(e.target.value)} sx={{ bgcolor: 'white', mb: 1 }} 
              />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                 <Box>
                    <input accept="image/*" style={{ display: 'none' }} id="upload-btn" type="file" onChange={handleImageUpload} />
                    <label htmlFor="upload-btn">
                      <Button component="span" startIcon={<CloudUploadIcon />} size="small" sx={{ color: '#00796b' }}>Add Photo</Button>
                    </label>
                    {/* Display Preview Chip */}
                    {reviewImagePreview && (
                        <Chip 
                            label="Image Added" 
                            onDelete={clearImage} 
                            deleteIcon={<DeleteIcon />} 
                            size="small" 
                            sx={{ ml: 1 }} 
                            avatar={<Avatar src={reviewImagePreview} />}
                        />
                    )}
                 </Box>
                 <Button variant="contained" onClick={handleSubmitReview} size="small" sx={{ bgcolor: '#00796b' }}>Post</Button>
              </Stack>
            </Paper>

            {/* REVIEWS LIST */}
            {loadingReviews ? (
                <CircularProgress size={24} />
            ) : reviews.length === 0 ? (
                <Typography color="text.secondary">No reviews yet. Be the first!</Typography>
            ) : (
                <Stack spacing={3}>
                  {reviews.map((rev) => {
                    const displayName = (rev.userName && rev.userName !== 'undefined' && rev.userName !== 'null') 
                        ? rev.userName 
                        : (rev.name && rev.name !== 'undefined' ? rev.name : "ShopSync User");

                    return (
                        <Box key={rev._id || rev.id}>
                        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                            <Avatar sx={{ display:'flex', width: 24, height: 24, fontSize: 12, bgcolor: '#00796b' }}>
                                {displayName[0]}
                            </Avatar>
                            <Typography variant="subtitle2" fontWeight="bold">
                                {displayName}
                            </Typography>
                            <Rating value={rev.rating} readOnly size="small" />
                        </Stack>
                        
                        <Typography variant="body2" sx={{ display: 'flex', ml: 4, color: '#444' }}>{rev.comment}</Typography>
                        
                        {/* === DISPLAY REVIEW IMAGE IF AVAILABLE === */}
                        {rev.image && (
                            <Box sx={{ ml: 4, mt: 1, maxWidth: '150px' }}>
                                <img src={rev.image} alt="Review attachment" style={{ width: '100%', borderRadius: '4px' }} />
                            </Box>
                        )}
                        
                        <Typography variant="caption" sx={{ display: 'flex',ml: 4, color: '#888', mt: 0.5 }}>
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Just now'}
                        </Typography>
                        </Box>
                    );
                  })}
                </Stack>
            )}
          </Box>

        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetails;