"use client";

import ProductDetailTop from "@/app/product/components/ProductDetailTop";
import ProductDetailBottom from "@/app/product/components/ProductDetailBottom";
import { useProductDetail } from "@/hooks/useProductDetail";

/**
 * 클라이언트 전용 상품 상세 컨테이너 컴포넌트
 *
 * 역할:
 * - 상품 상세 데이터를 useProductDetail 훅으로 조회
 * - 로딩 UI 표시
 * - 상품 상세 상단(ProductDetailTop) + 하단(ProductDetailBottom) 분리 렌더링
 *
 * 왜 클라이언트 컴포넌트인가?
 * - 좋아요, 장바구니 등 Client Interaction이 많기 때문
 * - sessionStorage 등을 사용하려면 클라이언트 환경 필요
 */
export default function ProductDetailClient({ productId }: { productId: number }) {
  // 상품 상세 데이터 로딩
  const product = useProductDetail(productId);

  // 로딩 상태
  if (!product)
    return (
      <div className="w-full flex flex-col items-center justify-center py-10">
        <p className="text-gray-700 mb-3">상품 불러오는 중...</p>

        {/* 로딩 이미지 */}
        <img
          src="/images/signature_w.png"
          alt="Loading"
          className="inline-block w-8 h-8 md:w-20 md:h-20 animate-spin-slow"
        />
      </div>
    );

  // 상세 페이지 구성 요소 렌더링
  return (
    <div className="w-full">
      {/* 상단: 이미지 + 기본 정보 + 좋아요 + 옵션 선택 */}
      <ProductDetailTop product={product} />

      {/* 하단: 상세 설명, 리뷰, 추천 상품 */}
      <ProductDetailBottom product={product} />
    </div>
  );
}
