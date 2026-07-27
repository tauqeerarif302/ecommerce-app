import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useGetOrdersQuery } from "../services/checkoutApi";

const statusColors = {
  pending: { bg: "#fef3c7", color: "#92400e" },
  processing: { bg: "#dbeafe", color: "#1e40af" },
  shipped: { bg: "#e0e7ff", color: "#3730a3" },
  delivered: { bg: "#dcfce7", color: "#166534" },
  cancelled: { bg: "#fee2e2", color: "#991b1b" },
};

function BuyerOrders() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetOrdersQuery();

  const orders = useMemo(() => {
    if (data?.orders && Array.isArray(data.orders)) return data.orders;
    return [];
  }, [data]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalOrders = orders.length;

  return (
    <div>
      <Navbar role="buyer" />
      <div style={{ maxWidth: 900, margin: "16px auto", padding: "0 16px" }}>
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: 950 }}>My Orders</h2>
            <div style={{ color: "#64748b", fontWeight: 700, marginTop: 4 }}>
              {isLoading
                ? "Loading..."
                : `${totalOrders} order${totalOrders !== 1 ? "s" : ""}`}
            </div>
          </div>

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
            Browse Products
          </button>
        </div>

        {/* Error State */}
        {isError && (
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              border: "1px solid rgba(239, 68, 68, 0.3)",
              background: "#fff",
              color: "#ef4444",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {error?.data?.message || error?.error || "Failed to load orders"}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
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
            Loading your orders...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && orders.length === 0 && (
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
            You haven't placed any orders yet.
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
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {orders.map((order) => {
              const prod = order.product || {};
              const seller = order.seller || {};
              const status = order.status || "pending";
              const colors = statusColors[status] || {
                bg: "#f1f5f9",
                color: "#475569",
              };

              return (
                <div
                  key={order._id}
                  style={{
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
                      marginBottom: 12,
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{ fontWeight: 700, fontSize: 12, color: "#64748b" }}
                    >
                      Ordered on {formatDate(order.createdAt)}
                    </div>
                    <div
                      style={{
                        background: colors.bg,
                        color: colors.color,
                        padding: "4px 10px",
                        borderRadius: 20,
                        fontWeight: 800,
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {status}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 10,
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.title || "Product"}
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
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          No Img
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 900, marginBottom: 4 }}>
                        {prod.title || "Product"}
                      </div>
                      {prod.category && (
                        <div
                          style={{
                            color: "grey",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {prod.category}
                        </div>
                      )}
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 12,
                          color: "#64748b",
                          marginTop: 4,
                        }}
                      >
                        Seller: {seller.fullName || seller.name || "Unknown Seller"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          marginTop: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          Qty: <strong>{order.quantity || 1}</strong>
                        </div>
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          Price:{" "}
                          <strong>
                            ${Number(prod.price || 0).toFixed(2)}
                          </strong>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 950,
                            color: "#0f172a",
                          }}
                        >
                          Total:{" "}
                          <strong>
                            ${Number(order.total_price || 0).toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      {(order.delivery_address ||
                        order.name ||
                        order.phone) && (
                        <div
                          style={{
                            marginTop: 12,
                            paddingTop: 12,
                            borderTop: "1px solid rgba(15, 23, 42, 0.08)",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 12,
                              color: "#64748b",
                              marginBottom: 6,
                            }}
                          >
                            Delivery Details
                          </div>
                          {order.name && (
                            <div style={{ fontSize: 13, color: "#475569" }}>
                              Name: {order.name}
                            </div>
                          )}
                          {order.delivery_address && (
                            <div style={{ fontSize: 13, color: "#475569" }}>
                              Address: {order.delivery_address}
                            </div>
                          )}
                          {order.phone && (
                            <div style={{ fontSize: 13, color: "#475569" }}>
                              Phone: {order.phone}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerOrders;