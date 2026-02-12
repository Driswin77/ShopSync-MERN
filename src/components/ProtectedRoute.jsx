import React from 'react';
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  // This matches the localStorage key we set in the unified LoginDialog
  const token = localStorage.getItem("adminToken");
  
  // If no admin token is found, redirect to home
  return token ? children : <Navigate to="/" />; 
}

export default ProtectedRoute;