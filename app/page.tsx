"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  categoryCode: string;
}

interface MainCategory {
  code: string;
  title: string;
}

export default function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 카테고리 상태
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<any>(null);

  const [selectedMain, setSelectedMain] = useState<string | null>(null);

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const bannerImages = [
    "/images/banner1.png",
    "/images/banner2.png",
    "/images/banner3.png",
  ];

  const truncate = (text: string, max = 15) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  // 1) 인트로 확인
  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");
    if (seen !== "true") window.location.href = "/intro";
  }, []);

  // 2) 대분류만 불러오기
  useEffect(() => {
<<<<<<< HEAD
    fetch("http://localhost:8080/api/categories/main")
      .then((res) => res.text())
      .then((text) => {
        console.log("🔥 RAW RESPONSE =", text);
        try {
          const json = JSON.parse(text);
          console.log("🔥 PARSED JSON =", json);
          console.log("🔥 IS ARRAY =", Array.isArray(json));
        } catch {
          console.error("❌ JSON 파싱 불가 → HTML 응답임");
        }
      });
=======
    fetch(`${API_URL}/api/categories/main`)
      .then((res) => res.json())
      .then((data) => setMainCategories(data))
      .catch(console.error);
>>>>>>> main
  }, []);

  // 3) 전체 트리 불러오기
  useEffect(() => {
    fetch(`${API_URL}/api/categories/tree`)
      .then((res) => res.json())
      .then((data) => setCategoryTree(data.tree))
      .catch(console.error);
  }, []);

  // 4) 전체 상품 불러오기
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 5) 대분류 선택하여 필터링
  const filteredProducts =
    selectedMain && categoryTree
      ? (() => {
          const midList = categoryTree[selectedMain].children;

          // mid → leaf 목록 전체 수집
          const leafCodes = Object.values(midList).flatMap(
            (mid: any) => Object.keys(mid.children)
          );

          return products.filter((p) => leafCodes.includes(p.categoryCode));
        })()
      : products;

  // 6) 페이징 계산
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
        className="w-full h-[45vh] sm:h-[55vh] md:h-[65vh]"
      >
        {bannerImages.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img
              src={src}
              alt={`banner-${idx}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 상품 목록 */}
      <div className="w-full max-w-6xl mt-24 mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          상품 목록
        </h1>

        {/* 대분류 메뉴 */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => {
              setSelectedMain(null);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full border transition cursor-pointer ${
              !selectedMain
                ? "bg-black text-white border-black"
                : "hover:bg-gray-100"
            }`}
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
              className={`px-4 py-2 rounded-full border transition cursor-pointer ${
                selectedMain === cat.code
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-100"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        {/* 상품 grid */}
        {loading || !categoryTree ? (
          <div className="w-full flex flex-col items-center justify-center py-10">
            <p className="text-gray-700 mb-3">상품 불러오는 중...</p>
            <img
              src="/images/signature_w.png"
              alt="Loading"
              className="inline-block w-8 h-8 md:w-20 md:h-20 animate-spin-slow"
            />
          </div>
        ) : currentProducts.length === 0 ? (
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
                  <img
                    src={p.mainImg || "/images/default_main.png"}
                    alt={p.productName}
                    className="w-full h-full object-contain"
                  />
                </div>

                <p className="text-gray-800 text-center text-base font-medium mt-3 mb-1">
                  {truncate(p.productName)}
                </p>

                <p className="text-gray-500 text-sm line-through">
                  {p.consumerPrice.toLocaleString()}원
                </p>

                <p className="text-black font-bold mt-1 text-lg">
                  {p.consumerPrice &&
                    p.sellPrice &&
                    p.consumerPrice > p.sellPrice && (
                      <span className="text-red-500 px-2 font-bold">
                        {Math.round(
                          ((p.consumerPrice - p.sellPrice) /
                            p.consumerPrice) *
                            100
                        )}
                        %
                      </span>
                    )}
                  {p.sellPrice.toLocaleString()}원
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded transition cursor-pointer ${
                  currentPage === page
                    ? "bg-black text-white border-black"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
