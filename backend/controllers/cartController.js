const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add item to cart (or increase quantity if already exists)
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const buyerId = req.user.id;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find or create cart for this buyer
    let cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) {
      cart = new Cart({ buyer: buyerId, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();

    // Populate product details (including userId/seller info) for response
    await cart.populate({
      path: "items.product",
      select: "title price image description category userId",
      populate: { path: "userId", select: "fullName name email" }
    });

    return res.status(200).json({
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get cart for logged-in buyer
const getCart = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const cart = await Cart.findOne({ buyer: buyerId }).populate({
      path: "items.product",
      select: "title price image description category userId",
      populate: { path: "userId", select: "fullName name email" }
    });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    return res.status(200).json(cart);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Remove a specific item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const buyerId = req.user.id;

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "title price image description category userId",
      populate: { path: "userId", select: "fullName name email" }
    });

    return res.status(200).json({
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update item quantity in cart
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const buyerId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ buyer: buyerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "title price image description category userId",
      populate: { path: "userId", select: "fullName name email" }
    });

    return res.status(200).json({
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const cart = await Cart.findOne({ buyer: buyerId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
  clearCart,
};
