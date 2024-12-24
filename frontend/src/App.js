import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import LoginPage from './pages/login';              
import SignUpPage from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import ChangePasswordPage from "./pages/changePassword";
import HomePage from "./pages/homePage";
import AccountSettingsPage from "./pages/accountSettings";
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/homepage" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/accountsettings" 
          element={
            <PrivateRoute>
              <AccountSettingsPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
