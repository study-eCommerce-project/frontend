"use client";

import { useEffect, useState } from "react";

interface Product {
  productId: number;
  productName: string;
  consumerPrice: number;
  sellPrice: number;
  mainImg: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState<Product>({
    productId: 0,
    productName: "",
    consumerPrice: 0,
    sellPrice: 0,
    mainImg: "",
  });

  // 상품 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // 상품 등록
  const handleAddProduct = () => {
    setProducts([...products, { ...newProduct, productId: Date.now() }]);
    setNewProduct({ productId: 0, productName: "", consumerPrice: 0, sellPrice: 0, mainImg: "" });
  };

  // 상품 삭제
  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.productId !== id));
  };

  // 상품 수정
  const handleUpdateProduct = (id: number, updated: Partial<Product>) => {
    setProducts(products.map((p) => (p.productId === id ? { ...p, ...updated } : p)));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>

      {/* 상품 등록 폼 */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">상품 등록</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <input
            type="text"
            placeholder="상품명"
            value={newProduct.productName}
            onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="소비자가"
            value={newProduct.consumerPrice}
            onChange={(e) => setNewProduct({ ...newProduct, consumerPrice: Number(e.target.value) })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="판매가"
            value={newProduct.sellPrice}
            onChange={(e) => setNewProduct({ ...newProduct, sellPrice: Number(e.target.value) })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="이미지 URL"
            value={newProduct.mainImg}
            onChange={(e) => setNewProduct({ ...newProduct, mainImg: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            등록
          </button>
        </div>
      </div>

      {/* 상품 목록 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">상품 목록</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">상품명</th>
                <th className="py-2 px-4 text-left">소비자가</th>
                <th className="py-2 px-4 text-left">판매가</th>
                <th className="py-2 px-4 text-left">이미지</th>
                <th className="py-2 px-4 text-left">액션</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.productId} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{p.productId}</td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={p.productName}
                      onChange={(e) => handleUpdateProduct(p.productId, { productName: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={p.consumerPrice}
                      onChange={(e) =>
                        handleUpdateProduct(p.productId, { consumerPrice: Number(e.target.value) })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={p.sellPrice}
                      onChange={(e) =>
                        handleUpdateProduct(p.productId, { sellPrice: Number(e.target.value) })
                      }
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      value={p.mainImg}
                      onChange={(e) => handleUpdateProduct(p.productId, { mainImg: e.target.value })}
                      className="border p-1 rounded w-full"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleDeleteProduct(p.productId)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
