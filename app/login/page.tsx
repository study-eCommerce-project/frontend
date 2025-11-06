"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Login() {
  const router = useRouter();

  const [id, setId] = useState<string>("");
  const [pw, setPw] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/login", {
        id: id,
        pw: pw,
      });

      console.log("서버 응답:", response.data);

      // 로그인 성공 시
      alert("로그인 성공!");
      router.push("/");
    } catch (error: any) {
      if (error.response) {
        alert(`로그인 실패: ${error.response.data}`);
      } else {
        alert("서버와의 연결에 실패했습니다.");
      }
      console.error("로그인 요청 오류:", error);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-cyan-300 to-blue-500">
      <form
        onSubmit={handleLogin}
        className="w-80 p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-white text-center text-2xl font-semibold">
          로그인
        </h2>

        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="p-3 rounded-lg bg-white/40 backdrop-blur-sm outline-none"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="p-3 rounded-lg bg-white/40 backdrop-blur-sm outline-none"
        />

        <button
          type="submit"
          className="p-3 bg-white/70 rounded-lg font-bold hover:bg-white transition"
        >
          로그인
        </button>

        <p className="text-white text-center text-sm">
          계정이 없으신가요?{" "}
          <a href="/signup" className="underline font-semibold">
            회원가입
          </a>
        </p>
      </form>
    </div>
  );
}
