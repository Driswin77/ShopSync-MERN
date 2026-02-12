import React, { useEffect, useState } from 'react';
import { 
  Box, Grid, Card, CardContent, Typography, CircularProgress, Container, Button, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip, List, ListItem, ListItemText, Divider, Avatar, MenuItem, Tooltip, InputAdornment
} from '@mui/material';

// --- ICONS ---
import InventoryIcon from '@mui/icons-material/Inventory';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import io from 'socket.io-client'; 

// === ACCEPT 'globalSearch' PROP ===
const AdminDashboard = ({ globalSearch }) => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0); 
  
  // Inventory State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null); 
  const [productHistory, setProductHistory] = useState([]);
  
  // Dialogs
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  
  // Forms & Edit State
  const [isEditing, setIsEditing] = useState(false); 
  const [currentProductId, setCurrentProductId] = useState(null); 
  
  const [newCategory, setNewCategory] = useState({ name: "", icon: "" });
  const [newProduct, setNewProduct] = useState({ title: '', price: '', category: '', image: '', description: '', brand: '' });

  const token = localStorage.getItem('adminToken');

  // === 1. FETCH INITIAL DATA ===
  const fetchData = async () => {
    try {
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
        const statsData = await statsRes.json();
        setStats(statsData);

        const prodRes = await fetch('http://localhost:5000/api/products');
        const prodData = await prodRes.json();
        setProducts(prodData);

        const catRes = await fetch('http://localhost:5000/api/categories');
        const catData = await catRes.json();
        setCategories(catData);

        const userRes = await fetch('http://localhost:5000/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
        const userData = await userRes.json();
        
        if(Array.isArray(userData)) {
            setUsers(userData);
        }

    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // === 2. REAL-TIME ANALYTICS (Socket.io) ===
  useEffect(() => {
      // Connect to Backend
      const socket = io('http://localhost:5000');

      // A. Listen for New Orders
      socket.on('new-order', (newOrder) => {
          const audio = new Audio('https://proxy.notificationsounds.com/notification-sounds/piece-of-cake-611/download/file-sounds-1150-piece-of-cake.mp3');
          audio.play().catch(e => console.log("Audio play blocked"));

          alert(` New Order Received! Amount: ₹${newOrder.totalPrice}`);

          setStats((prevStats) => ({
              ...prevStats,
              orders: (prevStats?.orders || 0) + 1,
              revenue: (prevStats?.revenue || 0) + newOrder.totalPrice,
              recentOrders: [newOrder, ...(prevStats?.recentOrders || []).slice(0, 4)]
          }));
      });

      // B. Listen for New Users (Real-Time Update)
      socket.on('new-user', (newUser) => {
          // 1. Update Total User Count instantly
          setStats((prevStats) => ({
              ...prevStats,
              users: (prevStats?.users || 0) + 1
          }));

          // 2. Add New User to the Table List instantly
          setUsers((prevUsers) => [newUser, ...prevUsers]);
      });

      // Cleanup on unmount
      return () => socket.disconnect();
  }, []);

  // === PRODUCT HANDLERS ===
  const handleAddCategory = async () => {
      if(!newCategory.name.trim()) return alert("Category name required");

      try {
          const res = await fetch('http://localhost:5000/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newCategory)
          });
          
          if(res.ok) {
              setOpenAddCategory(false);
              setNewCategory({ name: "", icon: "" }); 
              fetchData();
              alert("Category Added Successfully!");
          } else {
              const err = await res.json();
              alert("Error: " + err.message);
          }
      } catch(e) { console.error(e); }
  };

  const handleOpenAddProduct = () => {
      setIsEditing(false);
      setCurrentProductId(null);
      setNewProduct({ title: '', price: '', category: '', image: '', description: '', brand: '' });
      setOpenAddProduct(true);
  };

  const handleOpenEditProduct = (product) => {
      setIsEditing(true);
      setCurrentProductId(product._id);
      setNewProduct({
          title: product.title,
          price: product.price,
          category: product.category,
          image: product.image,
          description: product.description,
          brand: product.brand || ''
      });
      setOpenAddProduct(true);
  };

  const handleSaveProduct = async () => {
      const categoryToUse = selectedCategory !== 'All' ? selectedCategory : newProduct.category;
      
      if(!newProduct.title || !newProduct.price || !categoryToUse) {
          return alert("Please fill Title, Price, and Category!");
      }
      if (!token) return alert("ADMIN TOKEN MISSING! Please Logout and Login as Admin again.");

      try {
          let url = 'http://localhost:5000/api/products';
          let method = 'POST';

          if (isEditing && currentProductId) {
              url = `http://localhost:5000/api/products/${currentProductId}`;
              method = 'PUT';
          }

          const res = await fetch(url, {
              method: method,
              headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ ...newProduct, category: categoryToUse })
          });

          const data = await res.json();

          if (res.ok) {
              setOpenAddProduct(false);
              setNewProduct({ title: '', price: '', category: '', image: '', description: '', brand: '' }); 
              fetchData();
              alert(isEditing ? "✅ Product Updated Successfully!" : "✅ Product Added Successfully!");
          } else {
              alert("❌ Failed: " + (data.message || "Unknown Error"));
          }
      } catch (error) {
          console.error(error);
          alert("❌ Network Error: Is your backend running?");
      }
  };

  const handleProductClick = async (product) => {
      setSelectedProduct(product);
      try {
          const res = await fetch(`http://localhost:5000/api/admin/product-stats/${product._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          setProductHistory(data);
      } catch (e) { console.error(e); }
  };

  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Delete this product?")) return;
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
  };

  // === NEW USER HANDLERS (BLOCK & DEACTIVATE) ===
  const handleUserAction = async (userId, action, userName) => {
    let confirmMsg = "";
    if (action === 'block') confirmMsg = `Block ${userName}? They will not be able to log in.`;
    if (action === 'unblock') confirmMsg = `Unblock ${userName}? They will be able to log in again.`;
    if (action === 'deactivate') confirmMsg = `Deactivate ${userName} for 5 minutes? They won't be able to buy items.`;

    if (!window.confirm(confirmMsg)) return;

    try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ action })
        });

        if (res.ok) {
            fetchData(); // Refresh to see new status
            alert(`User ${action}ed successfully.`);
        } else {
            alert("Action failed.");
        }
    } catch (error) {
        console.error(error);
    }
  };

  // Helper to check if deactivated
  const isDeactivated = (dateString) => {
      if (!dateString) return false;
      return new Date(dateString) > new Date();
  };

  // === DUAL SEARCH LOGIC (PRODUCTS & USERS) ===
  const searchText = (globalSearch || "").toLowerCase();

  // 1. Filter Products
  const filteredProducts = products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.title.toLowerCase().includes(searchText);
      return matchesCategory && matchesSearch;
  });

  // 2. Filter Users (Name, Email, or ID)
  const filteredUsers = users.filter((user) => {
      return user.name.toLowerCase().includes(searchText) ||
             user.email.toLowerCase().includes(searchText) ||
             user._id.toLowerCase().includes(searchText);
  });

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}><CircularProgress /></Box>;

  // === HELPER COMPONENT FOR STAT CARDS ===
  const StatCard = ({ title, value, icon, color, subtext }) => (
      <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transition: '0.3s', '&': { transform: 'translateY(-3px)', boxShadow: '0 6px 15px rgba(0,0,0,0.1)' } }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
              <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</Typography>
                  <Typography variant="h4" fontWeight="800" color="text.primary">{value}</Typography>
                  {subtext && <Typography variant="caption" color={color} fontWeight="bold">{subtext}</Typography>}
              </Box>
              <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56, borderRadius: 2 }}>
                  {icon}
              </Avatar>
          </CardContent>
      </Card>
  );

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 4, pt: 4 }}>
        <Container maxWidth="xl">
            {/* TABS */}
            <Paper sx={{ mb: 4, borderRadius: 3, p: 0.5, maxWidth: 600, mx: 'auto', bgcolor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} centered indicatorColor="primary" textColor="primary" variant="fullWidth">
                    <Tab icon={<AssessmentIcon />} iconPosition="start" label="Dashboard" sx={{ fontWeight: 'bold', borderRadius: 2 }} />
                    <Tab icon={<InventoryIcon />} iconPosition="start" label="Inventory" sx={{ fontWeight: 'bold', borderRadius: 2 }} />
                    <Tab icon={<PeopleIcon />} iconPosition="start" label="Users" sx={{ fontWeight: 'bold', borderRadius: 2 }} />
                </Tabs>
            </Paper>

            {/* === TAB 0: DASHBOARD OVERVIEW === */}
            {tabIndex === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Total Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} icon={<AttachMoneyIcon fontSize="large"/>} color="#2e7d32" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Total Users" value={stats?.users || 0} icon={<PeopleIcon fontSize="large"/>} color="#1976d2" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Total Orders" value={stats?.orders || 0} icon={<ShoppingCartIcon fontSize="large"/>} color="#ed6c02" /></Grid>
                    <Grid item xs={12} sm={6} md={3}><StatCard title="Total Products" value={stats?.products || 0} icon={<InventoryIcon fontSize="large"/>} color="#9c27b0" /></Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)', boxShadow: 2, border: '1px solid #ffe0b2' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ bgcolor: '#ff9800', width: 60, height: 60 }}><StarIcon fontSize="large" sx={{ color: 'white' }} /></Avatar>
                                <Box>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Best Selling Item</Typography>
                                    <Typography variant="h5" fontWeight="bold">{stats?.topProducts?.[0]?._id || "No Sales Yet"}</Typography>
                                    <Chip label={`${stats?.topProducts?.[0]?.count || 0} units sold`} size="small" sx={{ mt: 1, bgcolor: '#ffcc80', fontWeight: 'bold' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', borderRadius: 3, background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)', boxShadow: 2, border: '1px solid #e1bee7' }}>
                            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Avatar sx={{ bgcolor: '#9c27b0', width: 60, height: 60 }}><CategoryIcon fontSize="large" sx={{ color: 'white' }} /></Avatar>
                                <Box>
                                    <Typography variant="overline" color="text.secondary" fontWeight="bold">Top Category</Typography>
                                    <Typography variant="h5" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>{stats?.bestCategory?._id || "No Data"}</Typography>
                                    <Chip label="Most Popular" size="small" sx={{ mt: 1, bgcolor: '#e1bee7', fontWeight: 'bold' }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}><TrendingUpIcon color="primary" /> Recent Orders</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead><TableRow sx={{ bgcolor: '#f9fafb' }}><TableCell>Order ID</TableCell><TableCell>Customer</TableCell><TableCell>Amount</TableCell><TableCell>Date</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {stats?.recentOrders?.length > 0 ? stats.recentOrders.map((order) => (
                                            <TableRow key={order._id} hover>
                                                <TableCell sx={{ fontFamily: 'monospace', color: '#666' }}>#{order._id.slice(-6).toUpperCase()}</TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{order.user?.name || "Guest"}</TableCell>
                                                <TableCell>₹{order.totalPrice?.toLocaleString()}</TableCell>
                                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={order.status || "Paid"} 
                                                        color={order.status === 'Cancelled' ? 'error' : 'success'} 
                                                        size="small" 
                                                        variant="filled" 
                                                        sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={5} align="center">No recent orders found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* === TAB 1: PRODUCT INVENTORY === */}
            {tabIndex === 1 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <Paper sx={{ height: '100%', p: 2, borderRadius: 3 }}>
                            <Button variant="contained" fullWidth startIcon={<AddIcon />} onClick={() => setOpenAddCategory(true)} sx={{ mb: 2, borderRadius: 2, py: 1.2, fontWeight: 'bold' }}>Add Category</Button>
                            <Divider sx={{ mb: 2 }} />
                            <List component="nav">
                                <ListItem button selected={selectedCategory === 'All'} onClick={() => { setSelectedCategory('All'); setSelectedProduct(null); }} sx={{ borderRadius: 2, mb: 0.5 }}>
                                    <ListItemText primary="All Products" primaryTypographyProps={{ fontWeight: selectedCategory === 'All' ? 'bold' : 'medium' }} />
                                    <Chip label={products.length} size="small" color={selectedCategory === 'All' ? 'primary' : 'default'} />
                                </ListItem>
                                {categories.map((cat) => (
                                    <ListItem key={cat._id} button selected={selectedCategory === cat.name} onClick={() => { setSelectedCategory(cat.name); setSelectedProduct(null); }} sx={{ borderRadius: 2, mb: 0.5 }}>
                                        <ListItemText primary={cat.name} sx={{ textTransform: 'capitalize' }} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={9}>
                        {selectedProduct ? (
                            <Paper sx={{ p: 4, borderRadius: 3 }}>
                                <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedProduct(null)} sx={{ mb: 3 }}>Back to List</Button>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}><img src={selectedProduct.image} alt="" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', border: '1px solid #eee', borderRadius: 4, padding: 16 }} /></Grid>
                                    <Grid item xs={12} md={8}>
                                        <Chip label={selectedProduct.category} color="primary" variant="outlined" sx={{ mb: 1, textTransform: 'capitalize' }} />
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>{selectedProduct.title}</Typography>
                                        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 3 }}>₹{selectedProduct.price}</Typography>
                                        <Paper sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}><TrendingUpIcon fontSize="small" /> 7-Day Sales Trend</Typography>
                                            <Box sx={{ height: 180, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                                                {productHistory.length === 0 ? <Typography color="text.secondary" variant="body2">No recent sales data.</Typography> : productHistory.map((day) => (
                                                    <Box key={day._id} sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                                        <Box sx={{ height: `${Math.min(day.sales * 30, 150)}px`, bgcolor: '#1976d2', width: '100%', borderRadius: '6px 6px 0 0', opacity: 0.8 }} />
                                                        <Typography variant="caption" sx={{ mt: 1, fontSize: '10px' }}>{day._id.slice(5)}</Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" fontWeight="bold">{selectedCategory} Inventory</Typography>
                                    {/* The old search bar here is removed to avoid duplicates */}
                                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddProduct} sx={{ borderRadius: 2 }}>Add Product</Button>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#f9fafb' }}><TableRow><TableCell>Product</TableCell><TableCell>Price</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {filteredProducts.length > 0 ? filteredProducts.map((prod) => (
                                                <TableRow key={prod._id} hover onClick={() => handleProductClick(prod)} sx={{ cursor: 'pointer' }}>
                                                    <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Avatar src={prod.image} variant="rounded" sx={{ width: 48, height: 48 }} /><Box><Typography variant="body2" fontWeight="bold">{prod.title}</Typography><Typography variant="caption" color="text.secondary">{prod.category}</Typography></Box></TableCell>
                                                    <TableCell fontWeight="bold">₹{prod.price}</TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Edit">
                                                            <IconButton color="primary" size="small" onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(prod); }}>
                                                                <EditIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); handleDeleteProduct(prod._id); }}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            )) : <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4 }}>No products found.</TableCell></TableRow>}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* === TAB 2: USER MANAGEMENT === */}
            {tabIndex === 2 && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SupervisorAccountIcon color="primary" /> Customer Management
                                </Typography>
                                <Chip label={`${users.length} Customers`} color="primary" variant="outlined" />
                            </Box>
                            
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                            <TableCell>Customer Profile</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Join Date</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Use 'filteredUsers' instead of 'users' */}
                                        {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                                            const deactivated = isDeactivated(user.deactivatedUntil);
                                            const blocked = user.isBlocked;

                                            return (
                                            <TableRow key={user._id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: blocked ? '#ef5350' : '#1976d2' }}>
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight="bold">{user.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">ID: {user._id.slice(-6)}</Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                
                                                {/* STATUS CHIP */}
                                                <TableCell>
                                                    {blocked ? (
                                                        <Chip label="Blocked" color="error" size="small" icon={<BlockIcon />} />
                                                    ) : deactivated ? (
                                                        <Chip label="Deactivated" color="warning" size="small" icon={<TimerOffIcon />} />
                                                    ) : (
                                                        <Chip label="Active" color="success" size="small" variant="outlined" icon={<CheckCircleIcon />} />
                                                    )}
                                                </TableCell>
                                                
                                                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                
                                                {/* ACTION BUTTONS */}
                                                <TableCell align="right">
                                                    <Tooltip title={blocked ? "Unblock User" : "Block User (Prevent Login)"}>
                                                        <IconButton 
                                                            color={blocked ? "success" : "error"} 
                                                            onClick={() => handleUserAction(user._id, blocked ? 'unblock' : 'block', user.name)}
                                                        >
                                                            {blocked ? <CheckCircleIcon /> : <BlockIcon />}
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Deactivate for 5 Minutes (Prevent Purchase)">
                                                        <IconButton 
                                                            color="warning" 
                                                            onClick={() => handleUserAction(user._id, 'deactivate', user.name)}
                                                            disabled={blocked || deactivated} 
                                                        >
                                                            <TimerOffIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        )}) : (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No Registered Customers Found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* ADD CATEGORY DIALOG */}
            <Dialog open={openAddCategory} onClose={() => setOpenAddCategory(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Category</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Category Name" fullWidth value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
                        <TextField label="Icon Image URL" placeholder="https://..." fullWidth value={newCategory.icon} onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAddCategory(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleAddCategory} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            {/* ADD/EDIT PRODUCT DIALOG */}
            <Dialog open={openAddProduct} onClose={() => setOpenAddProduct(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {isEditing ? "Edit Product" : `Add Product ${selectedCategory !== 'All' ? `to ${selectedCategory}` : ''}`}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Product Title" fullWidth value={newProduct.title} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField label="Price" type="number" fullWidth value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                            {selectedCategory === 'All' && (
                                <TextField select label="Category" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} fullWidth>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat._id} value={cat.name} sx={{ textTransform: 'capitalize' }}>{cat.name}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </Box>
                        <TextField label="Brand / Manufacturer" fullWidth value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} />
                        <TextField label="Image URL" fullWidth value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} />
                        {newProduct.image && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <img src={newProduct.image} alt="Preview" style={{ maxHeight: 100 }} />
                            </Box>
                        )}
                        <TextField label="Description" fullWidth multiline rows={3} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddProduct(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSaveProduct} variant="contained" size="large" sx={{ borderRadius: 2 }}>
                        {isEditing ? "Update Product" : "Save Product"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    </Box>
  );
};

export default AdminDashboard;