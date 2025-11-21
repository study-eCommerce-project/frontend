// components/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Home } from "lucide-react";

interface SidebarProps {
  active?: string;
}

export default function AdminSidebar({ active }: SidebarProps) {
  const [isProductOpen, setIsProductOpen] = useState(true);

  const linkClasses = (isActive?: boolean) =>
    `block px-4 py-2 rounded cursor-pointer transition-colors ${isActive ? "font-bold bg-gray-700 text-white" : "text-white hover:bg-gray-700"
    }`;

  return (
    <aside className="fixed top-0 left-0 w-52 h-screen bg-gray-800 shadow-sm flex flex-col text-white">

      {/* 로고 영역 */}
      <div className="flex flex-col items-center justify-center py-8 border-b border-gray-700">
        <Link href="/admin" className="cursor-pointer">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={140}
            height={60}
            className="object-contain"
          />
        </Link>
      </div>

      {/* 메뉴 영역 */}
      <nav className="flex-1 flex flex-col space-y-2 p-2 overflow-y-auto">
        {/* 상품 관리 드롭다운 */}
        <div className="border-b border-gray-600 pb-2 mb-2">
          <button
            onClick={() => setIsProductOpen(!isProductOpen)}
            className="w-full text-left flex justify-between items-center font-medium px-4 py-2 rounded cursor-pointer hover:bg-gray-700 transition-colors group"
          >
            상품 관리
            {isProductOpen ? (
              <ChevronUp className="transition-colors group-hover:text-white" size={16} />
            ) : (
              <ChevronDown className="transition-colors group-hover:text-white" size={16} />
            )}
          </button>

          {isProductOpen && (
            <div className="flex flex-col ml-2 mt-1 space-y-1">
              <Link
                href="/admin/productNew"
                className={linkClasses(active === "create")}
              >
                상품 등록
              </Link>
              <Link
                href="/admin/productEdit/1"
                className={linkClasses(active === "edit")}
              >
                상품 수정
              </Link>
            </div>
          )}
        </div>

        {/* 메뉴 목록 */}
        <Link href="/admin/productList" className={linkClasses(active === "list")}>
          상품 목록
        </Link>
        {/* 홈 버튼 */}
        <div className="mt-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2 rounded cursor-pointer"
          >
            <Home size={60} />
          </Link>
        </div>
      </nav>
    </aside>
  );
}
