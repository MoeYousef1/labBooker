import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import all your pages
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/login";
import SignUpPage from "./pages/signUp";
import ForgotPassword from "./pages/forgotPassword";
import ChangePasswordPage from "./pages/changePassword";
import ResetPasswordPage from "./pages/resetPassword";
import HomePage from "./pages/homePage";
import AccountSettingsPage from "./pages/accountSettings";
import PrivateRoute from "./components/PrivateRoute";
import FAQ from "./pages/faq";
import ABOUT from "./pages/about";
import LabRooms from "./pages/LabRooms";
import RoomGuidelines from "./pages/roomGuidelines ";
import ContactPage from "./pages/contact";
import RoomOperationpage from "./pages/roomOperationPage";
import BookingOperationpage from "./pages/bookingOperationPage";
import UserManagement from "./pages/UserManagement";
import DashBoard from "./pages/dashboard";
import MyBookingsPage from "./pages/MyBookingsPage";
import StatusHistoryPage from "./components/StatusHistoryPage";
import IssueReport from "./pages/IssueReport";
import PrivacyPolicy from "./pages/PrivacyPolicy ";
import TermsOfService from "./pages/TermsOfService";
import AllIssues from "./pages/AllIssues";

// Page Transition Wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "tween",
        duration: 0.3,
      }}
      style={{
        position: "absolute",
        width: "100%",
      }}
    >
      {children}
    </motion.div>
  );
};

// Wrapper component to handle animations
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <LandingPage />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <PageTransition>
              <LoginPage />
            </PageTransition>
          }
        />
        <Route
          path="/signup"
          element={
            <PageTransition>
              <SignUpPage />
            </PageTransition>
          }
        />
        <Route
          path="/forgotpassword"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />
        <Route
          path="/changepassword"
          element={
            <PageTransition>
              <ChangePasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/resetpassword"
          element={
            <PageTransition>
              <ResetPasswordPage />
            </PageTransition>
          }
        />
        <Route
          path="/issuereport"
          element={
            <PageTransition>
              <IssueReport />{" "}
            </PageTransition>
          }
        />
        <Route
          path="/privacypolicy"
          element={
            <PageTransition>
              <PrivacyPolicy />{" "}
            </PageTransition>
          }
        />
        <Route
          path="/termsofservice"
          element={
            <PageTransition>
              <TermsOfService />{" "}
            </PageTransition>
          }
        />
        <Route
          path="/issue-report"
          element={
            <PageTransition>
              <AllIssues />{" "}
            </PageTransition>
          }
        />
        <Route
          path="/faq"
          element={
            <PageTransition>
              <FAQ />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <ABOUT />
            </PageTransition>
          }
        />
        <Route
          path="/roomguidelines"
          element={
            <PageTransition>
              <RoomGuidelines />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <ContactPage />
            </PageTransition>
          }
        />
        <Route
          path="/roomOperationpage"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <PageTransition>
                <RoomOperationpage />
              </PageTransition>
            </PrivateRoute>
          }
        />

        <Route
          path="/bookingOperationpage"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <PageTransition>
                <BookingOperationpage />
              </PageTransition>
            </PrivateRoute>
          }
        />

        <Route
          path="/UserManagement"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <PageTransition>
                <UserManagement />
              </PageTransition>
            </PrivateRoute>
          }
        />

        <Route
          path="/status-page"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <PageTransition>
                <StatusHistoryPage />
              </PageTransition>
            </PrivateRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/homepage"
          element={
            <PrivateRoute>
              <PageTransition>
                <HomePage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <PageTransition>
                <MyBookingsPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/accountsettings"
          element={
            <PrivateRoute>
              <PageTransition>
                <AccountSettingsPage />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/labrooms"
          element={
            <PrivateRoute>
              <PageTransition>
                <LabRooms />
              </PageTransition>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin", "manager"]}>
              <PageTransition>
                <DashBoard />
              </PageTransition>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div style={{ position: "relative" }}>
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
