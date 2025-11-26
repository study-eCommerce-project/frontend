"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import axios from "@/context/axiosConfig";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !pw) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email: id.trim(), password: pw.trim() }
      );

      // 로그인 성공 → 세션 생성됨
      await refreshUser(); // axios 기반

      const me = response.data; // 서버에서 바로 dto 반환됨

      if (me.role === "ADMIN") router.push("/admin/list");
      else router.push("/");

    } catch (error: any) {
      if (error.response?.status === 404) {
        alert("존재하지 않는 사용자입니다.");
        return;
      }
      if (error.response?.status === 401) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      alert("서버 오류 또는 네트워크 오류");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>

        <input
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="아이디 (이메일)"
          className="text-black p-3 border rounded-lg focus:ring-2 ring-blue-500"
          autoFocus
        />

        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          className="text-black p-3 border rounded-lg focus:ring-2 ring-blue-500"
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
