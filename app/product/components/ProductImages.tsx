"use client";
import { useState } from "react";
import { Product } from "@/types/product";
// import { toFullUrl } from "@/lib/utils/toFullUrl";
import { toFullUrlCDN } from "@/lib/utils/toFullUrlCDN";

/**
 * 상품 상세 이미지 컴포넌트
 *
 * 역할:
 * - 대표 이미지(mainImg) 표시
 * - 하단(왼쪽)의 썸네일 이미지 목록 표시
 * - 썸네일 클릭 시 메인 이미지 변경
 * - 이미지 URL은 toFullUrl() 또는 toFullUrlCDN() 로 절대 경로 변환
 *
 * 특징:
 * - 이미지 로딩 실패 방지를 위해 fallback 이미지 사용
 * - 레이아웃은 좌측 썸네일 리스트 + 우측 메인 이미지 구조
 */
export default function ProductImages({ 
  mainImg,
  subImages 
}: Pick<Product, "mainImg" | "subImages">) {

  /** ----------------------------------------
   * 메인 이미지 초기값
   * - mainImg가 없으면 default 이미지 사용
   * ---------------------------------------- */
  const initialMainImg = toFullUrlCDN(mainImg || "/images/default_main.png");

  // 현재 선택된 메인 이미지
  const [mainImage, setMainImage] = useState(initialMainImg);

  /** ----------------------------------------
   * 썸네일 목록
   *
   * - subImages가 존재 → subImages를 toFullUrl로 변환
   * - 없다면 대표 이미지 1장만 표시
   * ---------------------------------------- */  
  const thumbnails: string[] = subImages?.length
    ? subImages.map((img) => toFullUrlCDN(img))
    : [initialMainImg];

  return (
    <div className="flex flex-row gap-6">
      {/* ----------------------------------------
          좌측: 썸네일 이미지 리스트
      ---------------------------------------- */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] min-w-[5rem]">
        {thumbnails.map((thumb, idx) => (
          <img
            key={idx}
            src={thumb}
            alt={`썸네일 ${idx}`}
            className={`w-20 h-20 object-contain rounded border ${
              mainImage === thumb
               ? "border-gray-800" // 선택된 썸네일 강조
               : "border-gray-300"
            } hover:cursor-pointer`}

            // 썸네일 클릭 시 메인 이미지 변경
            onClick={() => setMainImage(thumb)}
          />
        ))}
      </div>

      {/* ----------------------------------------
          우측: 메인 이미지
      ---------------------------------------- */}
      <div className="flex-1 flex justify-center items-start">
        <img
          src={mainImage}
          alt="상품 이미지"
          className="rounded-lg object-contain max-h-[500px] w-full"
        />
      </div>
    </div>
  );
}
