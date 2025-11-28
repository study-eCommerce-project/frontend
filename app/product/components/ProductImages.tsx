"use client";
import { useState } from "react";
import { Product } from "../types";

interface ProductImagesProps {
  product: Product;
}

export default function ProductImages({ product }: ProductImagesProps) {
  const toFullUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `https://image.msscdn.net${url}`;
  };

  if (!product.mainImg) return null;

  const initialMainImg = toFullUrl(product.mainImg);
  const [mainImage, setMainImage] = useState(initialMainImg);

  const thumbnails = product.subImages?.length
    ? product.subImages.map((img) => toFullUrl(img))
    : [initialMainImg];

  return (
    <div className="flex flex-row gap-6">
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] min-w-[5rem]">
        {thumbnails.map((thumb, idx) => (
          <img
            key={idx}
            src={thumb}
            className={`w-20 h-20 object-contain rounded border ${
              mainImage === thumb ? "border-gray-800" : "border-gray-300"
            } cursor-pointer`}
            onClick={() => setMainImage(thumb)}
          />
        ))}
      </div>

      <div className="flex-1 flex justify-center items-start">
        <img
          src={mainImage}
          className="rounded-lg object-contain max-h-[500px] w-full"
        />
      </div>
    </div>
  );
}
