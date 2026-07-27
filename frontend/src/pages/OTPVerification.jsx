import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useVerifyOtpMutation } from "../services/authApi";


function OTPVerification() {
  const [verifyOtp] = useVerifyOtpMutation();

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyOtp({ email, otp }).unwrap();


      alert(res.message);


      navigate("/login");

    } catch (error) {
      alert(error?.data?.message || "OTP Verification Failed");
    }

  };

  return (
    <div className="container">
      <h1>OTP Verification</h1>

      <p className="email-text">
        <strong>Email:</strong> {email}
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button type="submit">
          Verify OTP
        </button>
      </form>
    </div>
  );
}

export default OTPVerification;