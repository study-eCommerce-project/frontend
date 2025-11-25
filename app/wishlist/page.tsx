"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";

// 테스트용 더미 데이터
interface Product {
  id: number;
  name: string;
  thumbnail: string;
  price: number;
  soldOut?: boolean;
}

const DUMMY_WISHLIST: Product[] = [
  { id: 1, name: "상품 A", thumbnail: "/images/product1.png", price: 12000 },
  { id: 2, name: "상품 B", thumbnail: "/images/product2.png", price: 25000, soldOut: true },
  { id: 3, name: "상품 C", thumbnail: "/images/product3.png", price: 18000 },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    // 테스트용 데이터 로드
    setWishlist(DUMMY_WISHLIST);
  }, []);

  const removeItem = (id: number) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">찜한 상품</h1>

        {wishlist.length === 0 ? (
          <p className="text-gray-500 text-center py-10 text-lg">
            찜한 상품이 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2"
              >
                <Link href={`/product/${item.id}`}>
                  <img
                    src={item.thumbnail || "/images/default_main.png"}
                    alt={item.name}
                    className="w-full h-40 object-contain rounded-lg"
                  />
                </Link>

                <p className="text-gray-800 font-medium text-center">{item.name}</p>

                <p className="text-black font-bold">{item.price.toLocaleString()}원</p>

                {item.soldOut && (
                  <p className="text-red-500 font-semibold text-sm">품절</p>
                )}

                <button
                  onClick={() => removeItem(item.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm mt-2"
                >
                  <Trash2 size={14} /> 삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
