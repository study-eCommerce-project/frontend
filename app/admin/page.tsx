"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CategoryTreeAccordion from "./components/CategoryTreeAccordion";
import FabAddButton from "./components/FabAddButton";

interface Product {
  productId: number;
  productName: string;
  sellPrice: number;
  stock: number;
  mainImg?: string;
}

export default function AdminMainPage() {
  const router = useRouter();

  // 단일 카테고리 선택을 위한 상태
  const [selectedLeaf, setSelectedLeaf] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState<any>(null);


  // 카테고리 트리 로드
  useEffect(() => {
    async function loadTree() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/tree`);
      const data = await res.json();
      setCategoryTree(data.tree);
    }
    loadTree();
  }, []);

  // 소분류 선택 시 상품 불러오기
  useEffect(() => {
    if (!selectedLeaf) {
      setProducts([]); // 카테고리가 선택되지 않으면 상품 초기화
      return;
    }

    const fetchProducts = async () => {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/products?category=${selectedLeaf}` // 선택된 카테고리로 상품 필터링
        );
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedLeaf]);

  // 카테고리 선택 핸들러
  const handleCategorySelect = (leafCode: string) => {
    setSelectedLeaf(leafCode); // 선택된 카테고리 업데이트
  };

  return (
    <div className="flex gap-6 p-6 min-h-screen w-full">
      {/* 🔵 왼쪽 카테고리 트리 */}
      <div className="w-72">
        {categoryTree ? (
          <CategoryTreeAccordion
            data={categoryTree}
            onSelect={handleCategorySelect} // 카테고리 선택 시 핸들러 호출
            selectedLeaf={selectedLeaf} // 선택된 카테고리 전달
          />
        ) : (
          <p>카테고리 불러오는 중...</p>
        )}
      </div>

      {/* 🟣 오른쪽 상품 리스트 */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <h1 className="text-xl font-bold mb-4">
          {selectedLeaf ? "상품 목록" : "카테고리를 선택해주세요"}
        </h1>

        {loading ? (
          <p>상품 불러오는 중...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500">해당 카테고리에 상품이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <li
                key={p.productId}
                onClick={() =>
                  router.push(`/admin/productEdit/${p.productId}`)
                }
                className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              >
                {p.mainImg && (
                  <img
                    src={p.mainImg}
                    alt={p.productName}
                    className="w-full h-40 object-contain mb-2"
                  />
                )}
                <p className="font-semibold">{p.productName}</p>
                <p>{p.sellPrice.toLocaleString()}원</p>
                <p className="text-gray-500">재고: {p.stock}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🟦 플로팅 + 버튼 */}
      <FabAddButton />
    </div>
  );
}
