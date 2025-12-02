"use client";

import { useState, useRef, useEffect } from "react";
import { Heart, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";

interface Option {
  optionId: number;
  optionValue: string;
  sellPrice: number;
  stock: number;
}

interface SelectedOption {
  optionId: number;
  value: string;
  count: number;
  price: number;
}

interface Product {
  productId: number;
  productName: string;
  mainImg?: string;
  consumerPrice?: number;
  sellPrice: number;
  stock: number;
  isOption?: number;
  options?: Option[];
  categoryPath: string;
  likeCount?: number;
  userLiked?: boolean;
}

interface Props {
  product: Product;
}

export default function ProductInfo({ product }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();
  const { likedProducts, toggleWishlist } = useWishlist();

  const [price, setPrice] = useState(product.sellPrice);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likeCount ?? 0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const liked = likedProducts.includes(product.productId);

  // 외부 클릭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 좋아요 토글
  const handleToggleLike = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (liked) {
      setLikeCount((prev) => Math.max(prev - 1, 0)); // 좋아요 취소
    } else {
      setLikeCount((prev) => prev + 1); // 좋아요
    }

    toggleWishlist(product.productId); // Context 상태 토글
  };

  // 옵션 선택
  const handleSelectOption = (opt: Option) => {
    if (selectedOptions.some((o) => o.optionId === opt.optionId)) {
      alert("이미 선택된 옵션입니다.");
      return;
    }

    setPrice(opt.sellPrice);

    setSelectedOptions((prev) => [
      ...prev,
      { optionId: opt.optionId, value: opt.optionValue, count: 1, price: opt.sellPrice },
    ]);

    setDropdownOpen(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm("로그인이 필요합니다. 이동하시겠습니까?")) router.push("/login");
      return;
    }

    if (product.isOption && selectedOptions.length === 0) {
      alert("옵션을 선택하세요.");
      return;
    }

    for (const opt of selectedOptions) {
      await addToCart(product.productId, opt.optionId, opt.count);
    }

    if (window.confirm("장바구니로 이동할까요?")) router.push("/mypage/cart");
  };

  const handleBuyNow = () => {
    if (!user) {
      if (window.confirm("로그인이 필요합니다. 이동하시겠습니까?")) router.push("/login");
      return;
    }

    if (product.isOption && selectedOptions.length === 0) {
      alert("옵션을 선택하세요.");
      return;
    }

    const orderInfo = {
      productId: product.productId,
      productName: product.productName,
      mainImg: product.mainImg,
      sellPrice: price,
      options: selectedOptions,
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(orderInfo));
    router.push("/order/checkout");
  };

  return (
    <div className="flex flex-col">
      {/* 카테고리 */}
      {product.categoryPath && (
        <div className="text-sm text-gray-500 mb-4">{product.categoryPath}</div>
      )}

      {/* 이름 */}
      <h1 className="text-3xl font-bold mb-4">{product.productName}</h1>

      {/* 가격 */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm line-through">
          {product.consumerPrice?.toLocaleString()}원
        </p>

        {product.consumerPrice && product.consumerPrice > price && (
          <span className="text-red-500 text-3xl font-bold mr-2">
            {Math.round(((product.consumerPrice - price) / product.consumerPrice) * 100)}%
          </span>
        )}

        <p className="text-3xl font-bold mt-1">{price.toLocaleString()}원</p>
        <p className="text-gray-600 mt-2 text-sm">재고: {product.stock}개</p>
      </div>

      {/* 옵션 선택 */}
      {product.isOption && product.options?.length && (
        <div className="mb-6 relative w-full" ref={dropdownRef}>
          <label className="block text-gray-700 mb-2 font-medium">옵션 선택</label>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full border border-gray-300 rounded-lg p-2 text-left hover:ring-2 hover:ring-gray-400 cursor-pointer"
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
                  onClick={() => handleSelectOption(opt)}
                  className={`p-2 hover:bg-gray-100 cursor-pointer ${
                    selectedOptions.some((o) => o.optionId === opt.optionId)
                      ? "bg-gray-200"
                      : ""
                  }`}
                >
                  {opt.optionValue} — {opt.sellPrice.toLocaleString()}원
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 선택 옵션 */}
      <div className="flex flex-col gap-4 mb-6">
        {selectedOptions.map((item) => (
          <div
            key={item.optionId}
            className="border p-4 rounded-lg shadow flex flex-col gap-3"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                <p className="font-medium">{item.value}</p>
                <p className="text-gray-600 text-sm">{item.price.toLocaleString()}원</p>
              </div>
              <button
                className="text-gray-400 hover:text-black"
                onClick={() =>
                  setSelectedOptions((prev) =>
                    prev.filter((p) => p.optionId !== item.optionId)
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="p-2 bg-gray-200 rounded"
                onClick={() =>
                  setSelectedOptions((prev) =>
                    prev.map((p) =>
                      p.optionId === item.optionId
                        ? { ...p, count: Math.max(1, p.count - 1) }
                        : p
                    )
                  )
                }
              >
                <Minus size={16} />
              </button>
              <span className="font-semibold">{item.count}</span>
              <button
                className="p-2 bg-gray-200 rounded"
                onClick={() =>
                  setSelectedOptions((prev) =>
                    prev.map((p) =>
                      p.optionId === item.optionId ? { ...p, count: p.count + 1 } : p
                    )
                  )
                }
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <div className="flex flex-col md:flex-row items-center gap-4 w-full">
        {/* 좋아요 버튼 */}
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-2 p-2 border rounded-lg transition-all w-full md:w-auto ${
            liked ? "bg-rose-50 border-rose-300" : "bg-white border-gray-300"
          } hover:cursor-pointer`}
        >
          <Heart
            className={`w-7 h-7 ${liked ? "fill-rose-500 stroke-rose-500" : "stroke-gray-400"}`}
            style={{ transition: "all 0.2s" }}
          />
          <span className={`text-base font-medium ${liked ? "text-rose-500" : "text-gray-500"}`}>
            {likeCount.toLocaleString()}
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
  );
}
