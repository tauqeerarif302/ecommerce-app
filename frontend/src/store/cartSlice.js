import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage on initial load
const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem("cartItems");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage(),
    itemCount: loadCartFromStorage().length,
  },
  reducers: {
    // Optimistically add item locally before server sync
    addItemLocally: (state, action) => {
      const { product } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => (item._id || item.id) === (product._id || product.id)
      );

      if (existingIndex > -1) {
        state.items[existingIndex].quantity += 1;
      } else {
        state.items.push({
          _id: product._id || product.id,
          title: product.title || product.name,
          price: product.price || product.cost,
          image: product.image,
          description: product.description,
          category: product.category,
          quantity: 1,
          // Store seller info from product
          sellerId: product.sellerId || product.userId?._id || product.userId?.id || product.seller?._id || product.seller?.id || null,
          sellerName:
            product.sellerName ??
            product.seller?.name ??
            product.seller?.fullName ??
            product.userId?.fullName ??
            product.userId?.name ??
            "",
        });
      }
      state.itemCount = state.items.length;
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    // Remove item locally
    removeItemLocally: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => (item._id || item.id) !== productId
      );
      state.itemCount = state.items.length;
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    // Update quantity locally
    updateQuantityLocally: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(
        (item) => (item._id || item.id) === productId
      );
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem("cartItems", JSON.stringify(state.items));
    },

    // Clear local cart
    clearCartLocally: (state) => {
      state.items = [];
      state.itemCount = 0;
      localStorage.removeItem("cartItems");
    },

    // Sync from server (replace local with server data)
    syncCartFromServer: (state, action) => {
      const serverItems = action.payload || [];
      if (serverItems.length > 0) {
        state.items = serverItems;
        state.itemCount = serverItems.length;
        localStorage.setItem("cartItems", JSON.stringify(serverItems));
      }
    },
  },
});

export const {
  addItemLocally,
  removeItemLocally,
  updateQuantityLocally,
  clearCartLocally,
  syncCartFromServer,
} = cartSlice.actions;

export default cartSlice.reducer;

