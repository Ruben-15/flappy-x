"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomizePage() {
  const router = useRouter();

  const [birdName, setBirdName] = useState("");
  const [birdImage, setBirdImage] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [pipeCount, setPipeCount] = useState(5);

  const [jumpSound, setJumpSound] = useState<string | null>(null);
  const [hitSound, setHitSound] = useState<string | null>(null);
  const [winSound, setWinSound] = useState<string | null>(null);

  const [recordingType, setRecordingType] = useState<string | null>(null);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  /* ================= LOAD ================= */

  useEffect(() => {
    const saved = localStorage.getItem("flappyCustom");
    if (saved) {
      const data = JSON.parse(saved);
      setBirdName(data.name || "");
      setBirdImage(data.image || null);
      setDifficulty(data.difficulty || "easy");
      setPipeCount(Number(data.pipeCount) || 5);
      setJumpSound(data.jumpSound || null);
      setHitSound(data.hitSound || null);
      setWinSound(data.winSound || null);
    }
  }, []);

  /* ================= RECORD ================= */

  const startRecording = async (type: string) => {
    if (recordingType) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();

      reader.onload = () => {
        if (type === "jump") setJumpSound(reader.result as string);
        if (type === "hit") setHitSound(reader.result as string);
        if (type === "win") setWinSound(reader.result as string);
      };

      reader.readAsDataURL(blob);

      stream.getTracks().forEach((track) => track.stop());

      clearInterval(timerRef.current);
      setRecordTime(0);
      setRecordingType(null);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordingType(type);

    timerRef.current = setInterval(() => {
      setRecordTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  /* ================= RESET ================= */

  const handleReset = () => {
    if (!confirm("Reset customization to default?")) return;

    setBirdName("");
    setBirdImage(null);
    setDifficulty("easy");
    setPipeCount(5);
    setJumpSound(null);
    setHitSound(null);
    setWinSound(null);

    localStorage.removeItem("flappyCustom");
  };

  /* ================= SAVE ================= */

  const handleSave = () => {
    localStorage.setItem(
      "flappyCustom",
      JSON.stringify({
        name: birdName,
        image: birdImage,
        difficulty,
        pipeCount,
        jumpSound,
        hitSound,
        winSound,
      })
    );

    router.push("/dashboard");
  };

  /* ================= SOUND CARD ================= */

  const SoundCard = ({ title, sound, type, setSound }: any) => (
    <div className="sound-card">
      <h3>{title}</h3>

      <input
        type="file"
        accept="audio/*"
        onChange={(e: any) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setSound(reader.result as string);
          reader.readAsDataURL(file);
        }}
      />

      <div className="sound-buttons">
        {recordingType === type ? (
          <button className="stop-btn" onClick={stopRecording}>
            ⏹ Stop
          </button>
        ) : (
          <button
            className="record-btn"
            onClick={() => startRecording(type)}
          >
            🎙 Record
          </button>
        )}
      </div>

      {recordingType === type && (
        <div className="recording-indicator">
          <span className="dot"></span>
          Recording... {recordTime}s
        </div>
      )}

      {sound && (
        <div className="audio-preview">
          <audio controls src={sound} />
        </div>
      )}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="customize-container">

      {/* PREMIUM BACK BUTTON */}
   <button
        className="back-btn"
        onClick={() => router.push("/dashboard")}
      >
        ←
      </button>

      <div className="customize-card">

        <h1>🎨 Customize Flappy</h1>

        <div className="top-grid">

          <div className="left-panel">
            <label>Bird Name</label>
            <input
              value={birdName}
              onChange={(e) => setBirdName(e.target.value)}
            />

            <label>Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <label>Pipe Count</label>
            <input
              type="number"
              min={1}
              value={pipeCount}
              onChange={(e) =>
                setPipeCount(Math.max(1, Number(e.target.value)))
              }
            />
          </div>

          <div className="image-section">
            <label>Bird Image</label>

            {birdImage ? (
              <img src={birdImage} />
            ) : (
              <div className="placeholder">No Image</div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e: any) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () =>
                  setBirdImage(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>

        </div>

        <div className="sound-grid">
          <SoundCard title="Jump Sound" sound={jumpSound} type="jump" setSound={setJumpSound} />
          <SoundCard title="Hit Sound" sound={hitSound} type="hit" setSound={setHitSound} />
          <SoundCard title="Win Sound" sound={winSound} type="win" setSound={setWinSound} />
        </div>

        <div className="action-buttons">
          <button className="reset-btn" onClick={handleReset}>
            ♻ Reset
          </button>

          <button className="save-btn" onClick={handleSave}>
            💾 Save Customization
          </button>
        </div>

      </div>
    </div>
  );
}
