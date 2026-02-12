import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Box, InputBase, Button, Badge, Menu, MenuItem, Divider, ListItemIcon, Chip 
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useCart } from '../context/CartContext';
import LoginDialog from './LoginDialog'; 

// === STYLES (Unchanged) ===
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '24px', 
  backgroundColor: '#f5f5f5', 
  '&:hover': { backgroundColor: '#eeeeee' },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(3),
  width: '100%',
  border: '1px solid transparent',
  transition: '0.3s',
  '&:focus-within': {
    border: '1px solid #00796b', 
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  [theme.breakpoints.up('sm')]: { marginLeft: theme.spacing(3), width: 'auto', flexGrow: 1, maxWidth: '500px' },
  display: 'flex', alignItems: 'center',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2), 
  height: '100%', 
  position: 'absolute', 
  cursor: 'pointer',       
  pointerEvents: 'auto',   
  zIndex: 1,
  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00796b', 
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit', width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0), paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'), width: '100%', color: '#333', fontSize: '0.9rem', fontWeight: 500
  },
}));

// === ACCEPT 'onSearch' PROP HERE ===
const Navbar = ({ onSearch }) => {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cartItems ? cartItems.reduce((acc, item) => acc + item.quantity, 0) : 0;
  
  const [openLogin, setOpenLogin] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  // === SEARCH STATE ===
  const [keyword, setKeyword] = useState('');

  // === CHECK ADMIN STATUS ===
  const isAdmin = localStorage.getItem('adminToken'); // Check if Admin is logged in

  // === USER STATE INITIALIZATION ===
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    let name = localStorage.getItem('userName');

    if (name === 'undefined' || name === 'null' || !name) {
      const userObj = localStorage.getItem('user');
      if (userObj) {
        try {
          const parsed = JSON.parse(userObj);
          name = parsed.name || parsed.firstName || "User";
        } catch (e) {
          name = "User";
        }
      } else {
        name = "User"; 
      }
    }

    return token ? { name } : null;
  });

  useEffect(() => {
    if (location.state?.openLogin) {
      setOpenLogin(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // === SEARCH FUNCTION ===
  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      
      // Admin Search (Real-time is handled in onChange, this is backup)
      if (isAdmin && onSearch) {
          onSearch(keyword);
      } 
      // User Search (Navigate to results)
      else {
          if (keyword.trim()) {
            navigate(`/?search=${keyword.trim()}`); 
          } else {
            navigate('/'); 
          }
      }
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    handleMenuClose();
    navigate('/');
    window.location.reload(); 
  };

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={isAdmin ? 4 : 0} // Add shadow for Admin, flat for User
        sx={{ 
            backgroundColor: isAdmin ? '#1a237e' : 'white', // Navy Blue for Admin, White for User
            borderBottom: isAdmin ? 'none' : '1px solid #eee',
            color: isAdmin ? 'white' : 'inherit'
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important', display: 'flex', justifyContent: 'space-between' }}>
          
          {/* 1. BRAND LOGO */}
          <Box 
            component="div" 
            onClick={() => navigate(isAdmin ? '/admin' : '/')} // Redirect based on role
            sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
          >
            <Box sx={{ bgcolor: isAdmin ? 'white' : '#00796b', color: isAdmin ? '#1a237e' : 'white', width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>S</Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: isAdmin ? 'white' : '#333', letterSpacing: '-0.5px' }}>
              Shop<span style={{ color: isAdmin ? '#90caf9' : '#00796b' }}>Sync.</span>
              {isAdmin && <span style={{ fontSize: '12px', marginLeft: '5px', textTransform: 'uppercase', border: '1px solid white', padding: '2px 5px', borderRadius: '4px' }}>Admin</span>}
            </Typography>
          </Box>

          {/* 2. SEARCH BAR (Changes Placeholder for Admin) */}
          <Search sx={{ bgcolor: isAdmin ? 'rgba(247, 247, 247, 0.93)' : '#f5f5f5', '&:hover': { bgcolor: isAdmin ? 'rgba(248, 242, 242, 0.96)' : '#eeeeee' } }}>
            <SearchIconWrapper onClick={handleSearch}>
              <SearchIcon sx={{ color: isAdmin ? 'white' : '#e6eeea' }} />
            </SearchIconWrapper>
            <StyledInputBase 
              placeholder={isAdmin ? "Search Product/Customer " : "Find your next favorite item..."} 
              inputProps={{ 'aria-label': 'search' }}
              value={keyword}
              // === UPDATED ONCHANGE LOGIC ===
              onChange={(e) => {
                  const val = e.target.value;
                  setKeyword(val);
                  // If Admin, update Dashboard immediately
                  if(isAdmin && onSearch) {
                      onSearch(val);
                  }
              }}
              // ==============================
              onKeyDown={handleSearch} 
              sx={{ color: isAdmin ? 'white' : 'inherit' }}
            />
          </Search>

          {/* 3. ACTIONS (CONDITIONAL RENDERING) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* === ADMIN VIEW === */}
            {isAdmin ? (
                <>
                    <Chip 
                        icon={<AdminPanelSettingsIcon sx={{ color: 'white !important' }} />} 
                        label="Administrator Mode" 
                        variant="outlined"
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', fontWeight: 'bold', display: { xs: 'none', md: 'flex' } }}
                    />
                    <Button 
                        onClick={handleLogout}
                        startIcon={<LogoutIcon />}
                        sx={{ color: 'white', textTransform: 'none', fontWeight: 600 }}
                    >
                        Logout
                    </Button>
                </>
            ) : (
                /* === USER VIEW (Standard) === */
                <>
                    {user ? (
                      <>
                        <Button 
                          onClick={handleMenuOpen}
                          endIcon={<KeyboardArrowDownIcon />}
                          sx={{ textTransform: 'none', color: '#333', fontWeight: 600, fontSize: '15px' }}
                        >
                          Hi, {user.name}
                        </Button>

                        <Menu 
                          anchorEl={anchorEl} 
                          open={openMenu} 
                          onClose={handleMenuClose}
                          PaperProps={{
                            elevation: 3,
                            sx: { mt: 1.5, minWidth: 200, borderRadius: 2, overflow: 'visible' }
                          }}
                          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                          <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ py: 1 }}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> My Profile
                          </MenuItem>
                          <MenuItem onClick={() => { handleMenuClose(); navigate('/orders'); }} sx={{ py: 1 }}>
                            <ListItemIcon><ShoppingBagIcon fontSize="small" /></ListItemIcon> Orders
                          </MenuItem>
                          <MenuItem onClick={() => { handleMenuClose(); navigate('/addresses'); }} sx={{ py: 1 }}>
                            <ListItemIcon><LocationOnIcon fontSize="small" /></ListItemIcon> Addresses
                          </MenuItem>
                          <MenuItem onClick={() => { handleMenuClose(); navigate('/wishlist'); }} sx={{ py: 1 }}>
                            <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon> Wishlist
                          </MenuItem>
                          <Divider />
                          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f', py: 1 }}>
                            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#d32f2f' }} /></ListItemIcon> Logout
                          </MenuItem>
                        </Menu>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setOpenLogin(true)}
                        variant="outlined"
                        sx={{ 
                          color: '#00796b', borderColor: '#00796b', borderRadius: '20px', textTransform: 'none', fontWeight: 600, px: 3,
                          '&:hover': { backgroundColor: '#e0f2f1', borderColor: '#00796b' }
                        }}
                      >
                        Login
                      </Button>
                    )}

                    {/* CART ICON (Only for Users) */}
                    <Box component={Link} to="/cart" sx={{ color: '#333', display: 'flex', alignItems: 'center', textDecoration: 'none', ml: 1 }}>
                      <Badge badgeContent={totalItems} sx={{ '& .MuiBadge-badge': { bgcolor: '#ff7043', color: 'white' } }}>
                        <ShoppingCartIcon sx={{ fontSize: 28 }} />
                      </Badge>
                    </Box>
                </>
            )}
            
          </Box>
        </Toolbar>
      </AppBar>

      <LoginDialog open={openLogin} handleClose={() => setOpenLogin(false)} setUser={setUser} />
    </>
  );
};

export default Navbar;