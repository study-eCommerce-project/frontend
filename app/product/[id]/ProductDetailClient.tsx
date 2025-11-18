"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Minus } from "lucide-react";
import { useUser } from "../../../context/UserContext";
import { useCart } from "../../../context/CartContext";

export default function ProductDetailClient({ product }: { product: any }) {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const [count, setCount] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState(product.mainImg || "/images/default_main.png");
  const detailRef = useRef<HTMLDivElement>(null);

  const colors: string[] = product.colors
    ? product.colors.map((color: { url: string }) => color.url)
    : [];
  const thumbnails: string[] = 
  product.subImages && product.subImages.length > 0
    ? product.subImages
    : [product.mainImg];


  // 좋아요 상태 초기화
  useEffect(() => {
    const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    setLiked(likedItems.includes(product.productId));
  }, [product.productId]);

  const handleLike = () => {
    const likedItems = JSON.parse(localStorage.getItem("likedProducts") || "[]");
    let updatedLikes;
    if (likedItems.includes(product.productId)) {
      updatedLikes = likedItems.filter((id: number) => id !== product.productId);
      setLiked(false);
    } else {
      updatedLikes = [...likedItems, product.productId];
      setLiked(true);
    }
    localStorage.setItem("likedProducts", JSON.stringify(updatedLikes));
  };

  const handleAddToCart = () => {
    if (!user) {
      if (window.confirm("장바구니를 사용하려면 로그인해야 합니다.\n로그인 페이지로 이동하시겠습니까?")) {
        router.push("/login");
      }
      return;
    }
    if (product.isOption === 1 && !selectedOption) {
      alert("옵션을 선택해주세요!");
      return;
    }
    addToCart({
      productId: product.productId,
      productName: product.productName,
      price: product.sellPrice,
      thumbnailUrl: mainImage,
      option: product.isoption === 1 ? selectedOption : null,
      color: selectedColor,
      count,
      id: 0,
    });
    if (window.confirm("🛒 장바구니에 담겼습니다!\n\n[확인] → 장바구니로 이동\n[취소] → 계속 쇼핑하기")) {
      router.push("/cart");
    }
  };
  useEffect(() => {
    console.log("🔥 전체 product 데이터:", product);
  }, [product]);

  return (
    <div className="max-w-6xl h-full my-auto bg-white p-8 rounded-xl shadow">
      <div className="grid md:grid-cols-2 gap-10 items-start">

        {/* 메인 이미지 + 썸네일 */}
        <div ref={detailRef} className="flex flex-row gap-6">
          {/* 썸네일 (왼쪽 세로) */}
          {thumbnails.length > 0 && (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] min-w-[5rem] justify-start">
              {thumbnails.map((thumb, idx) => (
                <img
                  key={idx}
                  src={thumb}
                  alt={`썸네일 ${idx}`}
                  className={`w-20 h-20 object-contain rounded border cursor-pointer ${mainImage === thumb ? "border-blue-600" : "border-gray-300"
                    }`}
                  onClick={() => setMainImage(thumb)}
                />
              ))}
            </div>
          )}

          {/* 메인 이미지 */}
          <div className="flex-1 flex justify-center items-start">
            <img
              src={mainImage || "/images/default_main.png"}
              alt={product.productName}
              className="rounded-lg object-contain max-h-[500px] w-full"
            />
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.productName}</h1>
          <p className="text-gray-700 mb-6">{product.description || "설명이 없습니다."}</p>

          <div className="mb-6">
            <p className="text-gray-400 text-sm line-through">{product.consumerPrice?.toLocaleString()}원</p>
            <p className="text-3xl font-bold text-blue-600">{product.sellPrice?.toLocaleString()}원</p>
            <p className="text-gray-600 mt-2 text-sm">재고: {product.stock}개</p>
          </div>

          {product.isOption &&  (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">옵션 선택</label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="text-black w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {product.options?.map((opt : any) => (
                        <option key={opt.optionId} value={opt.optionValue}>
                            {opt.optionValue}
                        </option>
                    ))}
                </select>
            </div>
          )}

          <div className="flex justify-center items-center gap-5 mb-6">
            <button onClick={() => setCount(prev => Math.max(1, prev - 1))} className="p-2 bg-gray-400 rounded-lg hover:bg-gray-500 text-white transition cursor-pointer">
              <Minus size={16} />
            </button>
            <span className="text-lg font-semibold text-gray-800">{count}</span>
            <button onClick={() => setCount(prev => prev + 1)} className="p-2 bg-gray-400 rounded-lg hover:bg-gray-500 text-white transition cursor-pointer">
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handleLike} className={`p-2 border rounded-lg transition-all duration-300 hover: cursor-pointer ${liked ? "bg-rose-50 border-rose-300 hover:bg-rose-100" : "bg-white border-gray-300 hover:shadow-md"}`} aria-label="좋아요">
              <Heart className={`w-7 h-7 transition-all duration-300 ${liked ? "fill-rose-500 stroke-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "stroke-gray-400 hover:stroke-rose-400"}`} />
            </button>
            <button onClick={handleAddToCart} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition hover:cursor-pointer">장바구니 담기</button>
          </div>
        </div>
      </div>
    </div>
  );
}
