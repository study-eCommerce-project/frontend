"use client";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function ClientRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

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
