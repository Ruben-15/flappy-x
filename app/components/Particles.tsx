"use client";

import { useEffect, useState } from "react";

type Particle = {
  left: string;
  size: string;
  delay: string;
  duration: string;
  opacity: number;
};

export default function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 60 }).map(() => {
      const depth = Math.random();

      return {
        left: `${Math.random() * 100}%`,
        size: `${depth * 5 + 2}px`,
        delay: `${Math.random() * 10}s`,
        duration: `${15 + depth * 20}s`,
        opacity: 0.3 + depth * 0.7,
      };
    });

    setParticles(generated);
  }, []);

  return (
    <div className="particles-wrapper">
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
