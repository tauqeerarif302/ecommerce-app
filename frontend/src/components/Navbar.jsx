import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function Navbar({ role }) {
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  const name = localStorage.getItem("name") || "User";
  const initial = name.charAt(0).toUpperCase();

  // Get cart item count from Redux (fallback to 0 if undefined)
  const cartItemCount = useSelector((state) => state.cart?.itemCount || 0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const title = role === "seller" ? "Seller Central" : "Storefront";
  const dashboardPath = role === "seller" ? "/seller/dashboard" : "/buyer/dashboard";

  return (
    <header style={styles.navContainer}>
      <div style={styles.navInner}>
        {/* Left: Brand / Dashboard Link */}
        <Link to={dashboardPath} style={styles.brandLink}>
          <div style={styles.brandIcon}>
            {role === "seller" ? "📈" : "🛍️"}
          </div>
          <span style={styles.brandText}>{title}</span>
        </Link>

        {/* Center: User Greeting Chip */}
        <div style={styles.userChip}>
          <div style={styles.avatar}>{initial}</div>
          <span style={styles.greetingText}>
            Hello, <strong style={styles.userName}>{name}</strong>
          </span>
        </div>

        {/* Right: Actions & Navigation Links */}
        <nav style={styles.navActions}>
          {role === "seller" && (
            <>
              <Link
                to="/seller/orders"
                style={{
                  ...styles.navLink,
                  ...(hoveredLink === "seller-orders" ? styles.navLinkHover : {}),
                }}
                onMouseEnter={() => setHoveredLink("seller-orders")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                Orders
              </Link>
              <Link
                to="/seller/add-product"
                style={{
                  ...styles.primaryNavLink,
                  ...(hoveredLink === "add-prod" ? styles.primaryNavLinkHover : {}),
                }}
                onMouseEnter={() => setHoveredLink("add-prod")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                + Add Product
              </Link>
            </>
          )}

          {role === "buyer" && (
            <>
              <Link
                to="/buyer/orders"
                style={{
                  ...styles.navLink,
                  ...(hoveredLink === "buyer-orders" ? styles.navLinkHover : {}),
                }}
                onMouseEnter={() => setHoveredLink("buyer-orders")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                My Orders
              </Link>

              <Link
                to="/buyer/cart"
                style={{
                  ...styles.cartButton,
                  ...(hoveredLink === "cart" ? styles.cartButtonHover : {}),
                }}
                onMouseEnter={() => setHoveredLink("cart")}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <span style={{ fontSize: 16 }}>🛒</span>
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span style={styles.cartBadge}>
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <div style={styles.divider} />

          <button
            type="button"
            onClick={handleLogout}
            style={{
              ...styles.logoutBtn,
              ...(hoveredLink === "logout" ? styles.logoutBtnHover : {}),
            }}
            onMouseEnter={() => setHoveredLink("logout")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

// Visual Theme & Stylesheet Object
const styles = {
  navContainer: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.03)",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  brandText: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f1f5f9",
    padding: "4px 12px 4px 6px",
    borderRadius: 99,
    border: "1px solid #e2e8f0",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 13,
    color: "#64748b",
  },
  userName: {
    color: "#0f172a",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 14px",
    borderRadius: 10,
    transition: "all 0.15s ease",
  },
  navLinkHover: {
    color: "#0f172a",
    backgroundColor: "#f1f5f9",
  },
  primaryNavLink: {
    textDecoration: "none",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    fontSize: 14,
    fontWeight: 700,
    padding: "8px 14px",
    borderRadius: 10,
    transition: "all 0.15s ease",
  },
  primaryNavLinkHover: {
    backgroundColor: "#dbeafe",
  },
  cartButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 6,
    textDecoration: "none",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    fontSize: 14,
    fontWeight: 700,
    padding: "7px 14px",
    borderRadius: 10,
    transition: "all 0.15s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  cartButtonHover: {
    backgroundColor: "#f8fafc",
    borderColor: "#94a3b8",
  },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ef4444",
    color: "#ffffff",
    borderRadius: 99,
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    fontSize: 11,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
    border: "2px solid #ffffff",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#cbd5e1",
    margin: "0 4px",
  },
  logoutBtn: {
    border: "none",
    backgroundColor: "transparent",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 700,
    padding: "8px 12px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  logoutBtnHover: {
    backgroundColor: "#fef2f2",
  },
};

export default Navbar;