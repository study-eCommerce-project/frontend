"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-gray-900 text-white flex items-center px-6 shadow-md z-50">
      {/* 로고 */}
      <div className="flex-shrink-0">
        <Link href="/">
          <img src={""} alt="E-Commerce" className="h-10 w-auto" />
        </Link>
      </div>

      {/* 검색 박스 */}
      <form
        onSubmit={handleSearch}
        className="flex-1 flex justify-center mx-4 z-50 relative"
      >
        <input
          type="text"
          placeholder="검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-64 md:w-72 px-4 py-2 bg-white text-black placeholder-gray-400 rounded-full text-center focus:outline-none"
        />
      </form>

      {/* 로그인 / 회원가입 */}
      <ul className="hidden md:flex gap-4 items-center flex-shrink-0 z-50">
        <li>
          {user ? (
            <span className="px-3 py-1">{user.user_name}님</span>
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
              className="px-3 py-1 hover:text-gray-400 transition"
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
        className="relative w-10 h-6 flex flex-col justify-between items-center cursor-pointer z-50 ml-4"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span
          className={`block w-8 h-1 bg-white rounded transition-all duration-300 ease-in-out
          ${menuOpen ? "rotate-45 absolute" : "relative"}`}
        />
        <span
          className={`block w-8 h-1 bg-white rounded transition-opacity duration-300 ease-in-out
          ${menuOpen ? "opacity-0" : "opacity-100"}`}
        />
        <span
          className={`block w-8 h-1 bg-white rounded transition-all duration-300 ease-in-out
          ${menuOpen ? "-rotate-45 absolute" : "relative"}`}
        />
      </button>

      {/* 드롭다운 메뉴 */}
      <div
        className={`fixed right-4 top-16 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden text-center z-40
        transition-all duration-300
        ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-3 pointer-events-none"}`}
      >
        <Link
          href="/mypage"
          onClick={() => setMenuOpen(false)}
          className="block px-3 py-3 hover:bg-gray-700 transition"
        >
          마이페이지
        </Link>
        {user && (
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="block px-3 py-3 hover:bg-gray-700 transition"
          >
            장바구니
          </Link>
        )}
      </div>
    </header>
  );
}
