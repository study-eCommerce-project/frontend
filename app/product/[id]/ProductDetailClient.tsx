"use client";

import ProductDetailTop from "@/components/product/ProductDetailTop";
import ProductDetailBottom from "@/components/product/ProductDetailBottom";

export default function ProductDetailClient({ product }: any) {
  return (
    <div className="max-w-6xl mx-auto py-10">
      <ProductDetailTop product={product} />
      <ProductDetailBottom product={product} />
    </div>
  );
}