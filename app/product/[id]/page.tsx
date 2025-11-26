import ProductDetailClient from "./ProductDetailClient";

export default function ProductPage({ params }: any) {
  const { id } = params;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-12">
      <ProductDetailClient productId={id} />
    </div>
  );
}

