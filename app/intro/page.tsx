"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const introTexts = [
  "Welcome to My Project",
  "React / Next.js Portfolio",
  "Innovative & Interactive",
  "Let's Dive In 🚀",
];

export default function Intro() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 2000); // 2초마다 텍스트 변경

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentIndex >= introTexts.length) {
      router.push("/"); // 모든 텍스트가 끝나면 Home 이동
    }
  }, [currentIndex, router]);

  return (
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center">
      {currentIndex < introTexts.length && (
        <h1 className="text-white text-4xl md:text-6xl font-bold text-center px-4">
          {introTexts[currentIndex]}
        </h1>
      )}
    </div>
  );
}