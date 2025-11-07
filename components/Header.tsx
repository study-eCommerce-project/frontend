"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!keyword) return;
    router.push(`/search?keyword=${keyword}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("user_name");
    setUser(null);
  };

  return (
    <header className="w-full h-16 bg-gray-900 text-white flex justify-between items-center px-6 shadow-md">
      {/* 로고 */}
      <div className="text-xl font-bold">
        <Link href="/">E-Commerce</Link>
      </div>

      {/* 검색 박스 */}
      <form onSubmit={handleSearch} className="flex-1 flex justify-center">
        <input
          type="text"
          placeholder="검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-64 px-4 py-2 bg-white text-black placeholder-gray-400 rounded-full text-center focus:outline-none"
        />
      </form>


      {/* 사용자 메뉴 */}
      <ul className="flex gap-3 items-center">
        <li>
          {user ? (
            <span className="px-3 py-1">{user.user_name}님</span>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              로그인
            </Link>
          )}
        </li>

        <li>
          {user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              로그아웃
            </button>
          ) : (
            <Link
              href="/signup"
              className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition"
            >
              회원가입
            </Link>
          )}
        </li>
      </ul>
    </header>
  );
}
