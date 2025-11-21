"use client";

import { useState, useEffect } from "react";
import { CATEGORY_TREE, MainCategory, SubCategory } from "../lib/categories";

interface Product {
  productId: number;
  productName: string;
  sellPrice: number;
  stock: number;
  mainImg?: string;
}

export default function AdminCategoryPage() {
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [selectedLeaf, setSelectedLeaf] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const mainCategory: MainCategory | undefined =
    selectedMain ? CATEGORY_TREE[selectedMain] : undefined;

  const subCategory: SubCategory | undefined =
    selectedMain && selectedSub
      ? CATEGORY_TREE[selectedMain].children[selectedSub]
      : undefined;

  const leafTitle: string | undefined =
    selectedLeaf && selectedMain && selectedSub
      ? CATEGORY_TREE[selectedMain].children[selectedSub].children[selectedLeaf]
      : undefined;

  useEffect(() => {
    if (!selectedLeaf) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/products?category=${selectedLeaf}`);
        if (!res.ok) throw new Error("상품 불러오기 실패");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedLeaf]);

  return (
    <div className="flex gap-6 p-6 min-h-screen">
      {/* --- 왼쪽: 카테고리 드롭다운 --- */}
      <div className="w-72 bg-white rounded-xl shadow p-4 flex flex-col gap-2">
        <h2 className="text-lg font-semibold mb-2">카테고리 선택</h2>

        <ul className="space-y-1">
          {Object.entries(CATEGORY_TREE).map(([mainCode, mainItem]) => (
            <li key={mainCode}>
              {/* 대분류 */}
              <div
                onClick={() => {
                  setSelectedMain(mainCode);
                  setSelectedSub(null);
                  setSelectedLeaf(null);
                }}
                className={`cursor-pointer p-2 rounded font-medium ${
                  selectedMain === mainCode
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {mainItem.title}
              </div>

              {/* 선택된 대분류의 중분류만 표시 */}
              {selectedMain === mainCode && (
                <ul className="ml-4 mt-1 space-y-1">
                  {Object.entries(mainItem.children).map(([subCode, subItem]) => (
                    <li key={subCode}>
                      <div
                        onClick={() => {
                          setSelectedSub(subCode);
                          setSelectedLeaf(null);
                        }}
                        className={`cursor-pointer p-2 rounded ${
                          selectedSub === subCode
                            ? "bg-gray-700 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {subItem.title}
                      </div>

                      {/* 선택된 중분류의 소분류만 표시 */}
                      {selectedSub === subCode && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {Object.entries(subItem.children).map(([leafCode, leafTitle]) => (
                            <li
                              key={leafCode}
                              onClick={() => setSelectedLeaf(leafCode)}
                              className={`cursor-pointer p-2 rounded ${
                                selectedLeaf === leafCode
                                  ? "bg-gray-600 text-white"
                                  : "hover:bg-gray-100"
                              }`}
                            >
                              {leafTitle}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* --- 오른쪽: 선택된 카테고리의 상품 목록 --- */}
      <div className="flex-1 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-4">
          {leafTitle ? `${leafTitle} 상품 목록` : "상품 목록"}
        </h2>

        {loading ? (
          <p>상품 불러오는 중...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">선택된 카테고리에 상품이 없습니다.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <li
                key={p.productId}
                className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition"
              >
                {p.mainImg && (
                  <img
                    src={p.mainImg}
                    alt={p.productName}
                    className="w-full h-40 object-contain mb-2"
                  />
                )}
                <p className="font-semibold text-gray-800">{p.productName}</p>
                <p className="text-gray-600">{p.sellPrice.toLocaleString()}원</p>
                <p className="text-gray-400">재고: {p.stock}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
