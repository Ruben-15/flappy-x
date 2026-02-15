"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Settings() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(true);
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setEmail(session.user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();

      if (data) setName(data.name);

      // Load theme from localStorage
      const theme = localStorage.getItem("theme");
      if (theme === "light") {
        document.body.classList.add("light-mode");
        setDarkMode(false);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    }
    setDarkMode(!darkMode);
  };

  const updateProfile = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    await supabase
      .from("profiles")
      .update({ name })
      .eq("id", session.user.id);

    alert("Profile Updated 🚀");
  };

  if (loading) {
    return <div className="settings-loading">Loading...</div>;
  }

  return (
  <>
    {/* 🔙 FIXED BACK BUTTON — OUTSIDE WRAPPER */}
    <button
      className="premium-back-btn"
      onClick={() => router.push("/dashboard")}
    >
      ←
    </button>

    <div className="settings-wrapper">
      <h1 className="settings-heading">⚙ Settings</h1>

      {/* Profile */}
      <div className="settings-card">
        <h2>👤 Profile</h2>

        <label>Email</label>
        <input value={email} disabled />

        <label>Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="premium-btn" onClick={updateProfile}>
          Save Changes
        </button>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <h2>🎮 Preferences</h2>

        <div className="toggle-row">
          <span>Dark Mode</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <span>Game Sound</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={sound}
              onChange={() => setSound(!sound)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="toggle-row">
          <span>Notifications</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="settings-card">
        <h2>🔐 Security</h2>

        <button
          className="premium-btn"
          onClick={() => router.push("/reset-password")}
        >
          Change Password
        </button>
      </div>

      {/* Danger */}
      <div className="settings-card danger">
        <h2>⚠ Danger Zone</h2>
        <button className="danger-btn">
          Delete Account
        </button>
      </div>
    </div>
  </>
);

}
