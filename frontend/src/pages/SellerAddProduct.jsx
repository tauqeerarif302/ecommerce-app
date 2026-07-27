import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

import {
  useAddSellerProductMutation,
  useUpdateSellerProductMutation,
} from "../services/sellerApi";

function SellerAddProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  const editProduct = location.state?.product || null;
  const isEditMode = !!editProduct;

  const [addSellerProduct] = useAddSellerProductMutation();
  const [updateSellerProduct] = useUpdateSellerProductMutation();

  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState(editProduct?.image || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setFormData({
        title: editProduct.title || "",
        description: editProduct.description || "",
        category: editProduct.category || "",
        price: editProduct.price || "",
        image: null,
      });
      if (editProduct.image) {
        setPreviewUrl(editProduct.image);
      }
    }
  }, [editProduct]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);

    if (formData.image) {
      data.append("image", formData.image);
    }

    data.append("token", token);

    try {
      setSubmitting(true);

      let res;
      if (isEditMode) {
        res = await updateSellerProduct({
          productId: editProduct._id,
          formData: data,
        }).unwrap();
      } else {
        res = await addSellerProduct(data).unwrap();
      }

      alert(
        res?.message ||
          (isEditMode
            ? "Product updated successfully!"
            : "Product added successfully!")
      );
      setFormData({ title: "", description: "", category: "", price: "", image: null });
      navigate("/seller/dashboard");
    } catch (error) {
      alert(
        error?.data?.message ||
          error?.response?.data?.message ||
          (isEditMode ? "Update failed" : "Submission failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Navbar rendered cleanly at top level */}
      <Navbar role="seller" />

      <main style={styles.container}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.heading}>
              {isEditMode ? "Edit Product Listing" : "Add New Product"}
            </h1>
            <p style={styles.subheading}>
              {isEditMode
                ? "Update your item details, pricing, and imagery."
                : "Fill out the information below to add an item to your storefront."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} encType="multipart/form-data" style={styles.form}>
            {/* Title Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="title" style={styles.label}>
                Product Title <span style={styles.requiredStar}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Handmade Ceramic Mug"
                value={formData.title}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            {/* Category & Price Row */}
            <div style={styles.row}>
              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label htmlFor="category" style={styles.label}>
                  Category <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  placeholder="e.g. Home & Kitchen"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={{ ...styles.fieldGroup, flex: 1 }}>
                <label htmlFor="price" style={styles.label}>
                  Price ($) <span style={styles.requiredStar}>*</span>
                </label>
                <div style={styles.priceInputWrapper}>
                  <span style={styles.currencySymbol}>$</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="29.99"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    style={{ ...styles.input, paddingLeft: 28 }}
                  />
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="description" style={styles.label}>
                Description <span style={styles.requiredStar}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your item, features, dimensions, materials, etc."
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                style={styles.textarea}
              />
            </div>

            {/* Image Upload Field */}
            <div style={styles.fieldGroup}>
              <label htmlFor="image" style={styles.label}>
                Product Image{" "}
                {isEditMode ? (
                  <span style={styles.optionalText}>(Optional: Leave empty to keep current)</span>
                ) : (
                  <span style={styles.requiredStar}>*</span>
                )}
              </label>

              <div style={styles.fileUploadBox}>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  required={!isEditMode && !previewUrl}
                  onChange={handleImageChange}
                  style={styles.fileInput}
                />
                <div style={styles.fileUploadLabel}>
                  <span style={{ fontSize: 24 }}>🖼️</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    Click to select an image
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    PNG, JPG, or WEBP formats allowed
                  </span>
                </div>
              </div>

              {/* Image Preview Window */}
              {previewUrl && (
                <div style={styles.previewContainer}>
                  <span style={styles.previewLabel}>Preview Image:</span>
                  <img src={previewUrl} alt="Product Preview" style={styles.previewImage} />
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  ...(submitting ? styles.submitBtnDisabled : {}),
                }}
              >
                {submitting
                  ? isEditMode
                    ? "Updating Listing..."
                    : "Adding Product..."
                  : isEditMode
                  ? "Update Product"
                  : "Publish Product"}
              </button>
            </div>
          </form>
        </div>
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
    maxWidth: 640,
    margin: "32px auto",
    padding: "0 20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: 20,
    border: "1px solid #e2e8f0",
    padding: 32,
    boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
  },
  header: {
    marginBottom: 28,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  subheading: {
    margin: "6px 0 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 6,
  },
  requiredStar: {
    color: "#ef4444",
  },
  optionalText: {
    color: "#64748b",
    fontWeight: 500,
  },
  input: {
    height: 42,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    transition: "border-color 0.15s ease",
  },
  priceInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  currencySymbol: {
    position: "absolute",
    left: 12,
    color: "#64748b",
    fontWeight: 700,
    fontSize: 14,
    pointerEvents: "none",
  },
  textarea: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    fontSize: 14,
    outline: "none",
    color: "#0f172a",
    fontFamily: "inherit",
    resize: "vertical",
  },
  fileUploadBox: {
    position: "relative",
    border: "2px dashed #cbd5e1",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#f8fafc",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s ease",
  },
  fileInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  fileUploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    pointerEvents: "none",
  },
  previewContainer: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
  },
  previewImage: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    height: 44,
    padding: "0 20px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  submitBtn: {
    height: 44,
    padding: "0 24px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
  },
  submitBtnDisabled: {
    background: "#93c5fd",
    cursor: "not-allowed",
  },
};

export default SellerAddProduct;