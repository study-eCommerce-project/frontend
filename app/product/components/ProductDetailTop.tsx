"use client";

import ProductImages from "./ProductImages";
import { Product } from "../types";
import ProductInfo from "./ProductInfo";

export default function ProductDetailTop({ product }: { product: Product }) {
  return (
    <div className="max-w-6xl mx-auto my-10 bg-white p-8 rounded-xl shadow flex flex-col md:flex-row gap-10">
      <div className="md:w-1/2">
        <ProductImages product={product} />
      </div>
      <div className="md:w-1/2">
        <ProductInfo product={product} />
      </div>
    </div>
  );
}
