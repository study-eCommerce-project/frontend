"use client";

import { useWishlist } from "../../../context/WishlistContext";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { likedProducts, toggleWishlist } = useWishlist();

  if (likedProducts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-600 text-lg">찜한 상품이 없습니다.</p>
      </div>
    );

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">찜한 상품</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {likedProducts.map((productId) => (
          <div
            key={productId}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col items-center gap-2"
          >
            <Link href={`/product/${productId}`}>
              <img
                src={`/images/default_main.png`} // 실제 API 연결 시 상품 이미지 적용
                alt={`상품 ${productId}`}
                className="w-full h-40 object-contain rounded-xl"
              />
            </Link>

            <p className="text-gray-800 font-medium text-center truncate">
              상품 {productId}
            </p>

            <button
              onClick={() => toggleWishlist(productId)}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm mt-2 cursor-pointer"
            >
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
