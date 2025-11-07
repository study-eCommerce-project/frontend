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

    // ✅ 로그인 상태 저장 (sessionStorage)
    sessionStorage.setItem("user_name", id);

    // ✅ Context 즉시 업데이트 → 헤더 반영
    setUser({ user_name: id });

    alert("로그인 성공!");
    router.push("/");
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-cyan-400 to-blue-600">
      <form
        onSubmit={handleLogin}
        className="w-80 p-8 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-white text-center text-2xl font-semibold">로그인</h2>

        <input
          type="text"
          placeholder="아이디"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="p-3 rounded-lg bg-white/40 backdrop-blur-sm outline-none text-black placeholder-gray-600"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="p-3 rounded-lg bg-white/40 backdrop-blur-sm outline-none text-black placeholder-gray-600"
        />

        <button
          type="submit"
          className="p-3 bg-white/70 rounded-lg font-bold hover:bg-white transition text-black"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
