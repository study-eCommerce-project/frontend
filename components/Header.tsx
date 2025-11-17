"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { Search } from "lucide-react";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    router.push(`/search?keyword=${keyword}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setMenuOpen(false);
  };

  // 메뉴 바깥 클릭 시 닫힘
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header
      ref={menuRef}
      className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white px-6 shadow-md z-50"
    >
      {/* 내부 flex (헤더 높이를 정확히 맞추기 위해 header 바깥에서 flex 안 씀) */}
      <div className="h-full flex items-center">

        {/* 로고 - 왼쪽 */}
        <Link href="/" className="flex-shrink-0">
          <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* 오른쪽 로그인/회원가입/햄버거 */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <ul className="hidden md:flex items-center gap-2">
            <li className="min-w-0">
              {user ? (
                <span className="px-3 py-1 truncate block max-w-[140px] md:max-w-[100px] lg:max-w-full">
                  <b>{user.name}</b>님 환영합니다!
                </span>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1 hover:text-blue-500 transition"
                >
                  로그인
                </Link>
              )}
            </li>

            <li>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 hover:text-gray-500 transition cursor-pointer"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="px-3 py-1 hover:text-blue-500 transition"
                >
                  회원가입
                </Link>
              )}
            </li>
          </ul>

          {/* 햄버거 버튼 */}
          <button
            className="relative w-10 h-10 flex items-center justify-center cursor-pointer z-50"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span
              className={`absolute block w-8 h-1 bg-white rounded transition-all duration-300 ease-in-out
              ${menuOpen ? "rotate-45" : "-translate-y-2"}`}
            />
            <span
              className={`absolute block w-8 h-1 bg-white rounded transition-opacity duration-300 ease-in-out
              ${menuOpen ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute block w-8 h-1 bg-white rounded transition-all duration-300 ease-in-out
              ${menuOpen ? "-rotate-45" : "translate-y-2"}`}
            />
          </button>
        </div>
      </div>

      {/* 검색창 - 헤더 정중앙 absolute */}
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

      {/* 모바일 드롭다운 */}
      <div
        className={`absolute right-4 top-16 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden text-center z-40 transition-all duration-300
        ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
      >
        <Link href="/mypage" onClick={() => setMenuOpen(false)} className="block px-3 py-3 hover:bg-gray-700 transition">
          마이페이지
        </Link>
        <Link href="/cart" onClick={() => setMenuOpen(false)} className="block px-3 py-3 hover:bg-gray-700 transition">
          장바구니
        </Link>
      </div>
    </header>
  );
}
