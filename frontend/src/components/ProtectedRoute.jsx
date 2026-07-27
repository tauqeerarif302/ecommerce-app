import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {

  // LocalStorage se data lena
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Token check
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  // Sab theek hai
  return children;
}

export default ProtectedRoute;