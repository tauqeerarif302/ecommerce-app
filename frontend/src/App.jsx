import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/Signup";
import OTPVerification from "./pages/OTPVerification";
import Login from "./pages/Login";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAddProduct from "./pages/SellerAddProduct";
import SellerOrders from "./pages/SellerOrders";
import BuyerDashboard from "./pages/BuyerDashboard";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import BuyerOrders from "./pages/BuyerOrders";

import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Route */}
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Login />} />
        <Route path="/login" element={<Login />} />


        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/otp-verification" element={<OTPVerification />} />

        {/* Seller Dashboard */}
        <Route
          path="/seller/dashboard"
          element={
            <ProtectedRoute role="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Seller Add Product */}
        <Route
          path="/seller/add-product"
          element={
            <ProtectedRoute role="seller">
              <SellerAddProduct />
            </ProtectedRoute>
          }
        />

        {/* Seller Orders */}
        <Route
          path="/seller/orders"
          element={
            <ProtectedRoute role="seller">
              <SellerOrders />
            </ProtectedRoute>
          }
        />

        {/* Buyer Dashboard */}
        <Route
          path="/buyer/dashboard"
          element={
            <ProtectedRoute role="buyer">
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Buyer Cart */}
        <Route
          path="/buyer/cart"
          element={
            <ProtectedRoute role="buyer">
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* Buyer Checkout */}
        <Route
          path="/buyer/checkout"
          element={
            <ProtectedRoute role="buyer">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Buyer Orders */}
        <Route
          path="/buyer/orders"
          element={
            <ProtectedRoute role="buyer">
              <BuyerOrders />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
