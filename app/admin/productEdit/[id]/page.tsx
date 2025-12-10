"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Input from "../../../ui/Input";
import Button from "../../../ui/Button";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import type { AdminProduct, AdminProductOption } from "@/types/adminProduct";
import type { CategoryTree } from "@/types/category";

export default function ProductEditPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;

  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [selectedBig, setSelectedBig] = useState<string>("");
  const [selectedMid, setSelectedMid] = useState<string>("");
  const [subImageUrl, setSubImageUrl] = useState<string>("");
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]); // 옵션 삭제를 위한 배열

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
          subImages: raw.subImages?.map((img: any) => ({
            imageUrl: img.imageUrl,
          })) ?? [],
          productStatus: raw.productStatus ?? 10,
          isShow: raw.isShow ?? true,
          categoryCode: raw.categoryCode ?? "",
          options: (raw.options ?? []).map((opt: any): AdminProductOption => ({
            optionId: opt.optionId,
            optionType: opt.optionType ?? "N",
            optionTitle: opt.optionTitle ?? "",
            optionValue: opt.optionValue ?? "",
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
        console.error("상품을 불러오는 중 오류 발생:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [API_URL, productId, categoryTree]);

  // ------------------------------
  // 총 재고 계산 
  // ------------------------------
  const totalStock = product?.isOption
    ? product.options.reduce((total, option) => total + option.stock, 0)  // 옵션 상품일 경우
    : product?.stock;


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

    const optionToDelete = product.options[index];

    // optionId가 있는 경우만 삭제 목록에 추가
    if (optionToDelete.optionId) {
      setDeletedOptionIds((prev: number[]) => [...prev, optionToDelete.optionId as number]);
    }

    const newOptions = product.options.filter((_, i) => i !== index);

    setProduct({
      ...product,
      options: newOptions,
      isOption: newOptions.length > 0  // 옵션 없으면 단일상품 처리
    });
  };

  const handleAddSubImage = () => {
    if (subImageUrl) {
      setProduct((prev) => {
        if (prev === null) {
          // prev가 null일 경우 빈 AdminProduct 객체로 초기값 처리
          return {
            subImages: [
              { imageUrl: subImageUrl, sortOrder: 0, productId: 0 }, // 초기값 설정
            ],
            productId: 0,
            productName: '',
            description: '',
            consumerPrice: 0,
            sellPrice: 0,
            stock: 0,
            isOption: false,
            mainImg: '',
            productStatus: 10,
            isShow: true,
            categoryCode: '',
            options: [],
            totalStock: 0,
          };
        }

        return {
          ...prev,
          subImages: [
            ...(prev.subImages || []),  // prev.subImages가 없으면 빈 배열로 처리
            {
              imageUrl: subImageUrl,
              sortOrder: prev.subImages ? prev.subImages.length + 1 : 1,   // 새로운 이미지의 정렬 순서
              productId: prev.productId || 0,  // productId 추가 (없으면 0)
            },
          ],
        };
      });
      setSubImageUrl("");  // URL 추가 후 입력 필드 비우기
    }
  };

  const removeSubImage = (index: number) => {
    setProduct((prev) => {
      if (prev === null) {
        // prev가 null일 경우 초기값 설정
        return {
          subImages: [],
          productId: 0,
          productName: '',
          description: '',
          consumerPrice: 0,
          sellPrice: 0,
          stock: 0,
          isOption: false,
          mainImg: '',
          productStatus: 10,
          isShow: true,
          categoryCode: '',
          options: [],
          totalStock: 0,
        };
      }

      return {
        ...prev,  // 기존 값 복사
        subImages: prev.subImages?.filter((_, i) => i !== index) || [], // subImages가 없으면 빈 배열로 처리
      };
    });
  };

  // ------------------ AI 상품 설명 자동 생성 ------------------
  const handleGenerateDescription = async () => {
    if (!product?.productName) {
      toast.error("상품명을 먼저 입력해주세요.");
      return;
    }

    const imageUrls = [
      product.mainImg,
      ...((product.subImages ?? []).map(img => img.imageUrl))
    ];

    try {
      const res = await fetch(`${API_URL}/api/admin/products/generate-description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: product.productName,
          price: product.sellPrice,
          options: product.options.map((opt) => opt.optionValue).join(", "),
          category_path: product.categoryCode,
          image_urls: imageUrls,
        }),
      });

      const data = await res.json();

      setProduct(prev => prev ? ({
        ...prev,
        description: data.description ?? "",
        blocks: data.blocks ?? [],
      }) : prev);

      toast.success("AI 설명이 생성되었습니다.");

    } catch (err) {
      console.error(err);
      toast.error("AI 설명 생성 중 오류가 발생했습니다.");
    }
  };

  // ------------------------------
  // 저장
  // ------------------------------
  const handleSave = async () => {
    if (!product) return;

    if (!product.productName || !product.sellPrice) {
      toast.error("필수 항목이 비어있습니다.");
      return;
    }

    const payload: AdminProduct = {
      ...product,
      stock: product.isOption ? 0 : product.stock,
      description:
        product.blocks && product.blocks.length > 0
          ? JSON.stringify(product.blocks)
          : product.description, // 기존 설명 유지
      deleteOptionIds: deletedOptionIds,    
      options: product.isOption
        ? product.options.map((opt) => ({
          ...opt,
          // DB에 저장할 최종 옵션가
          sellPrice: (product.sellPrice || 0) + (opt.extraPrice || 0),
        }))
        : [],
    };

    // 옵션이 0개라면 단일상품 처리
    if (!payload.options || payload.options.length === 0) {
      payload.isOption = false;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 응답 확인
      if (!res.ok) throw new Error("저장 실패");

      // 저장 성공 후 메시지 출력
      toast.success("상품 정보가 저장되었습니다.");

      // 상품 목록 페이지로 이동
      router.push("/admin/productList");
    } catch (err) {
      console.error(err);
      toast.error("상품 저장 중 오류가 발생했습니다.");
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

        {/* 왼쪽: 이미지 */}
        <div className="mb-4">
          <Input
            label="대표 이미지 URL"
            value={product.mainImg}
            onChange={(e) => setProduct({ ...product, mainImg: e.target.value })}
            placeholder="대표 이미지 URL을 입력하세요"
          />

          {/* 대표 이미지 미리보기 */}
          {product.mainImg && (
            <div className="mt-2">
              <img
                // src={`${IMAGE_BASE_URL}${product.mainImg}`}
                src={`${product.mainImg}`}
                alt="대표 이미지 미리보기"
                className="w-120px h-240px object-contain"
              />
            </div>
          )}

          <div className="mb-4">
            {/* 상세 이미지 URL 입력 */}
            <Input
              label="상세 이미지 URL 추가"
              value={subImageUrl}
              onChange={(e) => setSubImageUrl(e.target.value)}
              placeholder="상세 이미지 URL을 입력하세요"
            />
            <Button
              className="mt-2"
              onClick={handleAddSubImage}  // 이미지를 추가하는 함수
              disabled={!subImageUrl}  // 입력된 URL이 없으면 버튼 비활성화
            >
              추가
            </Button>
          </div>

          {/* 추가된 상세 이미지 목록 */}
          <div className="mb-4">
            {product.subImages && product.subImages.length > 0 && (
              <div>
                <p className="font-semibold">상세 이미지 목록</p>
                <div className="space-y-2">
                  {product.subImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        // src={`${IMAGE_BASE_URL}${img.imageUrl}`} 
                        src={`${img.imageUrl}`}  // 미리보기
                        alt={`sub-image-${idx}`}
                        className="w-20 h-20 object-cover"
                      />
                      <Button
                        className="text-red-500"
                        onClick={() => removeSubImage(idx)}  // 이미지 삭제 함수
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
                      className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${selectedBig === bigCode
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
                          className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${selectedMid === midCode
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
                        className={`px-3 py-1 rounded-full border text-sm transition cursor-pointer ${product.categoryCode === leafCode
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

            {/* 상품 설명 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                상품 설명
              </label>

              <button
                type="button"
                onClick={handleGenerateDescription}
                className="px-3 py-1 mb-2 text-xs bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
              >
                AI 자동 작성
              </button>

              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[120px]"
                value={product.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            
            {/* 블록 미리보기 */}
              <div className="mt-4 space-y-4">
                {product.blocks?.map((block, idx) => (
                  <div key={idx}>
                    {block.type === "text" && (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{block.content}</p>
                    )}
                    {block.type === "image" && (
                      <img src={block.url} className="w-full rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 가격 / 재고 */}
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
