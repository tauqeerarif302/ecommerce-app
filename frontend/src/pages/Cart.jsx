import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useClearCartMutation,
} from "../services/cartApi";
import {
  removeItemLocally,
  updateQuantityLocally,
  clearCartLocally,
  syncCartFromServer,
} from "../store/cartSlice";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local cart items from Redux (persisted in localStorage)
  const localItems = useSelector((state) => state.cart.items);

  // Try to sync with backend (if user is authenticated)
  const { data: serverCart, isSuccess: serverCartLoaded } = useGetCartQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });

  // Sync server cart into local state when loaded
  const serverItems = useMemo(() => {
    if (serverCartLoaded && serverCart?.items) {
      const mapped = serverCart.items.map((item) => ({
        _id: item.product?._id ?? item.product?.id,
        title: item.product?.title ?? "Product",
        price: item.product?.price ?? 0,
        image: item.product?.image ?? "",
        description: item.product?.description ?? "",
        category: item.product?.category ?? "",
        quantity: item.quantity,
        // Extract seller info from populated product's userId
        sellerId: item.product?.userId?._id ?? item.product?.userId?.id ?? null,
        sellerName:
          item.product?.userId?.fullName ??
          item.product?.userId?.name ??
          "",
      }));
      dispatch(syncCartFromServer(mapped));
      return mapped;
    }
    return null;
  }, [serverCart, serverCartLoaded, dispatch]);

  // Use server items if available, otherwise use local items
  const items = serverItems ?? localItems;

  const [removeFromBackend] = useRemoveFromCartMutation();
  const [updateOnBackend] = useUpdateCartItemMutation();
  const [clearBackend] = useClearCartMutation();

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + price * qty;
    }, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  }, [items]);

  const handleRemove = async (productId) => {
    dispatch(removeItemLocally(productId));
    try {
      await removeFromBackend(productId).unwrap();
    } catch {
      // Keep local removal even if backend fails
    }
  };

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    dispatch(updateQuantityLocally({ productId, quantity: newQty }));
    try {
      await updateOnBackend({ productId, quantity: newQty }).unwrap();
    } catch {
      // Keep local update even if backend fails
    }
  };

  const handleClearCart = async () => {
    dispatch(clearCartLocally());
    try {
      await clearBackend().unwrap();
    } catch {
      // Keep local clear even if backend fails
    }
  };

  const handleProceedToCheckout = () => {
    // Pass all cart items to checkout page
    navigate("/buyer/checkout", { state: { cartItems: items, fromCart: true } });
  };

  return (
    <div>
      <Navbar role="buyer" />

      <div style={{ maxWidth: 900, margin: "16px auto", padding: "0 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: 950 }}>Shopping Cart</h2>
            <div style={{ color: "#64748b", fontWeight: 700, marginTop: 4 }}>
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </div>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                background: "#fff",
                color: "#ef4444",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div
            style={{
              padding: 32,
              borderRadius: 14,
              border: "1px solid rgba(15, 23, 42, 0.12)",
              background: "#fff",
              textAlign: "center",
              color: "#64748b",
              fontWeight: 700,
            }}
          >
            Your cart is empty.
            <br />
            <button
              type="button"
              onClick={() => navigate("/buyer/dashboard")}
              style={{
                marginTop: 16,
                padding: "10px 24px",
                borderRadius: 12,
                border: "none",
                background: "#0b1220",
                color: "#fff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((item) => {
              const itemId = item._id || item.id;
              const title = item.title ?? "Product";
              const price = Number(item.price) || 0;
              const qty = Number(item.quantity) || 1;
              const image = item.image ?? "";

              return (
                <div
                  key={itemId}
                  style={{
                    border: "1px solid rgba(15, 23, 42, 0.12)",
                    background: "#fff",
                    padding: 16,
                    borderRadius: 14,
                    boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
                    display: "flex",
                    gap: 16,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 10,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "rgba(15, 23, 42, 0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{title}</div>
                    {item.category && (
                      <div style={{ color: "grey", fontWeight: 600, fontSize: 13 }}>
                        {item.category}
                      </div>
                    )}
                    {item.sellerName ? (
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        Seller: {item.sellerName}
                      </div>
                    ) : null}
                    <div style={{ fontWeight: 950, marginTop: 4 }}>{price} $</div>
                  </div>

                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(itemId, qty - 1)}
                      disabled={qty <= 1}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "1px solid rgba(15, 23, 42, 0.12)",
                        background: qty <= 1 ? "#f1f5f9" : "#fff",
                        cursor: qty <= 1 ? "not-allowed" : "pointer",
                        fontWeight: 900,
                        color: qty <= 1 ? "#94a3b8" : "#0f172a",
                      }}
                    >
                      -
                    </button>
                    <div
                      style={{
                        minWidth: 40,
                        textAlign: "center",
                        fontWeight: 950,
                      }}
                    >
                      {qty}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(itemId, qty + 1)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "1px solid rgba(15, 23, 42, 0.12)",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Remove */}
                  <div
                    style={{
                      textAlign: "right",
                      minWidth: 100,
                    }}
                  >
                    <div style={{ fontWeight: 950, marginBottom: 8 }}>
                      {(price * qty).toFixed(2)} $
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(itemId)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 10,
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        background: "#fff",
                        color: "#ef4444",
                        fontWeight: 800,
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Cart Summary */}
            <div
              style={{
                marginTop: 8,
                border: "1px solid rgba(15, 23, 42, 0.12)",
                background: "#fff",
                padding: 16,
                borderRadius: 14,
                boxShadow: "0 10px 26px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: "#64748b" }}>
                    Total ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </div>
                  <div style={{ fontWeight: 1000, fontSize: 22, marginTop: 4 }}>
                    {totalPrice.toFixed(2)} $
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => navigate("/buyer/dashboard")}
                    style={{
                      height: 44,
                      padding: "0 20px",
                      borderRadius: 12,
                      border: "1px solid rgba(15, 23, 42, 0.12)",
                      background: "#fff",
                      color: "#0f172a",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToCheckout}
                    style={{
                      height: 44,
                      padding: "0 24px",
                      borderRadius: 12,
                      border: "none",
                      background: "#0b1220",
                      color: "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;

