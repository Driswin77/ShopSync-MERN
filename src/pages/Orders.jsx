import React, { useState, useEffect } from "react";
import {
  Box, Typography, Card, CardContent, Button, Chip, Grid, Divider, Tabs, Tab,
  TextField, InputAdornment, Stepper, Step, StepLabel, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert, Menu, MenuItem
} from "@mui/material";
import { Search, FilterList, Download, ShoppingBag, Visibility, Cancel, Sort } from "@mui/icons-material"; 
import { useNavigate } from 'react-router-dom';

function Orders() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter & Sort State
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortOption, setSortOption] = useState("dateNewest"); // Default sort

  // Dialog States
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToCancel, setOrderToCancel] = useState(null);

  // Snackbar State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Real Data State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // === 1. FETCH ORDERS FROM DB ===
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/'); 

      try {
        const res = await fetch('http://localhost:5000/api/orders/myorders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          const formattedOrders = data.map(order => ({
            id: order._id,
            displayId: `ORD-${order._id.substring(0, 8).toUpperCase()}`,
            // Store raw date for sorting, string for display
            rawDate: new Date(order.createdAt),
            date: new Date(order.createdAt).toLocaleDateString(),
            items: order.orderItems,
            total: order.totalPrice,
            status: order.status, 
            deliveryDate: new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)).toLocaleDateString(), 
            paymentMethod: order.paymentMethod,
            trackingId: `TRK${order._id.substring(0, 10).toUpperCase()}`,
            deliverySteps: ["Ordered", "Processing", "Shipped", "Delivered"],
            shippingAddress: order.shippingAddress
          }));
          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  // === 2. FILTER & SORT LOGIC ===
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (option) => {
    if (option) setSortOption(option);
    setFilterAnchorEl(null);
  };

  const tabs = ["All Orders", "Processing", "Shipped", "Delivered", "Cancelled"];

  // Compute Filtered & Sorted Orders
  const getProcessedOrders = () => {
    // 1. Filter by Tab
    let result = orders.filter(order => {
        if (activeTab === 0) return true;
        return order.status === tabs[activeTab];
    });

    // 2. Filter by Search Term
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(order => 
            order.displayId.toLowerCase().includes(lowerTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(lowerTerm))
        );
    }

    // 3. Apply Sorting
    result.sort((a, b) => {
        switch (sortOption) {
            case "dateNewest": return b.rawDate - a.rawDate;
            case "dateOldest": return a.rawDate - b.rawDate;
            case "priceHigh": return b.total - a.total;
            case "priceLow": return a.total - b.total;
            default: return 0;
        }
    });

    return result;
  };

  const filteredOrders = getProcessedOrders();

  // === 3. EXPORT TO CSV ===
  const handleExport = () => {
    if (filteredOrders.length === 0) {
        setToast({ open: true, message: "No orders to export.", severity: "warning" });
        return;
    }

    // CSV Headers
    const headers = ["Order ID", "Date", "Status", "Total Amount", "Payment Method", "Items"];
    
    // CSV Rows
    const rows = filteredOrders.map(order => [
        order.displayId,
        order.date,
        order.status,
        order.total,
        order.paymentMethod,
        order.items.map(i => `${i.name} (x${i.quantity})`).join("; ") // Join items with semicolon
    ]);

    // Construct CSV Content
    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToast({ open: true, message: "Orders exported successfully!", severity: "success" });
  };

  // === 4. HANDLE CANCEL ORDER ===
  const confirmCancelOrder = (orderId) => {
      setOrderToCancel(orderId);
      setOpenCancelDialog(true);
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:5000/api/orders/${orderToCancel}/cancel`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            setOrders(prevOrders => prevOrders.map(order => 
                order.id === orderToCancel ? { ...order, status: 'Cancelled' } : order
            ));
            setToast({ open: true, message: "Order cancelled successfully.", severity: "success" });
        } else {
            const errData = await res.json();
            setToast({ open: true, message: errData.message || "Failed to cancel order", severity: "error" });
        }
    } catch (err) {
        setToast({ open: true, message: "Network error. Could not cancel order.", severity: "error" });
    } finally {
        setOpenCancelDialog(false);
        setOrderToCancel(null);
    }
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpenDetailsDialog(true);
  };

  const getStatusChipColor = (status) => {
    switch (status) {
      case "Delivered": return "success";
      case "Shipped": return "info";
      case "Processing": return "warning";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getActiveStep = (status) => {
     if (status === 'Processing') return 1;
     if (status === 'Shipped') return 2;
     if (status === 'Delivered') return 4;
     return 0;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box className="orders-page" sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Toast Notification */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Header Section */}
      <Box className="orders-header" sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>My Orders</Typography>
        <Typography variant="body1" color="text.secondary">Track, return, or buy things again</Typography>
      </Box>

      {/* Search and Filter Section */}
      <Card className="search-filter-card" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search orders by ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>),
                }}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<FilterList />}
                onClick={handleFilterClick}
              >
                Filter & Sort
              </Button>
              {/* Filter Menu */}
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={() => handleFilterClose(null)}
              >
                <MenuItem onClick={() => handleFilterClose("dateNewest")} selected={sortOption === "dateNewest"}>Date: Newest First</MenuItem>
                <MenuItem onClick={() => handleFilterClose("dateOldest")} selected={sortOption === "dateOldest"}>Date: Oldest First</MenuItem>
                <Divider />
                <MenuItem onClick={() => handleFilterClose("priceHigh")} selected={sortOption === "priceHigh"}>Price: High to Low</MenuItem>
                <MenuItem onClick={() => handleFilterClose("priceLow")} selected={sortOption === "priceLow"}>Price: Low to High</MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={6} md={2}>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<Download />} 
                onClick={handleExport}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {tab}
                  {index > 0 && (
                    <Chip label={orders.filter((o) => {
                        if (index === 0) return true;
                        return o.status === tabs[index];
                    }).length} size="small" sx={{ height: 20, fontSize: "0.75rem" }} />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Orders List */}
      <Box className="orders-list">
        {filteredOrders.length === 0 ? (
          <Card className="empty-orders-card">
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <ShoppingBag sx={{ fontSize: 60, color: "#ddd", mb: 2 }} />
              <Typography variant="h6" gutterBottom>No orders found</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {searchTerm ? `No results for "${searchTerm}"` : `You have no ${tabs[activeTab].toLowerCase()} orders`}
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/')}>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="order-card" sx={{ mb: 3, border: '1px solid #eee', boxShadow: 'none' }}>
              <CardContent>
                {/* Order Header */}
                <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2, bgcolor: '#f9f9f9', p: 2, borderRadius: 1 }}>
                  <Grid item>
                    <Typography variant="subtitle1" fontWeight="bold">{order.displayId}</Typography>
                    <Typography variant="caption" color="text.secondary">Placed on {order.date}</Typography>
                  </Grid>
                  <Grid item>
                    <Chip label={order.status} color={getStatusChipColor(order.status)} size="small" />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                {order.items.map((item, index) => (
                  <Grid key={index} container alignItems="center" sx={{ mb: 2, py: 1 }}>
                    <Grid item xs={2} sm={1}>
                      <Box sx={{ width: 60, height: 60, bgcolor: "#f5f5f5", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{width:'100%', height:'100%', objectFit:'contain'}} /> : <ShoppingBag sx={{ color: "#999" }} />}
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={7} sx={{ pl: 2 }}>
                      <Typography variant="body2" fontWeight="medium">{item.name}</Typography>
                      <Typography variant="caption" color="text.secondary" display="flex">Qty: {item.quantity}</Typography>
                    </Grid>
                    <Grid item xs={4} sm={4} sx={{ textAlign: "right"}}>
                      <Typography variant="body2" color="text.primary" display="flex-end"><br></br>₹{item.price?.toLocaleString()}</Typography>
                    </Grid>
                  </Grid>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Order Footer */}
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total: <span style={{ fontWeight: "bold", color: "#333" }}>₹{order.total.toLocaleString()}</span>
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                      Expected delivery: {order.deliveryDate}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {(order.status === 'Processing' || order.status === 'Ordered') && (
                            <Button 
                                variant="outlined" 
                                size="small" 
                                color="error" 
                                onClick={() => confirmCancelOrder(order.id)}
                                startIcon={<Cancel />}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button variant="outlined" size="small" onClick={() => handleViewDetails(order)} startIcon={<Visibility />}>
                        View Details
                        </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* CANCEL CONFIRMATION DIALOG */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#d32f2f' }}>Cancel Order?</DialogTitle>
        <DialogContent>
            <DialogContentText>
                Are you sure you want to cancel this order? This action cannot be undone.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)} color="inherit">No, Keep Order</Button>
            <Button onClick={executeCancelOrder} variant="contained" color="error" autoFocus>Yes, Cancel Order</Button>
        </DialogActions>
      </Dialog>

      {/* ORDER DETAILS DIALOG */}
      <Dialog open={openDetailsDialog} onClose={() => setOpenDetailsDialog(false)} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h6">Order Details - #{selectedOrder.displayId}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              {/* Delivery Progress */}
              <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Delivery Progress</Typography>
                {selectedOrder.status === 'Cancelled' ? (
                    <Alert severity="error" variant="filled">This order has been cancelled.</Alert>
                ) : (
                    <Stepper activeStep={getActiveStep(selectedOrder.status)} alternativeLabel>
                    {selectedOrder.deliverySteps.map((step) => (
                        <Step key={step}><StepLabel>{step}</StepLabel></Step>
                    ))}
                    </Stepper>
                )}
              </Box>

              {/* Order Summary Table */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Order Summary</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">₹{item.price}</TableCell>
                          <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right"><Typography fontWeight="bold">Grand Total</Typography></TableCell>
                        <TableCell align="right"><Typography fontWeight="bold">₹{selectedOrder.total}</Typography></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Addresses */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Shipping Address</Typography>
                  <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1 }}>
                      <Typography variant="body2">{selectedOrder.shippingAddress?.address || "N/A"}</Typography>
                      <Typography variant="body2">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode}</Typography>
                      <Typography variant="body2">{selectedOrder.shippingAddress?.country}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Order Info</Typography>
                  <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1 }}>
                    <Typography variant="body2"><strong>Date:</strong> {selectedOrder.date}</Typography>
                    <Typography variant="body2"><strong>Payment:</strong> {selectedOrder.paymentMethod}</Typography>
                    <Typography variant="body2"><strong>Tracking:</strong> {selectedOrder.trackingId}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDetailsDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default Orders;