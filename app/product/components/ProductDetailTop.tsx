"use client";

import ProductImages from "./ProductImages";
import ProductInfo from "./ProductInfo";
import { Product } from "@/types/product";
import { useUser } from "@/context/UserContext";

/**
 * 상품 상세 상단 컴포넌트
 * 
 * 역할:
 * - 좌측: 상품 이미지(ProductImages)
 * - 우측: 상품 정보(ProductInfo)
 * - 전체 레이아웃(grid) 구성
 */
interface ProductDetailTopProps {
  product: Product;
}

export default function ProductDetailTop({ product }: ProductDetailTopProps) {
  const { user } = useUser();   

  // 관리자 여부 판단 (role은 백엔드에서 내려오는 값에 따라 변경)
  const isAdmin = user?.role === "ADMIN";

  // mainImg 없는 상품 방어 코드 (빈 데이터 대비)
  if (!product.mainImg) return null;

  return (
    <div className="max-w-6xl mx-auto my-10 bg-white p-8 rounded-xl shadow flex flex-col">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        
        {/* 좌측 상품 이미지 */}
        <ProductImages 
          mainImg={product.mainImg} 
          subImages={product.subImages} 
        />

        {/* 우측 상품 정보. 관리자 여부 전달 */}
        <ProductInfo product={product} isAdmin={isAdmin} />

      </div>
    </div>
  );
}
