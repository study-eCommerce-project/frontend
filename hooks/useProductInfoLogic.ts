"use client";

import { useState, useEffect, useRef } from "react";
import { toggleLike } from "@/lib/api/product";
import { SelectedOption, Option, Product } from "@/types/product";
import type { User } from "@/context/UserContext";
import toast from "react-hot-toast";
import { showCartToast } from "@/components/CartToast";

/**
 * 상품 상세에서 필요한 모든 비즈니스 로직을 담당하는 커스텀 훅
 *
 * 포함 기능:
 *  - 좋아요(Like) 토글
 *  - 옵션 선택/제거/수량 변경
 *  - 장바구니 담기
 *  - 구매하기(바로 구매)
 *  - 옵션 드롭다운 외부 클릭 감지
 *
 * UI는 ProductInfo.tsx에서 담당하고,
 * 모든 로직은 이 훅에서 책임져서 컴포넌트를 깔끔하게 유지한다.
 */

export function useProductInfoLogic(
  product: Product,     // 상품 정보
  user: User | null,    // 현재 로그인한 사용자
  addToCart: any,       // CartContext에서 제공된 장바구니 추가 함수
  router: any,           // next/navigation router
  toggleWishlist?: any  // 있으면 같이 호출
) {

  /** ----------------------------------------
   * 옵션 관련 상태
   * ---------------------------------------- */
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /** ----------------------------------------
   * 좋아요 관련 상태
   * ---------------------------------------- */
  const [liked, setLiked] = useState(product.userLiked ?? false);
  const [likeCount, setLikeCount] = useState(product.likeCount ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (likeLoading) return; // 중복 클릭 방지

    try {
      setLikeLoading(true);

      // 백엔드에서 좋아요 토글 처리
      const data = await toggleLike(product.productId);
      // data = { liked: boolean, likes: number }

      setLiked(data.liked);
      setLikeCount(data.likes);

      // ---- toast 메시지 표시 ----
      if (data.liked) {
        toast.success("좋아요를 눌렀습니다 ❤️");
      } else {
        toast("좋아요를 취소했습니다 💔");
      }

      // ---- 찜 목록 상태 동기화 ----
      if (toggleWishlist) {
        toggleWishlist(product.productId, data.liked);
      }

    } catch (err) {
      console.error("좋아요 실패:", err);
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    } finally {
      setLikeLoading(false);
    }
  };

  /**
   * 옵션 선택
   * - 이미 선택한 옵션이면 추가되지 않도록 체크
   * - count 기본값: 1
   */
  const handleSelectOption = (opt: Option) => {
    // 이미 선택된 옵션인지 체크
    if (selectedOptions.some((o) => o.optionId === opt.optionId)) return;

    // 선택 옵션 리스트에 추가
    setSelectedOptions((prev) => [
      ...prev,
      { ...opt, count: 1 } // 'value'와 'count'를 추가
    ]);

    // 선택 후 드롭다운 닫기
    setDropdownOpen(false);
  };

  /**
   * 장바구니 담기
   * - 비로그인 → 로그인 페이지 이동
   * - 옵션이 있는 상품인데 옵션 미선택 → 경고
   * - 옵션이 여러 개 선택된 경우 반복해서 addToCart 호출
   */
  const handleAddToCart = async (singleCount: number) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return router.push("/login");
    }
    // 옵션 상품인데 옵션 선택 안했을 경우
    if (product.isOption && selectedOptions.length === 0) {
      return toast.error("옵션을 선택해주세요.");
    }


    try {
      if (product.isOption) {
        for (const opt of selectedOptions) {
          await addToCart(product.productId, opt.optionValue, opt.count);
        }
      } else {
        await addToCart(product.productId, null, 1);
      }

      showCartToast(router);   // ← 버튼 있는 토스트 호출
    } catch (err) {
      console.error("장바구니 추가 실패:", err);
      alert("장바구니 추가 실패");
    }
  };

  /**
   * 구매하기
   * - 옵션 선택 여부 체크
   * - 구매 페이지에서 사용할 데이터를 sessionStorage에 저장
   * - /order/checkout 페이지로 이동
   */
  const handleBuyNow = (singleCount: number) => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return router.push("/login");
    }

    if (product.isOption && selectedOptions.length === 0) {
      return toast.error("옵션을 선택해주세요.");
    }

    const orderInfo = product.isOption
      ? {
        // 옵션 상품
        productId: product.productId,
        productName: product.productName,
        mainImg: product.mainImg,
        sellPrice: product.sellPrice,
        options: selectedOptions, // 옵션 수량 already inside
      }
      : {
        // 단일 상품
        productId: product.productId,
        productName: product.productName,
        mainImg: product.mainImg,
        sellPrice: product.sellPrice,
        quantity: singleCount,  // 옵션 상품 수량
        options: [], // 단일 상품은 옵션 없음
      };

    // 결제 페이지로 전달할 데이터 임시 저장
    sessionStorage.setItem("checkoutData", JSON.stringify(orderInfo));
    router.push("/order/checkout");
  };

  /**
   * 수량 변경
   * - 수량 증가
   * - 수량 감소 (최소 1개로 설정)
   */
  const handleQuantityChange = (optionId: number, increment: boolean) => {
    setSelectedOptions((prev) =>
      prev.map((option) =>
        option.optionId === optionId
          ? {
            ...option,
            count: increment
              ? option.count + 1
              : Math.max(1, option.count - 1), // 수량 최소값 1
          }
          : option
      )
    );
  };

  /**
   * 옵션 드롭다운 외부 클릭 시 자동으로 닫히도록 처리
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return {
    // 옵션 관련
    selectedOptions,
    setSelectedOptions,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleSelectOption,
    handleQuantityChange,  // 수량 변경 함수 추가

    // 좋아요 관련
    liked,
    likeCount,
    likeLoading,
    handleLike,

    // 장바구니/구매
    handleAddToCart,
    handleBuyNow,
  };
}

