"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // /admin으로 시작하면 관리자 페이지
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {/* 관리자 페이지가 아닐 때만 Header 출력 */}
      {!isAdmin && <Header />}

      <main className={`flex-1 bg-gray-100 overflow-x-hidden ${!isAdmin ? "py-16" : ""}`}>
        <div className="mx-auto">{children}</div>
      </main>

      {/* 관리자 페이지가 아닐 때만 Footer 출력 */}
      {!isAdmin && <Footer />}
    </>
  );
}
