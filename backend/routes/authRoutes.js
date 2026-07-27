const express = require("express");
const router = express.Router();
const {
  signup,verifyOTP,login} = require("../controllers/authController");
const { protect } = require("../middleware/protect");
const { addProduct, showProducts, sellerProducts, deleteProduct, updateProduct, ProductCheckout, getBuyerOrders, getSellerOrders, updateOrderStatus } = require("../controllers/productsController");
const { addToCart, getCart, removeFromCart, updateCartItem, clearCart } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload")

// Signup Route
router.post("/signup", signup);

// Verify OTP Route
router.post("/verify-otp", verifyOTP);

// Login Route
router.post("/login", login);

// Seller Dashboard
router.get("/seller/dashboard", authMiddleware.authMiddleware, sellerProducts)

// Seller add product 
router.post("/seller/add-product", upload.single("image"), authMiddleware.authMiddleware, addProduct);

// Seller Orders
router.get("/seller/orders", authMiddleware.authMiddleware, getSellerOrders)

// Seller Update Order Status
router.put("/seller/orders/:id/status", authMiddleware.authMiddleware, updateOrderStatus)

// All the products 
router.get("/buyer/products", showProducts);

// Delete Products Seller 
router.delete("/seller/delete-product/:id", authMiddleware.authMiddleware, deleteProduct)

// Update Product
router.put("/seller/update-product/:id", authMiddleware.authMiddleware, upload.single("image"), updateProduct)

// Buyer Checkout Page 
router.post("/buyer/checkout", authMiddleware.authMiddleware, ProductCheckout)

// Buyer Orders
router.get("/buyer/orders", authMiddleware.authMiddleware, getBuyerOrders)

// Cart Routes
router.get("/buyer/cart", authMiddleware.authMiddleware, getCart)
router.post("/buyer/cart/add", authMiddleware.authMiddleware, addToCart)
router.delete("/buyer/cart/:productId", authMiddleware.authMiddleware, removeFromCart)
router.put("/buyer/cart/:productId", authMiddleware.authMiddleware, updateCartItem)
router.delete("/buyer/cart", authMiddleware.authMiddleware, clearCart)


module.exports = router;
