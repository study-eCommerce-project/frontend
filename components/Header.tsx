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
    if (!keyword.trim()) return;
    router.push(`/search?keyword=${keyword}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user_name"); // ✅ 변경됨
    setUser(null);
    router.push("/"); // 로그아웃 후 메인으로 이동 (선택)
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
          placeholder="프로젝트"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-72 px-4 py-2 bg-white text-black rounded-full text-center focus:outline-none"
        />
      </form>

      {/* 로그인/로그아웃 메뉴 */}
      <ul className="flex gap-3 items-center">
        {user ? (
          <>
            <li className="px-3 py-1">{user.user_name}님</li>
            <li>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
              >
                로그아웃
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/login"
                className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
              >
                로그인
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition"
              >
                회원가입
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  );
}
