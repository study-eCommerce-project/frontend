"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext"; // ⭐ 장바구니 상태 가져오기

interface SidebarContentProps {
  user: any;
  onClose: () => void;  // 사이드바 닫기 함수
}

export default function SidebarContent({ user, onClose }: SidebarContentProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [search, setSearch] = useState("");
  const [tree, setTree] = useState<any>(null); // 카테고리 전체 트리
  const [originalTree, setOriginalTree] = useState<any>(null); // (사용할 수도 있는 원본 tree)
  const [open, setOpen] = useState<{ [key: string]: boolean }>({}); // 아코디언 열림/닫힘 상태
  const router = useRouter();

  const { cart } = useCart(); // ⭐ 장바구니 수량 가져오기

  /** ----------------------------------------------------
   *  카테고리 트리 API 불러오기
   *      GET /api/categories/tree
   * --------------------------------------------------- */
  useEffect(() => {
    async function loadTree() {
      const res = await fetch(`${API_URL}/api/categories/tree`);
      const data = await res.json();
      setTree(data.tree);  // 화면 출력용 tree
    }
    loadTree();
  }, []);

  /** ----------------------------------------------------
   *  아코디언 토글 (대분류 열고 닫기)
   * --------------------------------------------------- */
  const toggleOpen = (code: string) => {
    setOpen((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* ----------------------------------------------------
        상단 로그인/회원가입, 위시리스트, 장바구니
      ----------------------------------------------------- */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        {/* 로그인 / 회원가입 / 사용자 이름 */}
        <div className="text-base font-semibold flex items-center gap-4">
          {user ? (
             // 로그인한 사용자 → 마이페이지로 이동
            <Link href="/mypage" onClick={onClose} className="hover:text-blue-500">
              {user.name}님
            </Link>
          ) : (
            // 비로그인 → 로그인/회원가입 표시
            <>
              <Link href="/login" onClick={onClose} className="flex items-center gap-1 text-gray-700 hover:text-black">
                <LogIn size={20} /> 로그인
              </Link>
              <Link href="/join" onClick={onClose} className="flex items-center gap-1 text-gray-700 hover:text-black">
                <UserPlus size={20} /> 회원가입
              </Link>
            </>
          )}
        </div>

        {/* 위시리스트 / 장바구니 아이콘 */}
        <div className="flex items-center gap-5">
          {user && user.role !== "ADMIN" && (
            <>
              <Link href="/mypage/wishlist" onClick={onClose}>
                <Heart size={22} className="text-gray-600 hover:text-black" />
              </Link>
              <Link href="/mypage/cart" onClick={onClose}>
                <ShoppingCart size={22} className="text-gray-600 hover:text-black" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 검색창 */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg px-3">
          <Search size={16} className="text-gray-500" />
          <input
            type="text"
            placeholder="카테고리 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-black w-full px-2 py-2 outline-none text-sm"
          />
        </div>
      </div>

      {/* ----------------------------------------------------
        카테고리 트리 렌더링
        tree 구조:
        {
          "0001": {
            title: "상의",
            children: {
              "00010001": {
                title: "티셔츠",
                children: { leafCode: "라운드넥" ... }
              }
            }
          }
        }
      ----------------------------------------------------- */}
      <div className="flex-1 overflow-y-auto py-3 px-4">
        {tree &&
          Object.entries(tree).map(([bigCode, bigNode]: any) => (
            <div key={bigCode} className="mb-3">

              {/* 대분류 */}
              <button
                onClick={() => toggleOpen(bigCode)}
                className="w-full flex items-center justify-between px-2 py-2 text-lg font-semibold text-gray-900 hover:text-gray-700 cursor-pointer"
              >
                {bigNode.title}
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-300 ${open[bigCode] ? "rotate-180" : ""}`}
                />
              </button>

              {/* 중분류 */}
              {open[bigCode] && (
                <div className="pl-4 mt-1 space-y-2">
                  {Object.entries(bigNode.children).map(([midCode, midNode]: any) => (
                    <div key={midCode}>
                      {/* 중분류 제목 */}
                      <p className="font-semibold text-gray-800">{midNode.title}</p>

                      {/* 소분류 버튼 */}
                      <div className="pl-3 space-y-1">
                        {Object.entries(midNode.children).map(([leafCode, leafName]: any) => (
                          <button
                            key={leafCode}
                            onClick={() => {
                              router.push(`/category/${leafCode}`);  // 선택한 leaf 카테고리로 이동
                              onClose();  // 사이드바 닫기
                            }}
                            className="block text-left text-gray-700 hover:text-black cursor-pointer"
                          >
                            ▸ {leafName}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
