"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    if (loading) return;

    setErrorMsg("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirm.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirm) {
      setErrorMsg("All fields are required");
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: data.user.id,
              name: trimmedName,
            },
          ]);

        if (profileError) {
          console.error(profileError.message);
        }
      }

      await supabase.auth.signOut();

      setSuccess(true);

      // Auto redirect after 2.5 sec
      setTimeout(() => {
        router.push("/login");
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-wrapper">
      <div className="card">

        {success && (
          <div className="success-banner">
            ✅ Your account was successfully created!
          </div>
        )}

        {errorMsg && (
          <div className="error-banner">
            ⚠ {errorMsg}
          </div>
        )}

        <h1 className="title">Register 📝</h1>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={handleRegister} disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>

        <p
          style={{ marginTop: "15px", cursor: "pointer" }}
          onClick={() => router.push("/login")}
        >
          Already have account? Login
        </p>
      </div>
    </div>
  );
}
