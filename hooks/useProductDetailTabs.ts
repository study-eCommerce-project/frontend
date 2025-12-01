"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 상품 상세 페이지 하단 탭 & 스크롤 스파이 제어 Hook
 *
 * 기능:
 * - 탭 선택 상태(activeTab) 관리
 * - 탭 클릭 시 해당 섹션으로 스크롤 이동
 * - 스크롤 시 현재 보이는 섹션을 자동으로 activeTab 업데이트
 * - 각 섹션(info/size/recommend) ref 제공
 */
export function useProductDetailTabs() {
  const [activeTab, setActiveTab] = useState("info");

  const infoRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const recommendRef = useRef<HTMLDivElement>(null);

  /** 탭 클릭 → 해당 섹션으로 스크롤 이동 */
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    const offset = 80;
    const top = ref.current.offsetTop - offset;

    window.scrollTo({
      top,
      behavior: "smooth",
    });
  };

  /** 스크롤 스파이: 현재 보이는 section 자동 active */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActiveTab(e.target.id); // id = "info" | "size" | "recommend"
          }
        });
      },
      { rootMargin: "-70px 0px -60% 0px" }
    );

    const refs = [infoRef, sizeRef, recommendRef];

    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return {
    activeTab,
    infoRef,
    sizeRef,
    recommendRef,
    scrollToSection,
  };
}
