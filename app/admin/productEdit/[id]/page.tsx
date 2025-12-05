"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import ImageUpload from "../../../ui/ImageUpload";
import Textarea from "../../../ui/Textarea";
import MultiImageUpload from "../../../ui/MultiImageUpload";
import { Plus, Trash2 } from "lucide-react";

import type { AdminProduct, AdminProductOption } from "@/types/adminProduct";
import type { CategoryTree } from "@/types/category";

export default function ProductEditPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [selectedBig, setSelectedBig] = useState<string>("");
  const [selectedMid, setSelectedMid] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // 카테고리 트리 fetch
  // ------------------------------
  useEffect(() => {
    if (!API_URL) return;

    fetch(`${API_URL}/api/categories/tree`)
      .then((res) => res.json())
      .then((data) => setCategoryTree(data.tree as CategoryTree))
      .catch(console.error);
  }, [API_URL]);

  // ------------------------------
  // 기존 상품 정보 fetch
  // ------------------------------
  useEffect(() => {
    if (!productId || !API_URL) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${productId}`);
        if (!res.ok) throw new Error("상품을 불러오는 중 오류 발생");

        const raw: any = await res.json();
        const basePrice = raw.sellPrice ?? 0;

        // 백엔드 응답을 AdminProduct 형태로 정규화
        const normalized: AdminProduct = {
          productId: raw.productId,
          productName: raw.productName,
          description: raw.description ?? "",
          consumerPrice: raw.consumerPrice ?? 0,
          sellPrice: basePrice,
          stock: raw.stock ?? 0,
          isOption: !!raw.isOption,
          mainImg: raw.mainImg ?? "",
          images: raw.images ?? [],
          productStatus: raw.productStatus ?? 10,
          isShow: raw.isShow ?? true,
          categoryCode: raw.categoryCode ?? "",
          options: (raw.options ?? []).map((opt: any): AdminProductOption => ({
            optionId: opt.optionId,
            optionType: opt.optionType ?? "N",
            optionTitle: opt.optionTitle ?? "",
            optionValue: opt.optionValue ?? "",
            // extraPrice = 옵션 최종가 - 기본가
            extraPrice: (opt.sellPrice ?? basePrice) - basePrice,
            sellPrice: opt.sellPrice ?? basePrice,
            stock: opt.stock ?? 0,
            isShow: opt.isShow ?? true,
            colorCode: opt.colorCode ?? "",
            consumerPrice: opt.consumerPrice ?? raw.consumerPrice ?? 0,
          })),
        };

        setProduct(normalized);

        // 카테고리 선택 초기화
        if (normalized.categoryCode && categoryTree) {
          outer: for (const [bigCode, bigNode] of Object.entries(
            categoryTree
          )) {
            for (const [midCode, midNode] of Object.entries(bigNode.children)) {
              if (midNode.children[normalized.categoryCode]) {
                setSelectedBig(bigCode);
                setSelectedMid(midCode);
                break outer;
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API_URL, productId, categoryTree]);

  // ------------------------------
  // 핸들러
  // ------------------------------
  const handleChange = (field: keyof AdminProduct, value: any) => {
    if (!product) return;
    setProduct((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const addOption = () => {
    if (!product) return;

    const newOption: AdminProductOption = {
      optionType: "N",
      optionTitle: "",
      optionValue: "",
      extraPrice: 0,
      stock: 0,
      isShow: true,
      colorCode: "",
      consumerPrice: product.consumerPrice ?? 0,
    };

    setProduct((prev) =>
      prev ? { ...prev, options: [...prev.options, newOption] } : prev
    );
  };

  const updateOption = (
    idx: number,
    field: keyof AdminProductOption,
    value: any
  ) => {
    if (!product) return;
    setProduct((prev) => {
      if (!prev) return prev;
      const newOptions = [...prev.options];
      newOptions[idx] = { ...newOptions[idx], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index: number) => {
    if (!product) return;
    setProduct((prev) =>
      prev
        ? { ...prev, options: prev.options.filter((_, i) => i !== index) }
        : prev
    );
  };

  // ------------------------------
  // 저장
  // ------------------------------
  const handleSave = async () => {
    if (!product) return;

    if (!product.productName || !product.sellPrice) {
      return alert("필수 항목이 비어있습니다.");
    }

    const payload: AdminProduct = {
      ...product,
      stock: product.isOption ? 0 : product.stock,
      options: product.isOption
        ? product.options.map((opt) => ({
            ...opt,
            // DB에 저장할 최종 옵션가
            sellPrice: (product.sellPrice || 0) + (opt.extraPrice || 0),
          }))
        : [],
    };

    try {
      const res = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");

      alert("상품 정보가 저장되었습니다.");
      router.push("/admin/productList");
    } catch (err) {
      console.error(err);
      alert("상품 저장 중 오류가 발생했습니다.");
    }
  };

  // ------------------------------
  // 로딩
  // ------------------------------
  if (loading || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        상품 불러오는 중...
        <img
          src="/images/signature_w.png"
          alt="Loading"
          className="inline-block w-8 h-8 md:w-20 md:h-20 mx-[2px] -mb-2 animate-spin-slow"
        />
      </div>
    );
  }

  // ==============================
  // 렌더링
  // ==============================
  return (
    <div className="py-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 pb-2 border-b border-gray-200">
          상품 수정
        </h1>

        <div className="grid md:grid-cols-2 gap-10 mt-6">
          {/* 왼쪽: 이미지 */}
          <div className="flex flex-col gap-6">
            <ImageUpload
              image={product.mainImg}
              onChange={(value) => handleChange("mainImg", value)}
            />

            {/* 필요하면 상세 이미지도 수정 가능하게 */}
            <p className="font-semibold mt-4">상세 이미지</p>
            <MultiImageUpload
              images={product.images || []}
              onChange={(imgs) => handleChange("images", imgs)}
            />
          </div>

          {/* 우측: 상품 정보 */}
          <div className="flex flex-col gap-6 md:w-1/2">
            <Input
              label="상품명"
              value={product.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              placeholder="상품명을 입력하세요"
            />

            {/* 카테고리 선택 */}
            {categoryTree && (
              <div className="flex flex-col gap-2">
                <p className="font-semibold">카테고리 선택</p>

                {/* 대분류 */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryTree).map(([bigCode, bigNode]) => (
                    <button
                      key={bigCode}
                      className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${
                        selectedBig === bigCode
                          ? "bg-black text-white border-black"
                          : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedBig(bigCode);
                        setSelectedMid("");
                        handleChange("categoryCode", "");
                      }}
                    >
                      {bigNode.title}
                    </button>
                  ))}
                </div>

                {/* 중분류 */}
                {selectedBig && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(categoryTree[selectedBig].children).map(
                      ([midCode, midNode]) => (
                        <button
                          key={midCode}
                          className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${
                            selectedMid === midCode
                              ? "bg-black text-white border-black"
                              : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                          }`}
                          onClick={() => {
                            setSelectedMid(midCode);
                            handleChange("categoryCode", "");
                          }}
                        >
                          {midNode.title}
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* 소분류 */}
                {selectedBig && selectedMid && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(
                      categoryTree[selectedBig].children[selectedMid].children
                    ).map(([leafCode, leafName]) => (
                      <button
                        key={leafCode}
                        className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${
                          product.categoryCode === leafCode
                            ? "bg-black text-white border-black"
                            : "bg-gray-100 border-gray-200 hover:bg-gray-200"
                        }`}
                        onClick={() => handleChange("categoryCode", leafCode)}
                      >
                        {leafName}
                      </button>
                    ))}
                  </div>
                )}

                {product.categoryCode && (
                  <p className="text-sm text-gray-500 mt-1">
                    선택된 카테고리: {product.categoryCode}
                  </p>
                )}
              </div>
            )}

            <Textarea
              label="상품 설명"
              value={product.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={6}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="소비자가"
                type="number"
                value={product.consumerPrice ?? 0}
                onChange={(e) =>
                  handleChange("consumerPrice", Number(e.target.value))
                }
              />
              <Input
                label="기본 판매가"
                type="number"
                value={product.sellPrice}
                onChange={(e) =>
                  handleChange("sellPrice", Number(e.target.value))
                }
              />
              {!product.isOption && (
                <Input
                  label="재고"
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    handleChange("stock", Number(e.target.value))
                  }
                />
              )}
            </div>

            {/* 상품 노출 여부 / 상태 */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  상품 노출 여부
                </label>
                <select
                  value={product.isShow ? "yes" : "no"}
                  onChange={(e) =>
                    handleChange("isShow", e.target.value === "yes")
                  }
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="yes">노출</option>
                  <option value="no">숨김</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  상품 상태
                </label>
                <select
                  value={product.productStatus}
                  onChange={(e) =>
                    handleChange("productStatus", Number(e.target.value))
                  }
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value={10}>정상</option>
                  <option value={20}>품절</option>
                  <option value={21}>재고확보중</option>
                  <option value={40}>판매중지</option>
                  <option value={90}>판매종료</option>
                </select>
              </div>
            </div>

            {/* 옵션 상품 여부 */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={product.isOption}
                onChange={(e) => handleChange("isOption", e.target.checked)}
              />
              <span className="ml-2 text-sm">옵션 상품 여부</span>
            </div>

            {/* 옵션 목록 */}
            {product.isOption && (
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-700">옵션 목록</p>
                  <button
                    type="button"
                    onClick={addOption}
                    className="w-6 h-6 flex mx-2 items-center justify-center bg-black text-white rounded-full cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {product.options.map((opt, idx) => {
                  const base = product.sellPrice || 0;
                  const extra = opt.extraPrice || 0;
                  const finalPrice = base + extra;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold mb-1">
                            옵션 타입
                          </label>
                          <select
                            value={opt.optionType}
                            onChange={(e) =>
                              updateOption(
                                idx,
                                "optionType",
                                e.target.value as "N" | "C"
                              )
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option value="N">일반</option>
                            <option value="C">색상</option>
                          </select>
                        </div>

                        <Input
                          label="옵션 제목"
                          value={opt.optionTitle}
                          onChange={(e) =>
                            updateOption(idx, "optionTitle", e.target.value)
                          }
                          placeholder="예: 색상, 사이즈"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          label="옵션 값"
                          value={opt.optionValue}
                          onChange={(e) =>
                            updateOption(idx, "optionValue", e.target.value)
                          }
                          placeholder="예: Ivory, Green"
                        />
                        <Input
                          label="추가금"
                          type="number"
                          value={opt.extraPrice ?? 0}
                          onChange={(e) =>
                            updateOption(
                              idx,
                              "extraPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                        <Input
                          label="재고"
                          type="number"
                          value={opt.stock}
                          onChange={(e) =>
                            updateOption(idx, "stock", Number(e.target.value))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {/* 최종 가격 프리뷰 */}
                        <div className="text-xs text-gray-600">
                          기본가 {base.toLocaleString()}원 + 추가금{" "}
                          {extra.toLocaleString()}원 ={" "}
                          <span className="font-semibold text-black">
                            {finalPrice.toLocaleString()}원
                          </span>
                        </div>

                        {opt.optionType === "C" && (
                          <div className="flex-1">
                            <Input
                              label="색상 코드"
                              value={opt.colorCode || ""}
                              onChange={(e) =>
                                updateOption(idx, "colorCode", e.target.value)
                              }
                              placeholder="#FFFFFF"
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold">노출</label>
                          <input
                            type="checkbox"
                            checked={opt.isShow}
                            onChange={(e) =>
                              updateOption(idx, "isShow", e.target.checked)
                            }
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="p-2 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button className="w-full mt-6 py-3 text-lg" onClick={handleSave}>
              상품 수정
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
