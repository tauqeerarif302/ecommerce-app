# Task: Show products and respective seller in cart & checkout

## Plan & Implementation

### ✅ Step 1: `cartSlice.js` - Store seller info when adding to cart
- Added `sellerId` and `sellerName` fields to locally stored cart items

### ✅ Step 2: `Cart.jsx` - Display seller name per cart item
- Shows "Seller: {sellerName}" under each cart item
- Extracts seller info from server-synced cart items (populated `product.userId`)

### ✅ Step 3: `Checkout.jsx` - Display seller name per product
- **Cart checkout mode**: Shows "Seller: {item.sellerName}" under each item
- **Single product mode**: Shows "Seller: {product.sellerName/product.userId.fullName}"

### ✅ Step 4: `cartController.js` (backend) - Include seller info in populated product
- Updated `addToCart`: Populates `items.product.userId` with `fullName, name, email` 
- Updated `getCart`: Same population for full seller info

