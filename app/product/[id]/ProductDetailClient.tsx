"use client";

import { useEffect, useState } from "react";
import ProductDetailTop from "@/components/product/ProductDetailTop";
import ProductDetailBottom from "@/components/product/ProductDetailBottom";


export default function ProductDetailClient({ productId }: { productId: number }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${productId}/detail`, {
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
