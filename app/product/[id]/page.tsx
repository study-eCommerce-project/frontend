import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ params }: any) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const { id } = await params; // ⬅ Next.js 15 규칙

  const res = await fetch(`${API_URL}/api/products/${id}/detail`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("❌ 상품 정보를 불러오지 못했습니다.");
  }

  const product = await res.json();

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12">
      <ProductDetailClient product={product} />
    </div>
  );
}
