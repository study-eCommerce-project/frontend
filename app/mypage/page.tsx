"use client";
import { useUser } from "../../context/UserContext";
import Link from "next/link";
import { User, CreditCard, ShoppingBag, Heart, LogOut, ChevronRight } from "lucide-react";

/**
 * 📌 [왜 MyPage는 별도로 훅·컴포넌트로 분리할 필요가 없는가?]
 *
 * 1) 데이터 로직이 거의 없음
 *    - user 정보는 UserContext에서 이미 관리
 *    - 이 페이지는 "조회만" 하고, API 호출이나 로직이 없음
 *    → 로직 분리 대상 자체가 거의 없음
 *
 * 2) 메뉴 목록(menuSections)은 단순한 정적 데이터
 *    - 클릭 링크와 아이콘 나열만 함
 *    - 이를 훅이나 constants 폴더로 분리해도 재사용성이 생기지 않음
 *
 * 3) UI 컴포넌트 구조도 간단함
 *    - SummaryCard 정도만 작은 컴포넌트로 분리했는데 이것만으로 충분함
 *    - 나머지는 단순한 <Link> 리스트 렌더링
 *
 * 4) 페이지 자체가 '대시보드(정적 구성)'이기 때문에 
 *    - 로직·아키텍처적 관점에서 복잡도가 매우 낮음
 *    - 분리하면 파일 개수만 늘어나고 유지보수성이 떨어짐 (over-engineering)
 *
 * 5) 길이도 200줄 미만, 가독성 매우 양호
 *    - 뷰 + 정적 구조 조합이라 컴포넌트가 하나여도 전체 구조 파악 쉽고 실용적
 *
 *  결론:
 * - MyPage는 "정적 UI + 간단한 user 표시" 구조로 최적화되어 있어
 *   지금 구조가 가장 깔끔하고 유지보수 친화적이다.
 */

export default function MyPage() {
  const { user } = useUser();

  const menuSections = [
    {
      title: "주문/배송",
      items: [
        { title: "결제 내역", href: "/order/history", icon: <CreditCard className="w-5 h-5" /> },
      ],
    },
    {
      title: "쇼핑 관리",
      items: [
        { title: "장바구니", href: "/mypage/cart", icon: <ShoppingBag className="w-5 h-5" /> },
        { title: "찜한 상품", href: "/mypage/wishlist", icon: <Heart className="w-5 h-5" /> },
      ],
    },
    {
      title: "계정",
      items: [
        { title: "내 정보 수정", href: "/mypage/edit", icon: <User className="w-5 h-5" /> },
        { title: "로그아웃", href: "/", icon: <LogOut className="w-5 h-5" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
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
            <Link href="/mypage/edit" className="text-sm text-gray-500 hover:text-gray-800">
              내 정보 수정
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              로그인 →
            </Link>
          )}
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard title="적립금" value="0원" />
          <SummaryCard title="쿠폰" value="3장" />
          <SummaryCard title="후기" value="1개" valueColor="text-blue-600" />
        </div>

        {/* 메뉴 섹션 */}
        {menuSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm divide-y">
            <h2 className="px-6 py-3 font-medium text-gray-500 text-sm">{section.title}</h2>
            {section.items.map((item, i) => (
              <Link
                key={i}
                href={item.href}
                className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  {item.icon}
                  <span className="text-sm">{item.title}</span>
                </div>
                <ChevronRight className="text-gray-400 w-4 h-4" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

///////////////////////////////////////////
// 🔹 요약 카드 컴포넌트
///////////////////////////////////////////
function SummaryCard({ title, value, valueColor }: { title: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm text-center cursor-pointer hover:bg-gray-50 transition">
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className={`text-lg font-bold ${valueColor || "text-gray-800"}`}>{value}</p>
    </div>
  );
}
