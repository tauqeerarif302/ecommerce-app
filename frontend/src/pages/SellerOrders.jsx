import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  useGetSellerOrdersQuery,
  useUpdateOrderStatusMutation,
} from "../services/sellerApi";

// Status configuration map
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    bg: "#fef3c7",
    color: "#92400e",
    border: "#fde68a",
    dot: "#d97706",
  },
  processing: {
    label: "Processing",
    bg: "#e0f2fe",
    color: "#075985",
    border: "#bae6fd",
    dot: "#0284c7",
  },
  shipped: {
    label: "Shipped",
    bg: "#e0e7ff",
    color: "#3730a3",
    border: "#c7d2fe",
    dot: "#4f46e5",
  },
  delivered: {
    label: "Delivered",
    bg: "#dcfce7",
    color: "#166534",
    border: "#bbf7d0",
    dot: "#16a34a",
  },
  cancelled: {
    label: "Cancelled",
    bg: "#fee2e2",
    color: "#991b1b",
    border: "#fecaca",
    dot: "#dc2626",
  },
};

const NEXT_STATUS = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
};

function SellerOrders() {
  const { data, isLoading, isError, error } = useGetSellerOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState(null);

  const orders = useMemo(() => {
    return Array.isArray(data?.orders) ? data.orders : [];
  }, [data]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus({ orderId, status: newStatus }).unwrap();
    } catch (err) {
      alert(err?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar role="seller" />

      <main style={styles.mainContent}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>Customer Orders</h1>
            <p style={styles.pageSubtitle}>
              Manage and track order fulfillment for your shop
            </p>
          </div>
          {orders.length > 0 && (
            <span style={styles.orderCountBadge}>
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          )}
        </div>

        {/* Error State */}
        {isError && (
          <div style={styles.errorCard}>
            {error?.data?.message || error?.error || "Failed to load orders."}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loadingStack}>
            {[1, 2].map((n) => (
              <div key={n} style={styles.skeletonCard}>
                <div style={styles.skeletonBarShort} />
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={styles.skeletonImage} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={styles.skeletonBarLong} />
                    <div style={styles.skeletonBarShort} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && orders.length === 0 && (
          <div style={styles.emptyCard}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={styles.emptyTitle}>No orders found</h3>
            <p style={styles.emptySubtitle}>
              When customers purchase your items, their order status and delivery info will appear here.
            </p>
          </div>
        )}

        {/* Orders List */}
        {!isLoading && orders.length > 0 && (
          <div style={styles.ordersStack}>
            {orders.map((order) => {
              const prod = order.product || {};
              const buyer = order.buyer || {};
              const status = order.status || "pending";
              const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
              const nextStatus = NEXT_STATUS[status];
              const isUpdatingThis = updatingId === order._id;

              return (
                <article key={order._id} style={styles.orderCard}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <span style={styles.orderDate}>
                      Ordered on {formatDate(order.createdAt)}
                    </span>

                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: cfg.bg,
                        color: cfg.color,
                        borderColor: cfg.border,
                      }}
                    >
                      <span
                        style={{ ...styles.statusDot, backgroundColor: cfg.dot }}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div style={styles.cardBody}>
                    {/* Product Image */}
                    <div style={styles.imageContainer}>
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={prod.title || "Product"}
                          style={styles.productImage}
                        />
                      ) : (
                        <div style={styles.noImage}>No Image</div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div style={styles.contentSection}>
                      <div style={styles.productRow}>
                        <div>
                          <h2 style={styles.productTitle}>
                            {prod.title || "Untitled Product"}
                          </h2>
                          {prod.category && (
                            <span style={styles.productCategory}>
                              {prod.category}
                            </span>
                          )}
                        </div>

                        <div style={styles.financialSummary}>
                          <div style={styles.totalPrice}>
                            ${Number(order.total_price || 0).toFixed(2)}
                          </div>
                          <div style={styles.unitPrice}>
                            {order.quantity || 1} × ${Number(prod.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Buyer Details */}
                      <div style={styles.buyerBox}>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>
                          Buyer: {buyer.fullName || buyer.name || "Unknown"}
                        </div>
                        <div style={{ color: "#64748b" }}>
                          Email: {buyer.email || "N/A"}
                        </div>
                      </div>

                      {/* Delivery Address Details */}
                      {(order.delivery_address || order.name || order.phone) && (
                        <div style={styles.shippingSection}>
                          <div style={styles.shippingTitle}>Shipping Address</div>
                          {order.name && <div>{order.name}</div>}
                          {order.delivery_address && (
                            <div style={{ color: "#64748b" }}>
                              {order.delivery_address}
                            </div>
                          )}
                          {order.phone && (
                            <div style={{ color: "#64748b" }}>
                              Ph: {order.phone}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Button */}
                      {nextStatus && (
                        <div style={styles.actionRow}>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusUpdate(order._id, nextStatus)
                            }
                            disabled={isUpdatingThis}
                            style={{
                              ...styles.actionButton,
                              opacity: isUpdatingThis ? 0.6 : 1,
                              cursor: isUpdatingThis ? "not-allowed" : "pointer",
                            }}
                          >
                            {isUpdatingThis
                              ? "Updating Status..."
                              : `Mark as ${
                                  nextStatus.charAt(0).toUpperCase() +
                                  nextStatus.slice(1)
                                }`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// Visual style objects
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingBottom: 48,
  },
  mainContent: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "32px 16px 0",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  orderCountBadge: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    fontSize: 12,
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: 20,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 20,
  },
  loadingStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  skeletonCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  skeletonBarShort: {
    height: 12,
    width: "30%",
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  skeletonBarLong: {
    height: 14,
    width: "70%",
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  emptyCard: {
    textAlign: "center",
    padding: "48px 16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
  },
  emptySubtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#64748b",
  },
  ordersStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    marginBottom: 16,
    borderBottom: "1px solid #f1f5f9",
  },
  orderDate: {
    fontSize: 12,
    fontWeight: 600,
    color: "#64748b",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
  },
  cardBody: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  imageContainer: {
    width: 84,
    height: 84,
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #f1f5f9",
    backgroundColor: "#f8fafc",
    flexShrink: 0,
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: 600,
  },
  contentSection: {
    flex: 1,
    minWidth: 200,
  },
  productRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  productTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  productCategory: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 500,
  },
  financialSummary: {
    textAlign: "right",
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },
  unitPrice: {
    fontSize: 12,
    color: "#64748b",
  },
  buyerBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    fontSize: 12,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  shippingSection: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 1.4,
  },
  shippingTitle: {
    fontWeight: 700,
    color: "#334155",
    marginBottom: 2,
  },
  actionRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "flex-end",
  },
  actionButton: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "none",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 12,
    transition: "background-color 0.15s ease",
  },
};

export default SellerOrders;