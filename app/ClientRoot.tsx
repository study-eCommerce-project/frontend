"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import IntroPage from "./intro/page";

export default function ClientRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // 🔹 인트로 상태
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");
    setShowIntro(seen === "true" ? false : true);
  }, []);

  const handleFinishIntro = () => {
    sessionStorage.setItem("introSeen", "true");
    setShowIntro(false);
  };

  // 인트로 체크 전에는 아무것도 렌더링 금지
  if (showIntro === null) return null;

  // 인트로 표시
  if (showIntro) return <IntroPage onFinish={handleFinishIntro} />;

  return (
    <>
      {!isAdmin && <Header />}

      <div className={`flex-1 bg-gray-100 overflow-x-hidden ${!isAdmin ? "py-16" : ""}`}>
        <div className="mx-auto">{children}</div>
      </div>

      {!isAdmin && <Footer />}
    </>
  );
}
