"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { Plus, Trash2 } from "lucide-react";

import type { AdminProduct, AdminProductOption } from "@/types/adminProduct";
import type { CategoryTree } from "@/types/category";

export default function ProductNewPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  const router = useRouter();

  // ------------------------------
  // 상품 상태
  // ------------------------------
  const [product, setProduct] = useState<AdminProduct>({
    productId: 0,
    productName: "",
    description: "",
    consumerPrice: 0,
    sellPrice: 0,          // 기본 판매가
    stock: 0,              // 단품일 때 사용
    isOption: false,
    mainImg: "",
    subImages: [],           // 상품 이미지 URL 배열
    productStatus: 10,     // 10:정상
    isShow: true,
    categoryCode: "",
    options: [],
  });


  // ------------------------------
  // 총 재고 계산 
  // ------------------------------
  const totalStock = product.isOption
    ? product.options.reduce((total, option) => total + option.stock, 0)  // 옵션 상품일 경우
    : product.stock;

  // 카테고리 트리
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [selectedBig, setSelectedBig] = useState<string>("");
  const [selectedMid, setSelectedMid] = useState<string>("");
  const [subImageUrl, setSubImageUrl] = useState<string>("");

  // ------------------------------
  // 공통 핸들러
  // ------------------------------
  const handleChange = (field: keyof AdminProduct, value: any) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const addOption = () => {
    const newOption: AdminProductOption = {
      optionType: "N",
      optionTitle: "",
      optionValue: "",
      extraPrice: 0,       // 관리자가 입력하는 추가금
      stock: 0,
      isShow: true,
      colorCode: "",
    };

    setProduct((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const updateOption = (
    index: number,
    field: keyof AdminProductOption,
    value: any
  ) => {
    setProduct((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const removeOption = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const removeSubImage = (index: number) => {
    setProduct((prev) => ({
      ...prev,
      subImages: prev.subImages?.filter((_, i) => i !== index),
    }));
  };

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
  // 저장
  // ------------------------------
  const handleSave = async () => {
    if (!product.productName) return alert("상품명을 입력해주세요.");
    if (!product.categoryCode) return alert("카테고리를 선택해주세요.");
    if (!product.sellPrice) return alert("판매가를 입력해주세요.");

    // 단품 / 옵션 상품에 따라 payload 정리
    const payload: AdminProduct = {
      ...product,
      stock: product.isOption ? 0 : product.stock,
      options: product.isOption
        ? product.options.map((opt) => ({
            ...opt,
            // DB에 넣을 옵션별 최종 판매가
            sellPrice: (product.sellPrice || 0) + (opt.extraPrice || 0),
          }))
        : [],
        subImages: product.subImages?.map((img) => ({
          imageUrl: img.imageUrl, // 이미지 URL을 추출
          sortOrder: img.sortOrder, // 정렬 순서
          productId: img.productId, // productId
        })) || [],
    };

    // 이미지를 ProductImage로 추가하기
    const images = product.subImages?.map((imgUrl, idx) => ({
      imageUrl: `${imgUrl}`, // 이미지 URL
      sortOrder: idx + 1, // 이미지 순서
      productId: product.productId,
    }));

    try {
      const res = await fetch(`${API_URL}/api/admin/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("저장 실패");
      alert("상품이 등록되었습니다.");
      router.push("/admin/productList");

    } catch (err) {
      console.error(err);
      alert("상품 등록 중 오류가 발생했습니다.");
    }
  };

  const handleAddSubImage = () => {
    if (subImageUrl) {
      setProduct((prev) => ({
        ...prev,
        subImages: [
          ...(prev.subImages || []), // subImages가 없으면 빈 배열로 처리
          {
            imageUrl: subImageUrl,  // 추가할 이미지 URL
            sortOrder: prev.subImages ? prev.subImages.length + 1 : 1, // 순서 지정
            productId: prev.productId || 0,  // productId를 추가 (없으면 기본값 0)
          },
        ],
      }));
      setSubImageUrl("");  // URL 추가 후 입력창 비우기
    }
  };




  // ==============================
  // 렌더링
  // ==============================
  return (
    <div className="py-10 px-4 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 pb-2 border-b border-gray-200">
          상품 등록
        </h1>

        {/* 대표 이미지 입력 */}
        <div className="mb-4">
          <Input
            label="대표 이미지 URL"
            value={product.mainImg}
            onChange={(e) => setProduct({ ...product, mainImg: e.target.value })}
            placeholder="대표 이미지 URL을 입력하세요"
          />
          {product.mainImg && (
            <div className="mt-2">
              <img
                src={`${IMAGE_BASE_URL}${product.mainImg}`}
                alt="대표 이미지 미리보기"
                className="w-120px h-240px"
              />
            </div>
          )}
        </div>

        {/* 상세 이미지 URL 추가 */}
        <div className="mb-4">
          <Input
            label="상세 이미지 URL 추가"
            value={subImageUrl}
            onChange={(e) => setSubImageUrl(e.target.value)}
            placeholder="상세 이미지 URL을 입력하세요"
          />
          <Button
            className="mt-2"
            onClick={handleAddSubImage}
            disabled={!subImageUrl}  // 입력된 URL이 없으면 버튼 비활성화
          >
            추가
          </Button>
        </div>

        {/* 추가된 상세 이미지 목록 */}
        <div className="mb-4">
          {(product.subImages && product.subImages.length > 0) && (
            <div>
              <p className="font-semibold">상세 이미지 목록</p>
              <div className="space-y-2">
                {product.subImages.map((imgUrl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <img
                      src={`${IMAGE_BASE_URL}${imgUrl.imageUrl}`}  // 미리보기
                      alt={`sub-image-${idx}`}
                      className="w-20 h-20 object-cover"
                    />
                    <Button
                      className="text-red-500"
                      onClick={() => removeSubImage(idx)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


          {/* 우측: 상품 정보 */}
          <div className="flex flex-col gap-6 md:w-1/2">
            {/* 상품명 */}
            <Input
              label="상품명"
              value={product.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              placeholder="상품명을 입력하세요"
            />

            {/* 카테고리 선택 */}
            {categoryTree ? (
              <div className="flex flex-col gap-2">
                <p className="font-semibold">카테고리 선택</p>

                {/* 대분류 */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categoryTree).map(([bigCode, bigNode]) => (
                    <button
                      key={bigCode}
                      type="button"
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
                          type="button"
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
                        type="button"
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
                    선택된 카테고리 코드: {product.categoryCode}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">카테고리 로드 중...</p>
            )}

            {/* 상품 설명 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                상품 설명
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                value={product.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* 가격 / 재고 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  label="재고(단품)"
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    handleChange("stock", Number(e.target.value))
                  }
                />
              )}
            </div>

            {/* 상품 상태 / 노출 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  상품 상태
                </label>
                <select
                  value={product.productStatus}
                  onChange={(e) =>
                    handleChange("productStatus", Number(e.target.value))
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value={10}>정상</option>
                  <option value={20}>품절</option>
                  <option value={21}>재고확보중</option>
                  <option value={40}>판매중지</option>
                  <option value={90}>판매종료</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  상품 노출 여부
                </label>
                <select
                  value={product.isShow ? "yes" : "no"}
                  onChange={(e) =>
                    handleChange("isShow", e.target.value === "yes")
                  }
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="yes">노출</option>
                  <option value="no">숨김</option>
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

            {/* 총 재고 표시 (옵션 상품일 경우 합산된 재고 값 표시) */}
            <div className="mb-4">
              {product.isOption ? (
                <div>
                  <h3 className="font-semibold">총 재고: {totalStock}</h3>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold">총 재고: {product.stock}</h3>
                </div>
              )}
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
                      className="flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200"
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
                          placeholder="0"
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

            {/* 등록 버튼 */}
            <Button className="w-full mt-6 py-3 text-lg" onClick={handleSave}>
              상품 등록
            </Button>
          </div>
        </div>
      </div>
  );
}
