"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요.");

    sessionStorage.setItem("user_name", id);
    setUser({ user_name: id });

    alert("로그인 성공!");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="text-black p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="text-black p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
