"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
}

const bannerImages = [
  "/images/banner1.png",
  "/images/banner2.png",
  "/images/banner3.png",
];

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        상품 불러오는 중...
        <img
          src="/images/signature_w.png"
          alt="Loading"
          className="inline-block w-8 h-8 md:w-20 md:h-20 animate-spin-slow"
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* 배너 슬라이더 */}
      <div className="relative w-full">
        <Swiper
          modules={[Autoplay, Navigation]}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="w-full h-full"
        >
          {bannerImages.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`배너 ${idx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </SwiperSlide>
          ))}

          {/* 커스텀 버튼 (Swiper 기본 버튼 클래스 사용) */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-white bg-black/40 p-2 rounded-full hover:bg-black/60 cursor-pointer">
            <ChevronLeft size={22} />
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 text-white bg-black/40 p-2 rounded-full hover:bg-black/60 cursor-pointer">
            <ChevronRight size={22} />
          </div>
        </Swiper>
      </div>

      {/* 상품 목록 */}
      <div className="w-full max-w-6xl mt-24 mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          상품 목록
        </h1>

        {/* 카드 간격 추가 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
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

              <p className="text-gray-800 text-center text-base font-medium mt-3 mb-1 line-clamp-2 h-12">
                {p.productName}
              </p>

              <p className="text-gray-500 text-sm line-through">
                {p.consumerPrice.toLocaleString()}원
              </p>

              <p className="text-blue-600 font-bold mt-1 text-lg">
                {p.sellPrice.toLocaleString()}원
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
