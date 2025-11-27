"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Heart, ShoppingCart, LogIn, UserPlus, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext"; // ⭐ 추가

interface SidebarContentProps {
  user: any;
  onClose: () => void;
}

export default function SidebarContent({ user, onClose }: SidebarContentProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [search, setSearch] = useState("");
  const [tree, setTree] = useState<any>(null);
  const [originalTree, setOriginalTree] = useState<any>(null);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();

  const { cart } = useCart(); // ⭐ 장바구니 수량 가져오기

  /** 카테고리 트리 불러오기 */
  useEffect(() => {
    async function loadTree() {
      const res = await fetch(`${API_URL}/api/categories/tree`);
      const data = await res.json();
      setTree(data.tree);
    }
    loadTree();
  }, []);

  /** 아코디언 토글 */
  const toggleOpen = (code: string) => {
    setOpen((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* 로그인 & 위시리스트 */}
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="text-base font-semibold flex items-center gap-4">
          {user ? (
            <Link href="/mypage" onClick={onClose} className="hover:text-blue-500">
              {user.name}님
            </Link>
          ) : (
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

      {/* 검색 */}
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

      {/* 카테고리 */}
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
                      <p className="font-semibold text-gray-800">{midNode.title}</p>

                      <div className="pl-3 space-y-1">
                        {Object.entries(midNode.children).map(([leafCode, leafName]: any) => (
                          <button
                            key={leafCode}
                            onClick={() => {
                              router.push(`/category/${leafCode}`);
                              onClose();
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
