import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "../components/Navbar";

import { usePlaceOrderMutation } from "../services/checkoutApi";
import { useClearCartMutation } from "../services/cartApi";
import { clearCartLocally } from "../store/cartSlice";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const state = location.state || {};
  const product = state.product || null;
  const cartItems = state.cartItems || null;
  const fromCart = state.fromCart || false;

  const isCartCheckout = Boolean(fromCart && cartItems && cartItems.length > 0);
  const isSingleProduct = Boolean(!isCartCheckout && product);

  const title = product?.title ?? product?.name ?? "Product";
  const description = product?.description ?? "";
  const category = product?.category ?? "";
  const priceRaw = product?.price ?? product?.cost ?? "";

  const price = useMemo(() => {
    const n = Number(priceRaw);
    return Number.isFinite(n) ? n : 0;
  }, [priceRaw]);

  const [qty, setQty] = useState(1);
  const [orderName, setOrderName] = useState("");
  const [orderAddress, setOrderAddress] = useState("");
  const [orderPhone, setOrderPhone] = useState("");

  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [clearBackendCart] = useClearCartMutation();

  const [cartQtys, setCartQtys] = useState(() => {
    if (!cartItems) return {};
    const initial = {};
    cartItems.forEach((item) => {
      const itemId = item._id || item.id;
      initial[itemId] = Number(item.quantity) || 1;
    });
    return initial;
  });

  const singleTotal = useMemo(() => {
    return price * qty;
  }, [price, qty]);

  const cartTotal = useMemo(() => {
    if (!cartItems) return 0;
    return cartItems.reduce((sum, item) => {
      const itemId = item._id || item.id;
      const p = Number(item.price) || 0;
      const q = Number(cartQtys[itemId]) || 1;
      return sum + p * q;
    }, 0);
  }, [cartItems, cartQtys]);

  const total = isCartCheckout ? cartTotal : singleTotal;

  const handleCartQtyChange = (itemId, newQty) => {
    if (newQty < 1) return;
    setCartQtys((prev) => ({ ...prev, [itemId]: newQty }));
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!isSingleProduct && !isCartCheckout) return;

    if (!orderName.trim() || !orderAddress.trim() || !orderPhone.trim()) {
      alert("Please fill in all delivery details.");
      return;
    }

    try {
      const buyerId = localStorage.getItem("id");

      if (isSingleProduct) {
        const sellerId =
          product?.sellerId ?? product?.seller?._id ?? product?.seller?.id;
        const productId = product?._id ?? product?.id;

        await placeOrder({
          name: orderName,
          phone: orderPhone,
          address: orderAddress,
          quantity: qty,
          totalPrice: singleTotal,
          productId,
          sellerId,
          buyerId,
        }).unwrap();
      } else if (isCartCheckout) {
        for (const item of cartItems) {
          const itemId = item._id || item.id;
          const itemQty = cartQtys[itemId] || 1;
          const itemTotal = (Number(item.price) || 0) * itemQty;

          await placeOrder({
            name: orderName,
            phone: orderPhone,
            address: orderAddress,
            quantity: itemQty,
            totalPrice: itemTotal,
            productId: itemId,
            sellerId: item.sellerId || item.seller || null,
            buyerId,
          }).unwrap();
        }

        dispatch(clearCartLocally());
        try {
          await clearBackendCart().unwrap();
        } catch {
          // Graceful fallback if backend sync fails
        }
      }

      alert("Order Placed Successfully!");
      navigate("/buyer/dashboard");
    } catch (err) {
      alert(err?.data?.message || err?.error || "Order failed");
    }
  };

  const sellerName =
    product?.sellerName ??
    product?.seller?.name ??
    product?.seller?.fullName ??
    product?.userId?.fullName;

  return (
    <div className="checkout-page">
      <Navbar role="buyer" />

      <main className="checkout-container">
        <div className="checkout-card">
          <header className="checkout-header">
            <h1 className="checkout-title">Checkout</h1>
            <p className="checkout-subtitle">
              Review your items and complete your shipping information.
            </p>
          </header>

          <div className="checkout-layout">
            {/* Left Column: Order Items */}
            <section className="checkout-section">
              {isCartCheckout && (
                <div className="cart-summary">
                  <h2 className="section-title">
                    Order Summary ({cartItems.length} item
                    {cartItems.length !== 1 ? "s" : ""})
                  </h2>

                  <div className="cart-items-list">
                    {cartItems.map((item) => {
                      const itemId = item._id || item.id;
                      const itemTitle = item.title ?? "Product";
                      const itemPrice = Number(item.price) || 0;
                      const itemQty = cartQtys[itemId] || 1;
                      const itemImage = item.image ?? "";

                      return (
                        <div key={itemId} className="cart-item-row">
                          <div className="cart-item-image-box">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={itemTitle}
                                className="cart-item-image"
                              />
                            ) : (
                              <div className="image-placeholder">No Image</div>
                            )}
                          </div>

                          <div className="cart-item-details">
                            <h3 className="cart-item-title">{itemTitle}</h3>
                            {item.sellerName && (
                              <p className="cart-item-seller">
                                Seller: {item.sellerName}
                              </p>
                            )}
                            <p className="cart-item-price">
                              ${itemPrice.toFixed(2)}
                            </p>
                          </div>

                          <div className="qty-controls">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() =>
                                handleCartQtyChange(itemId, itemQty - 1)
                              }
                              disabled={itemQty <= 1}
                            >
                              -
                            </button>
                            <span className="qty-value">{itemQty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() =>
                                handleCartQtyChange(itemId, itemQty + 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <div className="cart-item-subtotal">
                            ${(itemPrice * itemQty).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isSingleProduct && (
                <div className="single-product-summary">
                  <div className="single-product-grid">
                    <div className="single-product-image-box">
                      {product?.image ? (
                        <img
                          src={product.image}
                          alt={title}
                          className="single-product-image"
                        />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                    </div>

                    <div className="single-product-details">
                      <h2 className="single-product-title">{title}</h2>
                      {category && <span className="product-category">{category}</span>}
                      {sellerName && (
                        <p className="single-product-seller">Seller: {sellerName}</p>
                      )}
                      {description && (
                        <p className="single-product-desc">{description}</p>
                      )}

                      <div className="price-row">
                        <span className="price-label">Price:</span>
                        <span className="price-amount">${price.toFixed(2)}</span>
                      </div>

                      <div className="qty-row">
                        <span className="qty-label">Quantity:</span>
                        <div className="qty-controls">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            disabled={qty <= 1}
                          >
                            -
                          </button>
                          <span className="qty-value">{qty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => setQty((q) => q + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isSingleProduct && !isCartCheckout && (
                <div className="empty-checkout">
                  <p>No products selected for checkout.</p>
                </div>
              )}
            </section>

            {/* Right Column: Shipping & Summary */}
            <section className="checkout-sidebar">
              <form onSubmit={handleOrder} className="delivery-form">
                <h2 className="section-title">Delivery Details</h2>

                <div className="form-grid">
                  <div className="form-field">
                    <label className="form-label" htmlFor="orderName">
                      Full Name
                    </label>
                    <input
                      id="orderName"
                      type="text"
                      className="form-input"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label" htmlFor="orderPhone">
                      Phone Number
                    </label>
                    <input
                      id="orderPhone"
                      type="tel"
                      className="form-input"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="orderAddress">
                    Delivery Address
                  </label>
                  <textarea
                    id="orderAddress"
                    className="form-textarea"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    placeholder="Street address, city, state, postal code"
                    required
                    rows={3}
                  />
                </div>

                <div className="total-breakdown">
                  <div className="total-row">
                    <span>Total Amount</span>
                    <span className="total-price">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      isPlacingOrder || (!isSingleProduct && !isCartCheckout)
                    }
                  >
                    {isPlacingOrder
                      ? "Placing Order..."
                      : `Place Order ($${total.toFixed(2)})`}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;