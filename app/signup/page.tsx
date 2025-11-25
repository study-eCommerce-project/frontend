"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");          // 기본주소
  const [addressDetail, setAddressDetail] = useState(""); // 상세주소

  // 카카오 주소 검색 스크립트 로드
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleSearchAddress = () => {
    if (!(window as any).daum?.Postcode) {
      alert("주소 검색 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setAddress(data.address);
      },
    }).open();
  };

  // 회원가입 요청
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pw !== pwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: pw,
          name,
          phone,
          address,              // 기본주소
          addressDetail,        // 상세주소 (분리해서 전송)
        }),
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
        className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col gap-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-900">회원가입</h2>

        {/* 이름, 전화번호, 이메일, 비밀번호 입력 */}
        <div>
          <label className="block text-gray-600 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">전화번호</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-1234-5678"
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
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
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
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
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
            required
          />
        </div>

        {/* 주소 + 상세주소 입력 */}
        <div>
          <label className="block text-gray-600 mb-1">주소</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={address}
              readOnly
              placeholder="주소를 검색하세요"
              className="w-4/5 text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={handleSearchAddress}
              className="w-1/5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
            >
              검색
            </button>
          </div>

          {/* 상세주소 입력 */}
          <input
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
            placeholder="상세주소 입력 (동/호수 등)"
            className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}
