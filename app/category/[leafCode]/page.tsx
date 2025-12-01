"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useCategoryProducts } from "@/hooks/useCategoryProducts";
import { toFullUrl } from "@/lib/utils/toFullUrl";

/**
 * 카테고리별 상품 목록 페이지
 *
 * 기능:
 * - URL에서 leafCode 추출
 * - leafCode에 따라 상품 목록 조회 (useCategoryProducts 훅)
 * - 로딩 상태/빈 목록 상태/상품 리스트 표시
 * - 상품 클릭 시 상품 상세 페이지로 이동
 */
export default function CategoryPage({ params }: { params: Promise<{ leafCode: string }> }) {
  // Next.js 15에서 use(params) 사용 → Promise unwrap
  const { leafCode } = use(params);
  const router = useRouter();

  // 카테고리 상품 조회 (로딩, 상품 리스트)
  const { products, loading } = useCategoryProducts(leafCode);

  return (
    <div className="p-6 min-h-screen">
      {/* 카테고리 코드 표시 */}
      <h1 className="text-xl font-bold mb-4">
        카테고리: <span className="font-normal">{leafCode}</span>
      </h1>
      
      {/* ----------------------------------------------------
          로딩 상태
      ---------------------------------------------------- */}
      {loading ? (
        <p>상품 불러오는 중...</p>
      ) :

      /* ----------------------------------------------------
         상품이 없는 경우
      ---------------------------------------------------- */
      products.length === 0 ? (
        <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
      ) :

      /* ----------------------------------------------------
         상품 리스트 표시
      ---------------------------------------------------- */
      (
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <li
              key={p.productId}
              className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer"
              onClick={() => router.push(`/product/${p.productId}`)}
            >
              {/* 상품 이미지 */}
              {p.mainImg && (
                <img
                  src={toFullUrl(p.mainImg)}  // 이미지 절대 URL 변환
                  alt={p.productName}
                  className="w-full h-40 object-contain mb-3"
                />
              )}

              {/* 상품명 */}
              <p className="font-semibold line-clamp-1">{p.productName}</p>

              {/* 가격 */}
              <p className="text-blue-600 font-bold">
                {p.sellPrice.toLocaleString()}원
              </p>

              {/* 재고 */}
              <p className="text-xs text-gray-500">재고: {p.stock}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
