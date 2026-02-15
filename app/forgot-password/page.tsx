"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      alert("Enter your email");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/update-password",
      });

      if (error) throw error;

      alert("Password reset link sent to your email.");
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-wrapper">
      <div className="card">
        <h1 className="title">Reset Password 🔑</h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button onClick={handleReset} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {/* 🔥 Back to Login */}
        <p
          style={{
            marginTop: "15px",
            cursor: "pointer",
            color: "#00ffe0",
            fontSize: "14px",
          }}
          onClick={() => router.push("/login")}
        >
          ← Back to Login
        </p>
      </div>
    </div>
  );
}
