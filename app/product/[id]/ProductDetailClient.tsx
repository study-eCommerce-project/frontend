"use client";

import { useState } from "react";
import { Heart, Plus, Minus } from "lucide-react";

export default function ProductDetailClient({ product }: any) {
  const [count, setCount] = useState(1);
  const [liked, setLiked] = useState(false);

  // 🔥 메인 이미지 + 서브 이미지 배열 정리
  const mainImg = product.mainImg;
  const subImages: string[] = product.subImages || [];

  const allImages = [mainImg, ...subImages];

  const [currentImg, setCurrentImg] = useState(mainImg);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-4 gap-10 py-10">

      {/* ----------------------------- */}
      {/* LEFT 영역 = 스크롤 되는 부분 */}
      {/* ----------------------------- */}
      <div className="col-span-3 space-y-10">

        {/* 🔹 1. 메인 + 썸네일 */}
        <div className="flex gap-6 bg-white p-6 rounded-xl shadow">

          {/* 🔸썸네일 리스트 */}
          <div className="flex flex-col gap-3">
            {allImages.map((img, i) => (
              <img
                key={i}
                src={img}
                className={`w-20 h-20 rounded-lg object-cover cursor-pointer border
                  ${currentImg === img ? "border-blue-500" : "border-gray-300"}`}
                onClick={() => setCurrentImg(img)}
              />
            ))}
          </div>

          {/* 🔸 대표 이미지 */}
          <div className="flex-1 flex justify-center items-center">
            <img
              src={currentImg}
              className="w-[420px] rounded-xl object-contain"
            />
          </div>

        </div>

        {/* 🔥🔥🔥 상세 페이지 전체를 하나의 화이트 박스로 묶기 */}
        <div className="bg-white p-10 rounded-xl shadow space-y-14">

          {/* 1. 상세 설명 박스 */}
          <div className="prose prose-lg max-w-none">
            <h2 className="font-bold">제품 특징 안내</h2>
            <p>이 제품은 데일리로 착용하기 편안한 핏과 소재로 제작되었습니다.</p>
          </div>

          {/* 2. 상세 이미지 1 */}
          {subImages[0] && (
            <img
              src={subImages[0]}
              className="w-full rounded-xl object-cover"
            />
          )}

          {/* 3. 상세 텍스트 */}
          <div className="prose prose-lg max-w-none">
            <h3 className="font-bold">디자인 포인트</h3>
            <p>세련된 라인과 편안한 쿠셔닝을 제공합니다.</p>
          </div>

          {/* 4. 상세 이미지 2 */}
          {subImages[1] && (
            <img
              src={subImages[1]}
              className="w-full rounded-xl object-cover"
            />
          )}

          {/* 5. 상세 텍스트 */}
          <div className="prose prose-lg max-w-none">
            <h3 className="font-bold">품질과 소재</h3>
            <p>EVA 쿠셔닝과 고급 소재를 사용해 장시간 착용도 문제 없습니다.</p>
          </div>

        </div>

      </div>

      {/* ----------------------------- */}
      {/* RIGHT BUY BOX (STICKY 고정) */}
      {/* ----------------------------- */}
      <div className="col-span-1 sticky top-24 h-fit bg-white p-8 rounded-xl shadow flex flex-col gap-6 w-[400px]">

        <h1 className="text-2xl font-bold">{product.productName}</h1>

        <div>
          <p className="text-gray-400 line-through text-sm">
            {product.consumerPrice?.toLocaleString()}원
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {product.sellPrice?.toLocaleString()}원
          </p>
          <p className="text-gray-600 mt-1 text-sm">재고: {product.stock}개</p>
        </div>

        {/* 수량 조절 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCount(v => Math.max(1, v - 1))}
            className="p-2 bg-gray-200 rounded"
          >
            <Minus />
          </button>
          <span className="text-lg font-semibold">{count}</span>
          <button
            onClick={() => setCount(v => v + 1)}
            className="p-2 bg-gray-200 rounded"
          >
            <Plus />
          </button>
        </div>

        {/* 장바구니 */}
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
          장바구니 담기
        </button>

      </div>

    </div>
  );
}
