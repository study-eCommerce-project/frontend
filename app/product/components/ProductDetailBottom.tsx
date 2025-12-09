"use client";

import { toFullUrl } from "@/lib/utils/toFullUrl";
import { useProductDetailTabs } from "@/hooks/useProductDetailTabs";
import { DetailBlock } from "@/types/product";

export default function ProductDetailBottom({ product }: any) {
  const { infoRef } = useProductDetailTabs();

  let blocks: DetailBlock[] = [];

  try {
    if (product.description) {
      blocks = JSON.parse(product.description);
    }
  } catch (e) {
    console.error("description JSON parse error", e);
  }

  return (
    <div className="bg-white mt-20 rounded-xl shadow px-8 py-10 max-w-4xl mx-auto">
      <section id="info" ref={infoRef} className="space-y-6 text-center">
        <h2 className="text-2xl font-bold mb-4">제품 상세 정보</h2>

        <div className="space-y-6 max-w-3xl mx-auto">
          {blocks.map((block, idx) => {
            if (block.type === "text") {
              return (
                <p key={idx} className="text-gray-700 whitespace-pre-line">
                  {block.content}
                </p>
              );
            }

            if (block.type === "image") {
              return (
                <img
                  key={idx}
                  src={toFullUrl(block.url)}
                  className="w-full rounded-xl"
                  alt=""
                />
              );
            }

            return null;
          })}
        </div>
      </section>
    </div>
  );
}
