"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import IntroPage from "./intro/page";
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

export default function HomePage() {
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [categoryTree, setCategoryTree] = useState<any>(null);

  const [selectedMain, setSelectedMain] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const bannerImages = [
    "/images/banner1.png",
    "/images/banner2.png",
    "/images/banner3.png",
  ];

  const truncate = (text: string, max = 15) =>
    text.length > max ? text.slice(0, max) + "..." : text;

  // ▣ Intro 체크
  useEffect(() => {
    const seen = sessionStorage.getItem("introSeen");
    setShowIntro(seen === "true" ? false : true);
  }, []);

  // ▣ Main categories
  useEffect(() => {
    fetch(`${API_URL}/api/categories/main`)
      .then((res) => res.json())
      .then((data) => setMainCategories(data))
      .catch(console.error);
  }, [API_URL]);

  // ▣ Category tree
  useEffect(() => {
    fetch(`${API_URL}/api/categories/tree`)
      .then((res) => res.json())
      .then((data) => setCategoryTree(data.tree))
      .catch(console.error);
  }, [API_URL]);

  // ▣ Products
  useEffect(() => {
    fetch(`${API_URL}/api/products/list`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [API_URL]);

  // ▣ 카테고리 필터링
  const filteredProducts =
    selectedMain && categoryTree
      ? (() => {
        const midList = categoryTree[selectedMain].children;
        const leafCodes = Object.values(midList).flatMap(
          (mid: any) => Object.keys(mid.children)
        );
        return products.filter((p) => leafCodes.includes(p.categoryCode));
      })()
      : products;

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + pageSize);

  if (showIntro === null) return null; // 체크 완료 전 렌더링 X

  // ▣ 렌더링
  return showIntro ? (
    <IntroPage onFinish={() => setShowIntro(false)} />
  ) : (
    <div className="w-full overflow-x-hidden">

      {/* ▣ 1. 배너 */}
      <Swiper
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="w-full"
      >
        {bannerImages.map((src, idx) => (
          <SwiperSlide key={idx}>
            <img src={src} alt="banner" className="w-full object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ▣ 2. 카테고리 바 */}
      <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex gap-6 px-4 py-3 overflow-x-auto whitespace-nowrap">

          <button
            onClick={() => {
              setSelectedMain(null);
              setCurrentPage(1);
            }}
            className={`pb-1 text-sm cursor-pointer ${!selectedMain
              ? "text-black font-semibold border-b-2 border-black"
              : "text-gray-500 hover:text-gray-800"
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
              className={`pb-1 text-sm cursor-pointer ${selectedMain === cat.code
                ? "text-black font-semibold border-b-2 border-black"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>

      {/* ▣ 3. 상품 목록 */}
      <div className="w-full max-w-6xl mx-auto my-12 px-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedMain
              ? mainCategories.find((c) => c.code === selectedMain)?.title
              : "전체 상품"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            총 {filteredProducts.length}개 상품
          </p>
        </div>

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
            {currentProducts.map((p, index) => (
              <Link
                key={`${p.productId}-${index}`}  // key가 중복되지 않도록 productId와 index 결합
                href={`/product/${p.productId}`}
                className="text-center bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col cursor-pointer overflow-hidden"
              >
                <div className="w-full rounded-xl overflow-hidden flex items-center justify-center bg-white">
                  <img
                    src={`${BASE}${p.mainImg}` || "/images/default_main.png"}
                    alt={p.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-gray-800 text-center text-base font-medium mt-3 mb-1 line-clamp-2 min-h-[40px]">
                  {truncate(p.productName)}
                </p>
                <p
                  className={`text-gray-500 text-sm line-through ${p.consumerPrice <= p.sellPrice ? "invisible" : ""}`}
                >
                  {p.consumerPrice.toLocaleString()}원
                </p>

                <p className="text-black font-bold mt-1 text-lg">
                  {p.consumerPrice > p.sellPrice && (
                    <span className="text-red-500 px-2 font-bold">
                      {Math.round(((p.consumerPrice - p.sellPrice) / p.consumerPrice) * 100)}%
                    </span>
                  )}
                  {p.sellPrice.toLocaleString()}원
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* ▣ 4. 페이징 */}
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <ChevronLeft />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded transition cursor-pointer ${currentPage === page
                ? "bg-black text-white border-black"
                : "hover:bg-gray-100"
                }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
