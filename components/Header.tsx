"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword) return;
    router.push(`/search?keyword=${keyword}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    setUser(null);
    setMenuOpen(false);
  };

  // ✅ 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header
      ref={menuRef}
      className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white flex items-center px-6 shadow-md z-50"
    >
      {/* 왼쪽 : 로고 */}
      <div className="flex-shrink-0">
        <Link href="/">
          <img src={"/images/logo.jpg"} alt="Logo" className="h-10 w-auto" />
        </Link>
      </div>

      {/* 가운데 : 검색창 */}
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <img src="/images/search.png" alt="검색" className="w-4 h-4"/>
          </span>
          <input
            type="text"
            placeholder="E-Commerce"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-2 bg-white text-black placeholder-gray-400 rounded-full text-center focus:outline-none"
          />
        </form>
      </div>

      {/* 오른쪽 : 로그인/회원가입 + 햄버거 버튼 */}
      <div className="flex items-center gap-3 flex-shrink-0">

        {/* 로그인/회원가입 */}
        <ul className="hidden md:flex items-center">
          <li>
            {user ? (
              <span className="px-3 py-1">
                <b>{user.user_name}</b>님 환영합니다!
              </span>
            ) : (
              <Link href="/login" className="px-3 py-1 hover:text-blue-500 transition">
                로그인
              </Link>
            )}
          </li>
          <li>
            {user ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 hover:text-gray-400 transition"
              >
                로그아웃
              </button>
            ) : (
              <Link href="/signup" className="px-3 py-1 hover:text-blue-500 transition">
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

      {/* 드롭다운 메뉴 */}
      <div
        className={`fixed right-4 top-16 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden text-center z-40 transition-all duration-300
      ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
      >
        <Link href="/mypage" onClick={() => setMenuOpen(false)} className="block px-3 py-3 hover:bg-gray-700 transition">
          마이페이지
        </Link>
        {user && (
          <Link href="/cart" onClick={() => setMenuOpen(false)} className="block px-3 py-3 hover:bg-gray-700 transition">
            장바구니
          </Link>
        )}
      </div>
    </header>
  );
}
