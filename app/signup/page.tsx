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

    console.log("▶ 회원가입 요청");
    console.log("이메일:", email);
    console.log("비밀번호:", pw);

    // ✅ 백엔드(Spring Boot) API 연동 부분
    try {
      const response = await fetch("http://localhost:8080/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });

      const result = await response.text();
      alert(result); // 백엔드에서 "회원가입 성공" 또는 에러 메시지 출력

      if (result.includes("성공")) {
        router.push("/login"); // 회원가입 성공 시 로그인 페이지로 이동
      }
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      alert("서버 연결 오류! 백엔드 실행 중인지 확인하세요.");
    }
  }; // ✅ 여기까지만 닫음. 그 아래는 return!

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          회원가입
        </h2>

        <form className="space-y-5" onSubmit={handleSignup}>
          <div>
            <label className="block text-gray-600 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 duration-150"
          >
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}
