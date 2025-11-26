"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";   // 🔥 반드시 추가
import { Search, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import SidebarContent from "./SidebarContent";

export default function Header() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const { user, setUser } = useUser();
  const { loadCart } = useCart();   // 🔥 장바구니 초기화용
  const router = useRouter();

  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?keyword=${keyword}`);
  };

  // 🔥 중복 선언 제거됨
  // const { setUser } = useUser();  ← 이거 삭제!
  // const { loadCart } = useCart(); ← 위에 이미 있음

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    // 1) 사용자 정보 제거
    setUser(null);
    localStorage.removeItem("user");

    // 2) 장바구니 즉시 초기화
    loadCart();

    // 3) 홈으로 이동
    router.push("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white px-6 shadow-md z-50 flex items-center">

        {/* 로고 */}
        <Link href="/" className="flex-shrink-0">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* 검색창 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Your Daily Journey"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-10 py-2 bg-white text-black placeholder-gray-400 rounded-full text-center focus:outline-none"
            />
          </form>
        </div>

        {/* 로그인 / 회원가입 */}
        <div className="ml-auto flex items-center gap-4 mr-3 text-sm">
          {user ? (
            <>
              {user.role?.trim().toUpperCase() === "ADMIN" && (
                <Link href="/admin" className="hover:text-gray-300">
                  상품 관리
                </Link>
              )}

              <Link href="/mypage" className="hover:text-gray-300">
                마이페이지
              </Link>

              <button onClick={handleLogout} className="hover:text-gray-300 cursor-pointer">
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-gray-300">
                로그인
              </Link>
              <Link href="/signup" className="hover:text-gray-300">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* 햄버거 버튼 */}
        <button
          className="w-10 h-10 flex items-center justify-center cursor-pointer z-[999]"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} className="text-white" />
        </button>
      </header>

      {/* 사이드바 */}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)}>
        <SidebarContent user={user} onClose={() => setMenuOpen(false)} />
      </Sidebar>
    </>
  );
}
