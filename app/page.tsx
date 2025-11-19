"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
}

const banners = [
  "/images/banner1.jpg",
  "/images/banner2.jpg",
  "/images/banner3.jpg",
];

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);


  useEffect(() => {
    const seen = localStorage.getItem("introSeen");

    if (seen !== "true") {
      window.location.href = "/intro";
    }
  }, []);

  // 3) 상품 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 4) 배너 자동 전환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500">
        loading...
        {/* 회전하는 시그니처 이미지 */}
        <img
          src="/images/signature_b.png"
          alt="loading"
          className="w-20 h-20 animate-spin-slow"
        />
      </div>
    );
  }

  // Home 화면
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      {/* 배너 슬라이더 */}
      <div className="w-screen relative overflow-hidden h-[50vh]">
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner}
            alt={`배너 ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          />
        ))}

        {/* 슬라이더 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ease-in-out hover:cursor-pointer ${index === currentBanner
                ? "bg-white shadow-md"
                : "bg-white/50 hover:bg-white/80"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          상품 목록
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.productId}
              href={`/product/${p.productId}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col items-center cursor-pointer"
            >
              <img
                src={p.mainImg || "/images/default_main.png"}
                alt={p.productName}
                className="w-full h-40 object-contain mb-3"
              />
              <p className="text-gray-800 text-center text-sm font-medium mb-1 line-clamp-2 h-10">
                {p.productName}
              </p>
              <p className="text-gray-500 text-xs line-through">
                {p.consumerPrice.toLocaleString()}원
              </p>
              <p className="text-blue-600 font-bold mt-1">
                {p.sellPrice.toLocaleString()}원
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
