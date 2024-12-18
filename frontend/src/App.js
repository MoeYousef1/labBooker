import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import LoginPage from './pages/login';              // The new login component
import SignUpPage from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import ChangePasswordPage from "./pages/changePassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
