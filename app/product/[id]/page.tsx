import ProductDetailClient from "./ProductDetailClient";

/**
 * 상품 상세 페이지 (서버 컴포넌트)
 *
 * Next.js 15에서는 route params가 Promise 형태로 전달됨
 *    → 반드시 async 함수 + await params 로 언랩해야 함
 *
 * 역할:
 * - 동적 라우트 /product/[id] 에서 전달되는 params 해석
 * - 상품 ID를 추출하여 클라이언트 컴포넌트에 전달
 *
 * 특징:
 * - 서버 컴포넌트 → SEO / pre-rendering 유리
 * - 실제 상호작용(좋아요, 장바구니 등)은 클라이언트 컴포넌트에서 처리
 */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ext.js 15에서 필수: params Promise 언랩

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12">
      {/* 클라이언트 컴포넌트에 상품 ID 전달 */}
      <ProductDetailClient productId={Number(id)} />
    </div>
  );
}

