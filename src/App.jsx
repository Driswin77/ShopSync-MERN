import React, { useEffect, useState } from 'react'; // <--- 1. Import useState
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'; 
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar'; 
import './App.css';

// IMPORT YOUR EXISTING PAGES
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import ProductDetails from './pages/ProductDetails'; 

// IMPORT THE NEW USER PAGES
import UserProfile from './pages/UserProfile';
import Orders from './pages/Orders';
import Addresses from './pages/Addresses';
import Wishlist from './pages/Wishlist';
import Logout from './pages/Logout';
import Checkout from './pages/Checkout';

// === NEW ADMIN IMPORTS ===
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation(); 
  const navigate = useNavigate(); 

  // === 2. STATE FOR ADMIN SEARCH ===
  // This holds the text typed in the blue Navbar
  const [adminSearchText, setAdminSearchText] = useState(""); 

  // === 3. AUTO-REDIRECT ADMINS ===
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken && location.pathname === '/') {
        navigate('/admin');
    }
  }, [location.pathname, navigate]);

  // SCROLL TO TOP LOGIC
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); 

  // Check if current path is Admin
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* 4. PASS THE SETTER TO NAVBAR */}
      {/* This allows Navbar to update 'adminSearchText' when you type */}
      <Navbar onSearch={setAdminSearchText} />
      
      {/* Show CategoryBar on all pages EXCEPT Home ('/') AND Admin Pages */}
      {!isAdminRoute && location.pathname !== '/' && <CategoryBar />}
      
      <div style={{ padding: '10px', minHeight: '80vh' }}>
        <Routes>
          {/* MAIN ROUTES */}
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<Products />} />
          <Route path='/product/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          
          {/* AUTH ROUTES */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/logout' element={<Logout />} />

          {/* USER DASHBOARD ROUTES */}
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/addresses' element={<Addresses />} />
          <Route path='/wishlist' element={<Wishlist />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/payment' element={<Payment />} />

          {/* === ADMIN ROUTE (PROTECTED) === */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                {/* 5. PASS THE VALUE TO DASHBOARD */}
                {/* This sends the search text down to filter the tables */}
                <AdminDashboard globalSearch={adminSearchText} />
              </ProtectedRoute>
            }
          />

        </Routes>
      </div>
    </>
  )
}

export default App;