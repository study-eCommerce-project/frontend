"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [pwCheck, setPwCheck] = useState<string>("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pw !== pwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });

      const result = await response.text();
      alert(result);

      if (result.includes("성공")) {
        router.push("/login");
      }
    } catch (error) {
      console.error("회원가입 중 오류:", error);
      alert("서버 연결 오류! 백엔드 실행 중인지 확인하세요.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">회원가입</h2>

        <div>
          <label className="block text-gray-600 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">비밀번호</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호 입력"
            className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">비밀번호 확인</label>
          <input
            type="password"
            value={pwCheck}
            onChange={(e) => setPwCheck(e.target.value)}
            placeholder="비밀번호 재입력"
            className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
