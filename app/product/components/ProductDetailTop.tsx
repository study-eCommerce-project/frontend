"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus, X } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

interface Option {
  optionId: number;
  value: string;
}

interface SelectedOption extends Option {
  count: number;
}

interface Product {
  productId: number;
  productName: string;
  description?: string;
  mainImg?: string;
  subImages?: string[];
  consumerPrice?: number;
  sellPrice: number;
  stock: number;
  isOption?: number;
  options?: { optionId: number; optionValue: string }[];
  categoryPath: string;
  likeCount?: number;
  userLiked?: boolean;
}

const toFullUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://image.msscdn.net${url}`;
};

export default function ProductDetailTop({ product }: { product: Product }) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  if (!product.mainImg) return null;

  const [liked, setLiked] = useState<boolean>(product.userLiked ?? false);
  const [likeCount, setLikeCount] = useState<number>(product.likeCount ?? 0);

  const initialMainImg = toFullUrl(product.mainImg || "/images/default_main.png");
  const [mainImage, setMainImage] = useState(initialMainImg);

  if (!mainImage) return null;

  const thumbnails: string[] = product.subImages?.length
    ? product.subImages.map((img) => toFullUrl(img))
    : [initialMainImg];

  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);

  /** 좋아요 API */
  const handleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/like/toggle/${product.productId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        alert("좋아요 처리 실패");
        return;
      }

      const likedResult = await res.json();

      setLiked(likedResult);
      setLikeCount((prev) => (likedResult ? prev + 1 : Math.max(prev - 1, 0)));
    } catch (e) {
      console.error("좋아요 요청 실패", e);
    }
  };

  /** 옵션 Dropdown */
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (opt: Option) => {
    if (selectedOptions.some((o) => o.optionId === opt.optionId)) {
      alert("이미 선택된 옵션입니다.");
      return;
    }
    setSelectedOptions((prev) => [...prev, { ...opt, count: 1 }]);
    setDropdownOpen(false);
  };

  /** 장바구니 */
  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm("로그인이 필요합니다. 로그인하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    if (product.isOption && selectedOptions.length === 0) {
      alert("옵션을 선택해주세요!");
      return;
    }

    for (const opt of selectedOptions) {
      await addToCart(product.productId, opt.optionId, opt.count);
    }

    if (window.confirm("장바구니에 담았습니다.\n장바구니 페이지로 이동할까요?")) {
      router.push("/mypage/cart");
    }
  };

  /** 구매하기 */
  const handleBuyNow = () => {
    if (!user) {
      if (window.confirm("로그인이 필요합니다. 로그인하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }

    if (product.isOption && selectedOptions.length === 0) {
      alert("옵션을 선택해주세요!");
      return;
    }

    const orderInfo = {
      productId: product.productId,
      productName: product.productName,
      mainImg: product.mainImg,
      sellPrice: product.sellPrice,
      options: selectedOptions,
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(orderInfo));

    router.push("/order/checkout");
  };

  return (
    <div className="max-w-6xl mx-auto my-10 bg-white p-8 rounded-xl shadow flex flex-col">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        
        {/* 이미지 영역 */}
        <div ref={detailRef} className="flex flex-row gap-6">
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] min-w-[5rem]">
            {thumbnails.map((thumb, idx) => (
              <img
                key={idx}
                src={thumb}
                alt={`썸네일 ${idx}`}
                className={`w-20 h-20 object-contain rounded border ${mainImage === thumb ? "border-gray-800" : "border-gray-300"
                  } hover:cursor-pointer`}
                onClick={() => setMainImage(thumb)}
              />
            ))}
          </div>

          <div className="flex-1 flex justify-center items-start">
            <img
              src={mainImage}
              alt={product.productName}
              className="rounded-lg object-contain max-h-[500px] w-full"
            />
          </div>
        </div>

        {/* 상품 정보 영역 */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          
          {/* 카테고리 경로 */}
          {product.categoryPath && (
            <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              {product.categoryPath.split(">").map((cat: string, idx: number) => (
                <span key={idx} className="flex items-center gap-2">
                  <span>{cat.trim()}</span>
                  {idx < product.categoryPath.split(">").length - 1 && (
                    <span className="text-gray-400">/</span>
                  )}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.productName}
          </h1>

          {/* 가격 */}
          <div className="mb-6 text-center md:text-left">
            <p className="text-gray-400 text-sm line-through">
              {product.consumerPrice?.toLocaleString()}원
            </p>

            {product.consumerPrice &&
              product.sellPrice &&
              product.consumerPrice > product.sellPrice && (
                <span className="text-red-500 text-3xl font-bold">
                  {Math.round(
                    ((product.consumerPrice - product.sellPrice) /
                      product.consumerPrice) *
                      100
                  )}
                  %
                </span>
              )}

            <p className="text-3xl font-bold text-black">
              {product.sellPrice?.toLocaleString()}원
            </p>

            <p className="text-gray-600 mt-2 text-sm">
              재고: {product.stock}개
            </p>
          </div>

          {/* 옵션 UI */}
          {product.isOption && product.options?.length ? (
            <div className="mb-6 relative w-full" ref={dropdownRef}>
              <label className="block text-gray-700 mb-2 font-medium">
                옵션 선택
              </label>

              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full border border-gray-300 rounded-lg p-2 text-left cursor-pointer hover:ring-2 hover:ring-blue-400"
              >
                {selectedOptions.length === 0
                  ? "옵션 선택"
                  : selectedOptions.map((o) => o.value).join(", ")}
              </button>

              {dropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {product.options.map((opt) => (
                    <li
                      key={opt.optionId}
                      onClick={() =>
                        handleSelectOption({
                          optionId: opt.optionId,
                          value: opt.optionValue,
                        })
                      }
                      className={`p-2 hover:bg-blue-100 hover:cursor-pointer ${selectedOptions.some((o) => o.optionId === opt.optionId)
                        ? "bg-gray-200"
                        : ""
                        }`}
                    >
                      {opt.optionValue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {/* 선택된 옵션 */}
          <div className="flex flex-col gap-4 mb-6 w-full">
            {selectedOptions.map((item) => (
              <div
                key={item.optionId}
                className="border p-4 rounded-lg shadow-sm flex justify-between items-center w-full"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.value}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() =>
                        setSelectedOptions((prev) =>
                          prev.map((p) =>
                            p.optionId === item.optionId
                              ? { ...p, count: Math.max(1, p.count - 1) }
                              : p
                          )
                        )
                      }
                      className="p-2 bg-gray-200 rounded hover:cursor-pointer"
                    >
                      <Minus size={16} />
                    </button>

                    <span className="font-semibold">{item.count}</span>

                    <button
                      onClick={() =>
                        setSelectedOptions((prev) =>
                          prev.map((p) =>
                            p.optionId === item.optionId
                              ? { ...p, count: p.count + 1 }
                              : p
                          )
                        )
                      }
                      className="p-2 bg-gray-200 rounded hover:cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setSelectedOptions((prev) =>
                      prev.filter((p) => p.optionId !== item.optionId)
                    )
                  }
                  className="text-gray-400 hover:text-black hover:cursor-pointer ml-4"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 p-2 border rounded-lg transition-all w-full md:w-auto ${
                liked
                  ? "bg-rose-50 border-rose-300"
                  : "bg-white border-gray-300"
              } hover:cursor-pointer`}
            >
              <Heart
                className={`w-7 h-7 ${
                  liked ? "fill-rose-500 stroke-rose-500" : "stroke-gray-400"
                }`}
              />
              <span
                className={`text-base font-medium ${
                  liked ? "text-rose-500" : "text-gray-500"
                }`}
              >
                {likeCount}
              </span>
            </button>

            <button
              onClick={handleAddToCart}
              className="flex-1 w-full bg-gray-100 text-gray-600 py-3 rounded-lg hover:bg-gray-200 hover:cursor-pointer"
            >
              장바구니
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
            >
              구매하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
