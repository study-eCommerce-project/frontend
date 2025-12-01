"use client";

import Link from "next/link";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";


  /* ------------------------------------------------------------------
     Footer 컴포넌트  
     - 모든 페이지 하단에 고정적으로 표시되는 글로벌 푸터
     - 회사/브랜드 소개, 빠른 링크, 연락처 & SNS 링크로 구성
     - 별도의 상태 없음 → 단순 UI 컴포넌트
     ------------------------------------------------------------------ */

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">YDJ</h3>
          <p className="text-gray-400 text-sm">Your Daily Journey</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">빠른 링크</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li><Link href="/" className="hover:text-white transition">홈</Link></li>
            <li><Link href="/mypage" className="hover:text-white transition">마이페이지</Link></li>
            <li><Link href="/cart" className="hover:text-white transition">장바구니</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Contact & SNS</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-center gap-1">
              <Mail size={14} /> yourdailyjourney@ydj.com</li>
            <li className="flex items-center gap-1">
              <Phone size={14} /> 010-1234-5678</li>
            <li className="flex items-center gap-1">
              <Facebook size={14} /> <Link href="#">Facebook</Link>
            </li>
            <li className="flex items-center gap-1">
              <Instagram size={14} /> <Link href="#">Instagram</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-4">
        <p className="text-center text-gray-500 text-sm py-4">
          &copy; {new Date().getFullYear()} Your Daily Journey. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
