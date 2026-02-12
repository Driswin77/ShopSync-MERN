import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Divider,
} from "@mui/material";
import {
  Logout as LogoutIcon,
  Login as LoginIcon,
  ArrowForward,
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";

function Logout() {
  const { clearCart } = useCart(); // Optional: If your context supports clearing

  useEffect(() => {
    // === 1. CLEAR STORED DATA ===
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("user");
    
    // === 2. CLEAR CART (Optional) ===
    // If you want to clear the cart state in the app when logging out
    if(clearCart) clearCart();

    // === 3. FORCE NAVBAR UPDATE ===
    // This event listener ensures the Navbar sees the token is gone
    // immediately without needing a full page reload.
    window.dispatchEvent(new Event("storage"));
    
  }, []);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "1px solid #e8e8e8",
            width: "100%",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Success Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "#e3f2fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <LogoutIcon sx={{ fontSize: 40, color: "#1976d2" }} />
            </Box>

            {/* Success Message */}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Successfully Logged Out
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
            >
              You have been securely logged out of your ShopSync account. 
              Your session has been cleared for safety.
            </Typography>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                What would you like to do next?
              </Typography>
            </Divider>

            {/* Action Buttons */}
            <Stack spacing={2} sx={{ mt: 4 }}>
              <Button
                // NOTE: Clicking this opens the Login Dialog if you are on Home, 
                // but since we are on a separate page, we might want to redirect to Home 
                // and open the dialog there, or simply redirect to Home.
                component={Link}
                to="/" 
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                endIcon={<ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Login Again
              </Button>

              <Button
                component={Link}
                to="/"
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "#ddd",
                  color: "#666",
                  "&:hover": {
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    backgroundColor: "#f5f7fa",
                  },
                }}
              >
                Continue as Guest
              </Button>
            </Stack>

            {/* Security Note */}
            <Box
              sx={{
                mt: 5,
                pt: 3,
                borderTop: "1px dashed #eee",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                🔒 For security reasons, please close all browser windows if you're 
                using a shared computer.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Logout;