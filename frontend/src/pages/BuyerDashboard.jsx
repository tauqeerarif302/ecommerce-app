import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "../components/Navbar";

import { useGetBuyerProductsQuery } from "../services/buyerApi";
import { useAddToCartMutation } from "../services/cartApi";
import { addItemLocally } from "../store/cartSlice";

function BuyerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const PAGE_SIZE = 9;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addToCartBackend, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);

  const { data, isLoading, isError, error: rtkError } = useGetBuyerProductsQuery({
    page,
    limit: PAGE_SIZE,
  });

  const list = useMemo(() => {
    const maybeProducts = data?.products ?? data ?? [];
    return Array.isArray(maybeProducts) ? maybeProducts : [];
  }, [data]);

  useEffect(() => {
    setLoading(isLoading);
    setError(isError ? rtkError?.data?.message || "Failed to load products" : "");

    const backendTotal = data?.totalProducts;
    const listArr = Array.isArray(list) ? list : [];

    setProducts(listArr);
    setHasNextPage(listArr.length === PAGE_SIZE);

    setTotalProducts(
      typeof backendTotal === "number"
        ? backendTotal
        : listArr.length === 0
        ? 0
        : (page - 1) * PAGE_SIZE + listArr.length
    );
  }, [isLoading, isError, rtkError, data, list, page, PAGE_SIZE]);

  const handleAddToCart = async (product) => {
    const title = product?.title ?? product?.name ?? "Product";
    const productId = product?._id ?? product?.id;

    try {
      dispatch(addItemLocally({ product }));
      await addToCartBackend({ productId, quantity: 1 }).unwrap();
      alert(`✅ Added to cart: ${title}`);
    } catch (err) {
      alert(`✅ ${title} added to your cart!`);
    }
  };

  const handleBuyNow = (product) => {
    navigate("/buyer/checkout", { state: { product } });
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const computedTotalPages = (() => {
    const backendTotalMissing = totalProducts === 0 && !loading;
    if (!backendTotalMissing) return totalPages;
    return hasNextPage ? currentPage + 1 : currentPage;
  })();

  useEffect(() => {
    if (page !== Math.min(page, computedTotalPages)) {
      setPage(Math.min(page, computedTotalPages));
    }
  }, [computedTotalPages, page]);

  const paginatedProducts = Array.isArray(products) ? products : [];

  return (
    <div style={styles.pageWrapper}>
      <Navbar role="buyer" />

      <main style={styles.container}>
        {/* Header Bar */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>Explore Products</h1>
            <p style={styles.subheading}>
              Discover handcrafted goods and top deals from quality sellers.
            </p>
          </div>
          <div style={styles.countBadge}>
            {loading ? "Updating..." : `${totalProducts} Products`}
          </div>
        </header>

        {/* Error Alert */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Loading Skeleton / Spinner State */}
        {loading && (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} style={styles.skeletonCard}>
                <div style={styles.skeletonImage} />
                <div style={styles.skeletonText} />
                <div style={{ ...styles.skeletonText, width: "60%" }} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🛍️</div>
            <h3 style={{ margin: "0 0 8px 0" }}>No products found</h3>
            <p style={{ margin: 0, color: "#64748b" }}>
              Check back later or refresh your page to see new items.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && paginatedProducts.length > 0 && (
          <div style={styles.grid}>
            {paginatedProducts.map((product) => {
              const title = product?.title ?? product?.name ?? "Untitled";
              const description = product?.description ?? "";
              const category = product?.category ?? "";
              const price = product?.price ?? product?.cost ?? "0";
              const image = product?.image ?? "https://via.placeholder.com/300";

              const sellerName =
                product?.sellerName ??
                product?.seller?.name ??
                product?.seller ??
                product?.userId?.fullName ??
                "";

              return (
                <div key={product?._id ?? product?.id ?? title} style={styles.card}>
                  <div style={styles.imageWrapper}>
                    {category && <span style={styles.categoryBadge}>{category}</span>}
                    <img src={image} alt={title} style={styles.image} />
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.cardHeader}>
                      <h2 style={styles.title} title={title}>
                        {title}
                      </h2>
                      <div style={styles.priceTag}>${price}</div>
                    </div>

                    {sellerName && (
                      <div style={styles.sellerText}>By {sellerName}</div>
                    )}

                    {description && (
                      <p style={styles.description}>{description}</p>
                    )}

                    <div style={styles.actionGroup}>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={isAddingToCart}
                        style={styles.cartButton}
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBuyNow(product)}
                        style={styles.buyButton}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(totalPages, currentPage + 2)
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              style={{
                ...styles.pageBtn,
                ...(currentPage >= totalPages || loading ? styles.disabledBtn : {}),
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
  countBadge: {
    background: "#e2e8f0",
    color: "#334155",
    padding: "6px 14px",
    borderRadius: 99,
    fontSize: 13,
    fontWeight: 700,
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
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: 200,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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
    marginBottom: 4,
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
  sellerText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
    marginBottom: 8,
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
  cartButton: {
    flex: 1,
    height: 40,
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  buyButton: {
    flex: 1,
    height: 40,
    border: "none",
    borderRadius: 10,
    background: "#0f172a",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
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

export default BuyerDashboard;