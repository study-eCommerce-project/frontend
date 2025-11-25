"use client";
import { useUser } from "../../context/UserContext";
import Link from "next/link";
import { User, ChevronRight } from "lucide-react";

export default function MyPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* 프로필 섹션 */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="text-gray-500 w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {user ? `${user.name} 님` : "로그인이 필요합니다"}
                </p>
                <p className="text-sm text-gray-500">LV.2 프렌즈 · 무료배송</p>
              </div>
            </div>
            {user ? (
              <Link
                href="/logout"
                className="text-sm text-gray-500 hover:text-gray-800 transition"
              >
                로그아웃
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                로그인 →
              </Link>
            )}
          </div>
        </div>

        {/* 적립금 / 쿠폰 / 후기 */}
        <div className="grid grid-cols-3 bg-white rounded-xl shadow divide-x">
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">적립금</p>
            <p className="text-xl font-bold text-gray-800">0원</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">쿠폰</p>
            <p className="text-xl font-bold text-gray-800">3장</p>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">작성 가능한 후기</p>
            <p className="text-xl font-bold text-blue-600">1개</p>
          </div>
        </div>

        {/* 메뉴 리스트 */}
        <div className="mt-6 bg-white rounded-xl shadow divide-y">
          {[
            { title: "장바구니", href: "/cart" },
            { title: "결제 내역", href: "/order/history" },
            { title: "재입고 알림 내역", href: "#" },
            { title: "최근 본 상품", href: "#" },
            { title: "내 정보", href: "/mypage/edit" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition"
            >
              <span className="text-gray-700">{item.title}</span>
              <ChevronRight className="text-gray-400 w-4 h-4" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
