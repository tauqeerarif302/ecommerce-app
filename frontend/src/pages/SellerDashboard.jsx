import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  useDeleteSellerProductMutation,
  useGetSellerDashboardProductsQuery,
} from "../services/sellerApi";

function SellerDashboard() {
  const navigate = useNavigate();
  const PAGE_SIZE = 9;
  const token = localStorage.getItem("token");

  const [deletingProductId, setDeletingProductId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const {
    data,
    isLoading,
    isError,
    error: rtkError,
  } = useGetSellerDashboardProductsQuery({ page, limit: PAGE_SIZE });

  const [deleteSellerProduct] = useDeleteSellerProductMutation();

  void token;

  useEffect(() => {
    if (!token) {
      setError("Session expired. Please login again.");
      setProducts([]);
      return;
    }

    setLoading(isLoading);
    setError(isError ? rtkError?.data?.message || "Failed to load products" : "");

    const rawProducts = data?.products;
    const listArr = Array.isArray(rawProducts)
      ? rawProducts
      : Array.isArray(data)
      ? data
      : [];

    setHasNextPage(listArr.length === PAGE_SIZE);

    const backendTotal = data?.totalProducts;

    setProducts(listArr);
    setTotalProducts(
      typeof backendTotal === "number"
        ? backendTotal
        : listArr.length === 0
        ? 0
        : (page - 1) * PAGE_SIZE + listArr.length
    );
  }, [data, isLoading, isError, rtkError, page, PAGE_SIZE, token]);

  const totalPagesFromBackend = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const computedTotalPages =
    totalProducts === 0 ? (hasNextPage ? page + 1 : page) : totalPagesFromBackend;
  const currentPage = Math.min(page, computedTotalPages);

  const deleteProduct = async (productId) => {
    if (!productId) return;
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      setDeletingProductId(productId);
      setError("");

      await deleteSellerProduct(productId).unwrap();

      setProducts((prev) => prev.filter((p) => (p?._id ?? p?.id) !== productId));
      setTotalProducts((prev) => Math.max(0, prev - 1));

      alert("Product deleted successfully");
    } catch (err) {
      setError(err?.data?.message || err?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar role="seller" />

      <main style={styles.container}>
        {/* Header Section */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>Manage Inventory</h1>
            <p style={styles.subheading}>
              Track performance, edit listings, and update product availability.
            </p>
          </div>

          <div style={styles.headerActions}>
            <div style={styles.countBadge}>
              {loading ? "Updating..." : `${totalProducts} Product(s)`}
            </div>
            <button
              type="button"
              onClick={() => navigate("/seller/add-product")}
              style={styles.addProductBtn}
            >
              + Add New Listing
            </button>
          </div>
        </header>

        {/* Error Alert */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Loading Skeleton Grid */}
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} style={styles.skeletonCard}>
                <div style={styles.skeletonImage} />
                <div style={styles.skeletonText} />
                <div style={{ ...styles.skeletonText, width: "50%" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 800 }}>
              No products found
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: 14 }}>
              You haven't added any items to your shop yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller/add-product")}
              style={styles.emptyStateBtn}
            >
              Create Your First Product
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div style={styles.grid}>
            {products.map((product) => {
              const productId = product?._id ?? product?.id;
              const title = product?.title ?? product?.name ?? "Untitled";
              const description = product?.description ?? "";
              const category = product?.category ?? "";
              const price = product?.price ?? product?.cost ?? "";
              const image = product?.image ?? "";
              const isDeleting = deletingProductId === productId;

              return (
                <div key={productId || title} style={styles.card}>
                  <div style={styles.imageWrapper}>
                    {category && <span style={styles.categoryBadge}>{category}</span>}
                    {image ? (
                      <img src={image} alt={title} style={styles.image} />
                    ) : (
                      <div style={styles.placeholderImg}>No Image Available</div>
                    )}
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h2 style={styles.title} title={title}>
                        {title}
                      </h2>
                      {price !== "" && <div style={styles.priceTag}>${price}</div>}
                    </div>

                    {description && <p style={styles.description}>{description}</p>}

                    <div style={styles.actionGroup}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/seller/add-product", { state: { product } })
                        }
                        style={styles.editBtn}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProduct(productId)}
                        disabled={isDeleting}
                        style={{
                          ...styles.deleteBtn,
                          ...(isDeleting ? styles.deleteBtnDisabled : {}),
                        }}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && computedTotalPages > 1 && (
          <footer style={styles.pagination}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              style={{
                ...styles.pageBtn,
                ...(currentPage <= 1 || loading ? styles.disabledBtn : {}),
              }}
            >
              ← Prev
            </button>

            <div style={styles.pageNumbers}>
              {Array.from({ length: computedTotalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(computedTotalPages, currentPage + 2)
                )
                .map((pnum) => (
                  <button
                    key={pnum}
                    type="button"
                    onClick={() => setPage(pnum)}
                    disabled={loading}
                    style={{
                      ...styles.pageNumberBtn,
                      ...(pnum === currentPage ? styles.activePageNumberBtn : {}),
                    }}
                  >
                    {pnum}
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(computedTotalPages, p + 1))}
              disabled={
                (!hasNextPage && currentPage >= computedTotalPages) || loading
              }
              style={{
                ...styles.pageBtn,
                ...((!hasNextPage && currentPage >= computedTotalPages) || loading
                  ? styles.disabledBtn
                  : {}),
              }}
            >
              Next →
            </button>
          </footer>
        )}
      </main>
    </div>
  );
}

// Visual Theme & Stylesheet Object
const styles = {
  pageWrapper: {
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: "#0f172a",
    paddingBottom: 60,
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subheading: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  countBadge: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "8px 16px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 700,
  },
  addProductBtn: {
    height: 40,
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
  },
  errorBox: {
    marginBottom: 20,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    padding: 14,
    borderRadius: 12,
    color: "#991b1b",
    fontSize: 14,
  },
  emptyState: {
    padding: "60px 20px",
    borderRadius: 16,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    margin: "20px 0",
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyStateBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 190,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholderImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
    color: "#ffffff",
    fontSize: 11,
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    zIndex: 1,
  },
  cardBody: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  priceTag: {
    fontSize: 16,
    fontWeight: 800,
    color: "#059669",
  },
  description: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 1.4,
    marginBottom: 16,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flexGrow: 1,
  },
  actionGroup: {
    display: "flex",
    gap: 8,
    marginTop: "auto",
  },
  editBtn: {
    flex: 1,
    height: 38,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  deleteBtn: {
    flex: 1,
    height: 38,
    border: "none",
    borderRadius: 10,
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  deleteBtnDisabled: {
    background: "#fecaca",
    cursor: "not-allowed",
  },
  pagination: {
    marginTop: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  pageNumbers: {
    display: "flex",
    gap: 6,
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  pageNumberBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  activePageNumberBtn: {
    background: "#0f172a",
    color: "#ffffff",
    borderColor: "#0f172a",
  },
  disabledBtn: {
    background: "#f1f5f9",
    color: "#94a3b8",
    borderColor: "#e2e8f0",
    cursor: "not-allowed",
  },
  skeletonCard: {
    height: 320,
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    padding: 16,
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    background: "#e2e8f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonText: {
    height: 14,
    background: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
  },
};

export default SellerDashboard;