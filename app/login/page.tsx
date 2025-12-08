"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";
import axios from "@/context/axiosConfig";
import toast from "react-hot-toast";

export default function LoginPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();
  const { refreshUser } = useUser();

  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !pw) {
      toast.error("아이디와 비밀번호를 입력하세요.");
      return;
    }

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(id.trim())) {
      toast.error("올바른 이메일 형식을 입력하세요.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email: id.trim(), password: pw.trim() }
      );

      await refreshUser();

      const me = response.data;

      if (me.role === "ADMIN") toast.success("관리자 로그인 성공");
      else toast.success("로그인 성공");

      if (me.role === "ADMIN") router.push("/admin");
      else router.push("/");

    } catch (error: any) {
      // 이메일 또는 비밀번호 오류를 한 메시지로 통합
      if (error.response?.status === 401 || error.response?.status === 404) {
        toast.error("이메일 또는 비밀번호가 일치하지 않습니다.");
        return;
      }
      toast.error("서버 오류 또는 네트워크 오류");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="border border-gray-200 rounded-xl p-8 shadow-sm bg-white"
        >
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
            로그인
          </h1>

          {/* 아이디 */}
          <InputBox
            value={id}
            onChange={setId}
            placeholder="이메일"
            type="text"
          />

          {/* 비밀번호 */}
          <InputBox
            value={pw}
            onChange={setPw}
            placeholder="비밀번호"
            type="password"
          />

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition cursor-pointer"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
function InputBox({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label?: string; // 로그인에서는 label 생략 가능
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      {label && <label className="block text-gray-600 text-sm mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}
