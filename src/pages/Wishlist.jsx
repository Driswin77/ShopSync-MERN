import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, CardMedia, Button, Grid, IconButton,
  Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Rating, Alert, Snackbar, CircularProgress
} from "@mui/material";
import {
  Delete, ShoppingCart, Share, LocalOffer, FlashOn, FavoriteBorder
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Share Dialog State
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const { addToCart } = useCart(); // Assuming you have this context

  // === 1. FETCH WISHLIST FROM DB ===
  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setWishlist(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // === 2. REMOVE ITEM ===
  const handleRemoveFromWishlist = async (id) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/wishlist/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            setWishlist(wishlist.filter((item) => item._id !== id));
            showSnackbar("Item removed from wishlist", "info");
        }
    } catch (err) {
        showSnackbar("Failed to remove item", "error");
    }
  };

  // === 3. MOVE TO CART ===
  const handleMoveToCart = (product) => {
    addToCart(product);
    handleRemoveFromWishlist(product._id);
    showSnackbar(`${product.title} moved to cart`, "success");
  };

  const handleShareProduct = (product) => {
    setSelectedProduct(product);
    setOpenShareDialog(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://shopsync.com/product/${selectedProduct._id}`);
    showSnackbar("Link copied to clipboard!", "success");
    setOpenShareDialog(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const totalSavings = wishlist.reduce((sum, item) => {
    // Assuming backend product has 'price' and maybe 'originalPrice' field?
    // If not, we default to 0 savings
    const original = item.originalPrice || (item.price * 1.1); // Fake original if missing
    return sum + (original - item.price);
  }, 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="wishlist-page" sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box className="wishlist-header" sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Wishlist ({wishlist.length} items)
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Save items you love for later
        </Typography>
        
        {wishlist.length > 0 && (
          <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip
              icon={<LocalOffer />}
              label={`Total Value: ₹${wishlist.reduce((acc, item) => acc + item.price, 0).toLocaleString()}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<FlashOn />}
              label={`${wishlist.length} items found`}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Wishlist Items */}
      {wishlist.length === 0 ? (
        <Card className="empty-wishlist-card" sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <FavoriteBorder sx={{ fontSize: 60, color: "#ddd", mb: 2 }} />
            <Typography variant="h6" gutterBottom>Your wishlist is empty</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Save items you like by clicking the heart icon on products
            </Typography>
            <Button variant="contained" sx={{ mt: 2 }} href="/">Continue Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} className="wishlist-grid">
          {wishlist.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card className="wishlist-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Product Image */}
                <Box className="product-image-container" sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.title}
                    sx={{ objectFit: 'contain', p: 2 }}
                  />
                  <IconButton
                    sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }}
                    onClick={() => handleRemoveFromWishlist(product._id)}
                  >
                    <Delete color="error" />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                    {product.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={product.rating || 0} precision={0.5} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({product.numReviews || 0})
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{product.price.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleMoveToCart(product)}
                        size="small"
                      >
                        Add
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Share />}
                        onClick={() => handleShareProduct(product)}
                        size="small"
                      >
                        Share
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Share Dialog */}
      <Dialog open={openShareDialog} onClose={() => setOpenShareDialog(false)} maxWidth="sm">
        <DialogTitle>Share Product</DialogTitle>
        <DialogContent dividers>
          {selectedProduct && (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <img src={selectedProduct.image} alt={selectedProduct.title} style={{ width: 80, height: 80, objectFit: 'contain' }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{selectedProduct.title}</Typography>
                  <Typography variant="h6" color="primary">₹{selectedProduct.price.toLocaleString()}</Typography>
                </Box>
              </Box>
              <TextField
                fullWidth
                label="Share Link"
                value={`https://shopsync.com/product/${selectedProduct._id}`}
                InputProps={{ readOnly: true }}
                size="small"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenShareDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyLink}>Copy Link</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Wishlist;