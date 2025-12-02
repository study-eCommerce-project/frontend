"use client";
import { useState, useRef } from "react";
import { Product } from "@/types/product";
import { toFullUrlCDN } from "@/lib/utils/toFullUrlCDN";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";

import { ChevronLeft, ChevronRight, Fullscreen, X } from "lucide-react";

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
  const swiperRef = useRef<any>(null);

  // 슬라이더 현재 인덱스
  const [activeIndex, setActiveIndex] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /** ----------------------------------------
   * 썸네일 목록
   *
   * - subImages가 존재 → subImages를 toFullUrl로 변환
   * - 없다면 대표 이미지 1장만 표시
   * ---------------------------------------- */
  const thumbnails = Array.from(
    new Set([
      toFullUrlCDN(mainImg || "/images/default_main.png"),
      ...(subImages?.map((img) => toFullUrlCDN(img)) ?? []),
    ])
  );

  return (
    <div className="flex flex-row gap-6">
      {/* ----------------------------------------
          좌측: 썸네일 이미지 리스트
      ---------------------------------------- */}
      <div className="flex flex-col gap-2">
        {thumbnails.map((thumb, idx) => (
          <img
            key={idx}
            src={thumb}
            alt={`thumbnail${idx}`}
            className={`
              w-20 h-20 object-contain rounded cursor-pointer
              ${activeIndex === idx
                ? "border border-gray-600"
                : "border border-transparent opacity-70 hover:opacity-100"
              }
            `}
            onClick={() => {
              swiperRef.current?.slideTo(idx);
              setActiveIndex(idx);
            }}
          />
        ))}
      </div>

      {/* ----------------------------------------
          우측: 메인 이미지
      ---------------------------------------- */}
      <div className="flex-1 relative w-full overflow-hidden">
        {/* 좌우 버튼 */}
        <button
          className="swiper-button-prev-custom absolute left-2 top-1/2 z-10 -translate-y-1/2 bg-white/70 shadow-sm rounded-full p-1.5 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          className="swiper-button-next-custom absolute right-2 top-1/2 z-10 -translate-y-1/2 bg-white/70 shadow-sm rounded-full p-1.5 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        <Swiper
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          spaceBetween={10}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          modules={[Navigation]}
          className="rounded-lg h-full"
        >
          {thumbnails.map((thumb, idx) => (
            <SwiperSlide key={idx}>
              <img
                key={idx}
                src={thumb}
                alt={`main${idx}`}
                className="w-full h-full object-contain rounded-lg"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* 이미지 전체보기 버튼 */}
        <div className="flex justify-center relative z-20">
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 cursor-pointer"
          >
            <Fullscreen size={24} />
          </button>
        </div>
      </div>
      
      {/* 모달: 현재 메인 이미지 단일 확대 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center">
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={thumbnails[activeIndex]}
              alt={`fullview${activeIndex}`}
              className="w-xl object-contain"
            />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
