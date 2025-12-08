"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Signup() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwCheck, setPwCheck] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

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
      toast.error("주소 검색 기능 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
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

    // 이메일 형식 체크
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("올바른 이메일 형식을 입력하세요.");
      return;
    }

    if (pw !== pwCheck) {
      toast.error("비밀번호가 일치하지 않습니다.");
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
          address,
          addressDetail,
        }),
      });

      const result = await response.text();
      if (result.includes("성공")) {
        toast.success(result);
        router.push("/login");
      } else {
        toast.error(result);
      }
    } catch (error) {
      console.error("회원가입 중 오류:", error);
      toast.error("서버 연결 오류! 백엔드 실행 여부 확인하세요.");
    }
  };

  // 전화번호 자동 하이픈
  const handlePhoneChange = (value: string) => {
    // 숫자만 남기고, 11자리까지만 제한
    const number = value.replace(/[^0-9]/g, "").slice(0, 11);
    let formatted = "";

    if (number.length < 4) {
      formatted = number;
    } else if (number.length < 7) {
      formatted = number.substr(0, 3) + "-" + number.substr(3);
    } else if (number.length < 11) {
      formatted = number.substr(0, 3) + "-" + number.substr(3, 3) + "-" + number.substr(6);
    } else {
      // 11자리 정확히 입력된 경우 (3-4-4)
      formatted = number.substr(0, 3) + "-" + number.substr(3, 4) + "-" + number.substr(7);
    }

    setPhone(formatted);
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-10 shadow-sm flex flex-col gap-6"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-2">
          회원가입
        </h2>

        {/* 이름 */}
        <InputBox
          label="이름"
          value={name}
          onChange={setName}
          placeholder="이름을 입력하세요"
        />

        {/* 전화번호 */}
        <InputBox
          label="전화번호"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="핸드폰번호('-'없이 입력)"
        />

        {/* 이메일 */}
        <InputBox
          label="이메일"
          value={email}
          onChange={setEmail}
          type="email"
          placeholder="example@email.com"
        />

        {/* 비밀번호 */}
        <InputBox
          label="비밀번호"
          value={pw}
          onChange={setPw}
          type="password"
          placeholder="비밀번호 입력"
        />

        {/* 비밀번호 확인 */}
        <InputBox
          label="비밀번호 확인"
          value={pwCheck}
          onChange={setPwCheck}
          type="password"
          placeholder="비밀번호 재입력"
        />

        {/* 주소 */}
        <div>
          <label className="block text-gray-600 text-sm mb-1">주소</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              readOnly
              placeholder="주소"
              className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-black outline-none"
            />

            <button
              type="button"
              onClick={handleSearchAddress}
              className="px-3 border border-black rounded-lg cursor-pointer hover:bg-black hover:text-white transition"
            >
              검색
            </button>
          </div>

          <InputBox
            value={addressDetail}
            onChange={setAddressDetail}
            placeholder="상세주소 입력"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition cursor-pointer"
        >
          회원가입
        </button>
      </form>
    </div>
  );
}

//////////////////////////////////////////////
// 🔹 Input UI 컴포넌트 (재사용)
//////////////////////////////////////////////
interface InputBoxProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}

function InputBox({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: InputBoxProps) {
  return (
    <div>
      <label className="block text-gray-600 text-sm mb-1">{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-lg text-black outline-none focus:ring-[1.5px] ring-black"
        required
      />
    </div>
  );
}
