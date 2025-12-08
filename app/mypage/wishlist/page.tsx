"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "../../../context/WishlistContext";
import Link from "next/link";
import { Trash2, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { 
    likedProducts,
    productInfos,
    toggleWishlist,
    reloadWishlist,
    loading } = useWishlist();

  const [sortedList, setSortedList] = useState<number[]>([]);
  const [sortLatest, setSortLatest] = useState<boolean>(true);

  /** ⭐ 페이지 진입 시 서버 최신 데이터 강제 로드 */
  useEffect(() => {
    reloadWishlist();
  }, []);

  // 정렬 적용
  useEffect(() => {
    if (sortLatest) {
      setSortedList([...likedProducts].reverse());
    } else {
      setSortedList([...likedProducts]);
    }
  }, [likedProducts, sortLatest, productInfos]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        찜한 상품 불러오는 중...
      </div>
    );
  }

  if (!likedProducts.length) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-10 text-center">
          <h1 className="text-2xl font-bold mb-4">찜한 상품</h1>
          <p className="text-gray-500 text-lg">찜한 상품이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6">

        {/* 상단 UI */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">찜한 상품</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSortLatest((prev) => !prev)}
              className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 
                rounded-lg hover:bg-gray-300 transition cursor-pointer"
            >
              <ArrowUpDown size={16} />
              {sortLatest ? "최신순" : "등록순"}
            </button>

            <button
              onClick={() => {
                if (sortedList.length === 0) {
                  toast('삭제할 상품이 없습니다.');
                  return;
                }
                sortedList.forEach((id) => toggleWishlist(id));
                toast.success('찜한 상품을 모두 삭제했습니다.');
              }}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg 
                hover:bg-red-700 transition cursor-pointer"
            >
              <Trash2 size={18} />
              전체 삭제
            </button>
          </div>
        </div>

        {/* 반응형 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedList.map((productId) => {
            const product = productInfos[productId];
            if (!product) return null;

            return (
              <div
                key={productId}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 p-2 flex flex-col"
              >
                <Link href={`/product/${productId}`} className="block">
                  <div className="w-full pt-[133.33%] relative mb-2">
                    <img
                      src={product.mainImg || '/images/default_main.png'}
                      alt={product.productName}
                      className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </Link>

                <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px]">
                  {product.productName}
                </p>

                <p className="text-sm sm:text-base font-bold mt-1 text-gray-900">
                  {product.sellPrice.toLocaleString()}원
                </p>

                <button
                  onClick={() => {
                    toggleWishlist(productId);
                    toast.success('상품을 삭제했습니다.');
                  }}
                  className="mt-3 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer text-xs sm:text-sm"
                >
                  <Trash2 size={14} /> 삭제
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
