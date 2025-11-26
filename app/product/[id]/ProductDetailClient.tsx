"use client";

import { useEffect, useState } from "react";
import ProductDetailTop from "@/app/product/components/ProductDetailTop";
import ProductDetailBottom from "@/app/product/components/ProductDetailBottom";


export default function ProductDetailClient({ productId }: { productId: number }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}/detail`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setProduct(data));
  }, [productId]);

  if (!product) return <div>로딩 중...</div>;

  return (
    <div className="w-full">
      <ProductDetailTop product={product} />
      <ProductDetailBottom product={product} />
    </div>
  );
}
