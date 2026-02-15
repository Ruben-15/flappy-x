"use client";

import { useEffect, useState } from "react";

type Star = {
  left: string;
  delay: string;
  duration: string;
  size: string;
};

export default function WarpStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 120 }).map(() => {
      const depth = Math.random();

      return {
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${0.6 + depth * 1.2}s`,
        size: `${1 + depth * 3}px`,
      };
    });

    setStars(generated);
  }, []);

  return (
    <div className="warp-container">
      {stars.map((star, i) => (
        <span
          key={i}
          className="warp-star"
          style={{
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
    </div>
  );
}
