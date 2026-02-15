"use client";

import { useState } from "react";
import Intro from "./components/Intro";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro ? (
        <Intro onFinish={() => router.push("/login")} />
      ) : null}
    </>
  );
}
