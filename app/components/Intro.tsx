"use client";
import { useRef, useState } from "react";
import WarpStars from "./WarpStars";

export default function Intro({ onFinish }: { onFinish: () => void }) {
  const [glitch, setGlitch] = useState(false);
  const [flash, setFlash] = useState(false);
  const [smoke, setSmoke] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleStart = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/intro.mp3");
      audioRef.current.volume = 1;
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    try {
      await audio.play();
    } catch {}

    setGlitch(true);

    const syncEffect = () => {
      if (!audio.duration) {
        requestAnimationFrame(syncEffect);
        return;
      }

      if (audio.currentTime >= audio.duration - 1.3) {
        setFlash(true);
        setSmoke(true);

        setTimeout(() => setFadeOut(true), 200);
        setTimeout(() => onFinish(), 900);
      } else {
        requestAnimationFrame(syncEffect);
      }
    };

    requestAnimationFrame(syncEffect);
  };

  return (
    <div className={`intro-screen ${fadeOut ? "fade-out" : ""}`}>
      
      {/* 🚀 Warp Background */}
      <WarpStars />

      <div className="intro-content">
        <h1 className={`intro-logo ${glitch ? "glitch-active" : ""}`}>
          FLAPPY X 
          <span className="rocket">🚀</span>
        </h1>

        {!glitch && (
          <button className="start-btn" onClick={handleStart}>
            START GAME
          </button>
        )}
      </div>

      {flash && <div className="gun-flash" />}
      {smoke && <div className="smoke-layer" />}
    </div>
  );
}
