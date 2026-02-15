"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [flappySettings, setFlappySettings] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUserEmail(session.user.email || "");

      const saved = localStorage.getItem("flappyCustom");
      if (saved) {
        setFlappySettings(JSON.parse(saved));
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">

      {/* ================= TOPBAR ================= */}
      <div className="topbar">
        <div className="logo">
          FLAPPY X <span className="rocket">🚀</span>
        </div>

        <div className="profile-wrapper">
          <div
            className="profile-avatar"
            onClick={() => setShowMenu(!showMenu)}
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>

          {showMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                {userEmail}
              </div>

              <div
                className="dropdown-item"
                onClick={() => router.push("/settings")}
              >
                ⚙ Settings
              </div>

              <div
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= HERO ================= */}
      <div className="dashboard-main">

        <h1 className="hero-title">
          Ascend Beyond Gravity ⚡
        </h1>

        <p className="hero-subtitle">
          One tap. One chance. Become unstoppable.
        </p>

        {/* DEFAULT PLAY */}
        <button
          className="btn-primary"
          onClick={() => router.push("/game?mode=default")}
        >
          ▶ Play Classic Mode
        </button>

        {/* CUSTOMIZE BUTTON */}
        <button
          className="btn-outline"
          onClick={() => router.push("/customize")}
        >
          🎨 Customize Your Flappy
        </button>

        {/* CUSTOM PLAY BUTTON */}
        {flappySettings?.name && (
          <button
            className="btn-gold"
            onClick={() => router.push("/game?mode=custom")}
          >
            ⭐ Play As {flappySettings.name}
          </button>
        )}

        {/* ABOUT BUTTON */}
        <button
          className="btn-outline"
          onClick={() => setShowAbout(true)}
        >
          ℹ About Flappy X
        </button>

      </div>

      {/* ================= ABOUT MODAL ================= */}
      {showAbout && (
        <div className="about-overlay">
          <div className="about-modal">

            <h2>About Flappy X 🚀</h2>

            <p>
              Flappy X is a modern neon-style arcade experience
              inspired by the legendary Flappy gameplay.
            </p>

            <p>
              Built using Next.js, Supabase authentication,
              and custom physics for smooth, responsive controls.
            </p>

            <div className="about-dev">
              <h3>Developer</h3>
              <p><strong>Ruben Koshy</strong></p>
              <p>📧 rubenkoshy30@gmail.com</p>
            </div>

            <button
              className="btn-primary"
              onClick={() => setShowAbout(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
