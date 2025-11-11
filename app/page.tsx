"use client";
import Link from "next/link";
import { products } from "./lib/products";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 px-4">
      {/* 배너 */}
      <div className="w-full h-full overflow-hidden">
        <img
          src="images/banner.png"
          alt="banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 상품 목록 */}
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">상품 목록</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-gray-800 text-center">
                {p.name}
              </div>

              <div className="text-gray-600 text-sm mt-2">
                {p.price.toLocaleString()}원
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
