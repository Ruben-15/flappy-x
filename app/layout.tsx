import "./globals.css";
import Particles from "./components/Particles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flappy X 🚀",
  description: "Ascend Beyond Gravity. One tap. One chance.",
  icons: {
    icon: "/favicon.png",       // make sure this exists in /public
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="animated-bg"></div>
        <Particles />
        {children}
      </body>
    </html>
  );
}
