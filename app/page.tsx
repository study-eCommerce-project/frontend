"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_TREE } from "./lib/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
  categoryCode: string; // 소분류 코드
}

// 대분류만 추출
const mainCategories = Object.entries(CATEGORY_TREE).map(([code, data]) => ({
  code,
  title: data.title,
}));

const bannerImages = ["/images/banner1.png", "/images/banner2.png", "/images/banner3.png"];

const truncate = (text: string, max = 10) =>
  text.length > max ? text.slice(0, max) + "..." : text;

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const pageSize = 8;


  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");

    if (seen !== "true") {
      window.location.href = "/intro";
    }
  }, []);

  // 3) 상품 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 선택된 대분류에 속한 상품만 필터링
  const filteredProducts = selectedMain
    ? products.filter((p) => {
      const mainChildren = CATEGORY_TREE[selectedMain].children;
      const allLeafCodes = Object.values(mainChildren).flatMap((sub) =>
        Object.keys(sub.children)
      );
      return allLeafCodes.includes(p.categoryCode);
    })
    : products;

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + pageSize);

  return (
    <div className="w-full overflow-x-hidden">
      {/* 배너 */}
      <Swiper
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full h-full"
      >
        {bannerImages.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img src={src} alt={`banner-${idx}`} className="w-full h-full object-cover" draggable={false} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 상품 목록 */}
      <div className="w-full max-w-6xl mt-24 mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">상품 목록</h1>

        {/* 대분류 메뉴 */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => {
              setSelectedMain(null);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full border transition cursor-pointer ${!selectedMain ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
          >
            전체보기
          </button>
          {mainCategories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => {
                setSelectedMain(cat.code);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full border transition cursor-pointer ${selectedMain === cat.code ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* 상품 grid */}
        {loading ? (
          // ★ 로딩 화면 ★
          <div className="w-full flex flex-col items-center justify-center py-10">
            <p className="text-gray-700 mb-3">상품 불러오는 중...</p>
            <img
              src="/images/signature_w.png"
              alt="Loading"
              className="inline-block w-8 h-8 md:w-20 md:h-20 animate-spin-slow"
            />
          </div>
        ) : currentProducts.length === 0 ? (
          // ★ 상품 없음 화면 ★
          <div className="w-full flex flex-col items-center justify-center py-20">
            <p className="text-gray-500">등록된 상품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {currentProducts.map((p) => (
              <Link
                key={p.productId}
                href={`/product/${p.productId}`}
                className="text-center bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col cursor-pointer overflow-hidden"
              >
                <div className="w-full rounded-xl overflow-hidden flex items-center justify-center bg-white">
                  <img src={p.mainImg || "/images/default_main.png"} alt={p.productName} className="w-full h-full object-contain" />
                </div>

                <p className="text-gray-800 text-center text-base font-medium mt-3 mb-1">
                  {truncate(p.productName, 15)}
                </p>

                <p className="text-gray-500 text-sm line-through">{p.consumerPrice.toLocaleString()}원</p>

                <p className="text-black font-bold mt-1 text-lg">
                  {p.consumerPrice && p.sellPrice && p.consumerPrice > p.sellPrice && (
                    <span className="text-red-500 px-2 font-bold">{Math.round(((p.consumerPrice - p.sellPrice) / p.consumerPrice) * 100)}%</span>
                  )}
                  {p.sellPrice.toLocaleString()}원
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 hover:bg-gray-100 transition cursor-pointer">
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 border rounded transition cursor-pointer ${currentPage === page ? "bg-black text-white border-black" : "hover:bg-gray-100"}`}>
              {page}
            </button>
          ))}

          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 hover:bg-gray-100 transition cursor-pointer">
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
