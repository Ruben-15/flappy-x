"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  const pipesRef = useRef<any[]>([]);
  const createdRef = useRef(0);
  const scoreRef = useRef(0);
  const playerRef = useRef<any>(null);

  /* ================= CUSTOM DATA ================= */

  const [customData, setCustomData] = useState<any>(null);
  const birdImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flappyCustom");
    if (saved) {
      const data = JSON.parse(saved);
      setCustomData(data);

      if (data.image) {
        const img = new Image();
        img.src = data.image;
        birdImageRef.current = img;
      }
    }
  }, []);

  /* ================= SOUND SYSTEM ================= */

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playDefaultSound = (
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.2
  ) => {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const playCustomAudio = (src: string | null, fallback: () => void) => {
    if (src) {
      const audio = new Audio(src);
      audio.play();
    } else {
      fallback();
    }
  };

  /* ================= STATE ================= */

  const [score, setScore] = useState(0);
  const [topScore, setTopScore] = useState(0);
  const [gameState, setGameState] = useState<
    "countdown" | "playing" | "paused" | "gameover" | "win"
  >("countdown");

  const [countdown, setCountdown] = useState(3);

  /* ================= TOP SCORE ================= */

  useEffect(() => {
    if (mode === "default") {
      const saved = localStorage.getItem("flappyTopScore");
      if (saved) setTopScore(Number(saved));
    }
  }, [mode]);

  /* ================= COUNTDOWN ================= */

  useEffect(() => {
    if (gameState !== "countdown") return;

    if (countdown === 0) {
      setTimeout(() => setGameState("playing"), 400);
      return;
    }

    const t = setTimeout(() => {
      playDefaultSound(600 + countdown * 150, 0.15);
      setCountdown((c) => c - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [countdown, gameState]);

  /* ================= GAME ENGINE ================= */

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let pipeGap = 260;
    let pipeSpeed = 180;

    if (customData?.difficulty === "easy") {
      pipeGap = 380;
      pipeSpeed = 150;
    }
    if (customData?.difficulty === "medium") {
      pipeGap = 260;
      pipeSpeed = 210;
    }
    if (customData?.difficulty === "hard") {
      pipeGap = 180;
      pipeSpeed = 270;
    }

    let maxPipes = Infinity;
    if (mode === "custom" && customData?.pipeCount) {
      maxPipes = Number(customData.pipeCount);
    }

if (!playerRef.current) {
      playerRef.current = {
        x: canvas.width / 4,
        y: canvas.height / 2,
        r: 18,
        velocity: 0,
        gravity: 1200,
        lift: -420,
      };

      pipesRef.current = [];
      createdRef.current = 0;
      scoreRef.current = 0;
      setScore(0);
    }

    const player = playerRef.current;
    const pipeWidth = 70;

    const createPipe = () => {
      if (createdRef.current >= maxPipes) return;

      const top =
        Math.random() * (canvas.height - pipeGap - 200) + 100;

      pipesRef.current.push({
        x: canvas.width,
        top,
        bottom: canvas.height - top - pipeGap,
        passed: false,
      });

      createdRef.current++;
    };

    const update = (time: number) => {
      if (!runningRef.current) return;

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      /* PLAYER */
      player.velocity += player.gravity * delta;
      player.y += player.velocity * delta;

      if (birdImageRef.current) {
        ctx.drawImage(
          birdImageRef.current,
          player.x - player.r,
          player.y - player.r,
          player.r * 2,
          player.r * 2
        );
      } else {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
        ctx.fillStyle = "#00ffe0";
        ctx.fill();
      }

      /* SPAWN */
      if (
        pipesRef.current.length === 0 ||
        pipesRef.current[pipesRef.current.length - 1].x <
          canvas.width - 250
      ) {
        createPipe();
      }

      /* PIPES */
      pipesRef.current.forEach((p, i) => {
        p.x -= pipeSpeed * delta;

        ctx.fillStyle = "#1e90ff";
        ctx.fillRect(p.x, 0, pipeWidth, p.top);
        ctx.fillRect(
          p.x,
          canvas.height - p.bottom,
          pipeWidth,
          p.bottom
        );

        if (!p.passed && p.x + pipeWidth < player.x) {
          p.passed = true;
          scoreRef.current++;
          setScore(scoreRef.current);

          playCustomAudio(
            customData?.jumpSound,
            () => playDefaultSound(900, 0.07, "square", 0.2)
          );
        }

        const hit =
          player.x + player.r > p.x &&
          player.x - player.r < p.x + pipeWidth &&
          (player.y - player.r < p.top ||
            player.y + player.r >
              canvas.height - p.bottom);

        if (hit) {
          playCustomAudio(
            customData?.hitSound,
            () => playDefaultSound(120, 0.4, "sawtooth", 0.4)
          );
          return endGame("gameover");
        }

        if (p.x + pipeWidth < 0) pipesRef.current.splice(i, 1);
      });

      if (
        player.y + player.r > canvas.height ||
        player.y - player.r < 0
      ) {
        playCustomAudio(
          customData?.hitSound,
          () => playDefaultSound(120, 0.4, "sawtooth", 0.4)
        );
        return endGame("gameover");
      }

      if (
        mode === "custom" &&
        maxPipes > 0 &&
        createdRef.current >= maxPipes &&
        pipesRef.current.length === 0
      ) {
        playCustomAudio(
          customData?.winSound,
          () => playDefaultSound(1000, 0.3, "triangle", 0.3)
        );
        return endGame("win");
      }

      animationRef.current = requestAnimationFrame(update);
    };

    const endGame = (state: "gameover" | "win") => {
      runningRef.current = false;
      if (animationRef.current)
        cancelAnimationFrame(animationRef.current);
      setGameState(state);
    };

    const jump = () => {
      if (!runningRef.current) return;
      player.velocity = player.lift;

      playCustomAudio(
        customData?.jumpSound,
        () => playDefaultSound(800, 0.05, "triangle", 0.3)
      );
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        runningRef.current = false;
        if (animationRef.current)
          cancelAnimationFrame(animationRef.current);
        setGameState("paused");
        return;
      }
      jump();
    };

    window.addEventListener("keydown", keyHandler);
    window.addEventListener("click", jump);

    if (gameState === "playing") {
      runningRef.current = true;
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(update);
    }

    return () => {
      if (animationRef.current)
        cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener("click", jump);
    };
  }, [gameState, mode, customData]);

  /* ================= CONTINUE ================= */

  const handleContinue = () => {
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    setGameState("playing");
  };

  /* ================= UI ================= */

  const Overlay = ({ title }: { title: string }) => (
    <div className="overlay">
      <h1>{title}</h1>
      <p>Score: {score}</p>
      {mode === "default" && <p>Top Score: {topScore}</p>}

      {gameState === "paused" && (
        <button onClick={handleContinue}>Continue</button>
      )}

      <button onClick={() => window.location.reload()}>
        Restart
      </button>
      <button onClick={() => router.push("/dashboard")}>
        Go To Menu
      </button>
    </div>
  );

  return (
    <div className="game-wrapper">
      <canvas ref={canvasRef} />
      <div className="score">Score: {score}</div>

      {mode === "default" && (
        <div style={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "#fff",
          fontWeight: "bold"
        }}>
          Top: {topScore}
        </div>
      )}

      {gameState === "countdown" && (
        <div className="overlay">
          <h1 style={{ fontSize: "110px" }}>
            {countdown === 0 ? "GO!" : countdown}
          </h1>
        </div>
      )}

      {gameState === "paused" && <Overlay title="Paused" />}
      {gameState === "gameover" && <Overlay title="Game Over 🚀" />}
      {gameState === "win" && <Overlay title="YOU WON 🏆" />}
    </div>
  );
}
