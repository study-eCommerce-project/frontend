"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useCart } from "../context/CartContext";   // 장바구니 초기화(로그아웃 시) 위해 필요
import { Search, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import SidebarContent from "./SidebarContent";

export default function Header() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  // 로그인 상태(UserContext), 로그아웃 시 setUser(null) 필요
  const { user, setUser } = useUser();

  // 로그아웃 시 장바구니도 초기화해야 하므로 loadCart 사용
  const { loadCart } = useCart();

  const router = useRouter();

  // 검색어 상태
  const [keyword, setKeyword] = useState("");

  // 사이드 메뉴 열림 상태
  const [menuOpen, setMenuOpen] = useState(false);


  /** --------------------------------------
   * 검색 실행
   * - 검색창 submit 시 실행
   * - query string 으로 /search 페이지 이동
   -------------------------------------- */
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) return;  // 빈 검색어 방지
    router.push(`/search?keyword=${keyword}`);
  };

  /** --------------------------------------
   * 로그아웃 처리
   * - 서버에 로그아웃 요청
   * - UserContext 제거
   * - localStorage user 제거
   * - 장바구니 초기화(loadCart)
   * - 메인 페이지 이동
   -------------------------------------- */
  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",  // 쿠키 포함
      });
    } catch {}

    // 1) 사용자 정보 제거
    setUser(null);                    // 유저 상태 초기화
    localStorage.removeItem("user");  // 로컬스토리지 초기화

    // 2) 장바구니 즉시 초기화
    loadCart();

    // 3) 홈으로 이동
    router.push("/");
  };

  return (
    <>
      {/* --------------------------------------
          상단 고정 헤더(네비게이션 바)
         -------------------------------------- */}
      <header className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white px-6 shadow-md z-50 flex items-center">

        {/* 로고 클릭 → 홈 이동 */}
        <Link href="/" className="flex-shrink-0">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* --------------------------------------
            중앙 검색창
           -------------------------------------- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
          <form onSubmit={handleSearch} className="relative w-full">
            {/* 돋보기 아이콘 */}
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
              <Search size={16} />
            </span>
            {/* 검색 input */}
            <input
              type="text"
              placeholder="Your Daily Journey"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full px-10 py-2 bg-white text-black placeholder-gray-400 rounded-full text-center focus:outline-none"
            />
          </form>
        </div>

        {/* --------------------------------------
            우측 로그인/로그아웃 영역
           -------------------------------------- */}
        <div className="ml-auto flex items-center gap-4 mr-3 text-sm">

          {/* 로그인 상태일 때 */}
          {user ? (
            <>
              {/* 관리자일 경우 관리자 페이지 링크 표시 */}
              {user.role?.trim().toUpperCase() === "ADMIN" && (
                <Link href="/admin" className="hover:text-gray-400">
                  상품 관리
                </Link>
              )}

              {/* 마이페이지 */}
              <Link href="/mypage" className="hover:text-gray-400">
                마이페이지
              </Link>

              {/* 로그아웃 버튼 */}
              <button onClick={handleLogout} className="hover:text-gray-400 cursor-pointer">
                로그아웃
              </button>
            </>
          ) : (
            /* 비로그인 상태일 때 */
            <>
              <Link href="/login" className="hover:text-gray-400">
                로그인
              </Link>
              <Link href="/join" className="hover:text-gray-400">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* --------------------------------------
            햄버거 메뉴 버튼(사이드바)
           -------------------------------------- */}
        <button
          className="w-10 h-10 flex items-center justify-center cursor-pointer z-[999]"
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={24} className="text-white" />
        </button>
      </header>

      {/* --------------------------------------
          사이드바(햄버거 메뉴 클릭 시 오픈)
         -------------------------------------- */}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)}>
        {/* 사이드바 내부 컨텐츠 */}
        <SidebarContent user={user} onClose={() => setMenuOpen(false)} />
      </Sidebar>
    </>
  );
}
