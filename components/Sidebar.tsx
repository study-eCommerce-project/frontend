"use client";

import { useEffect, useRef } from "react";
import SidebarPortal from "./SidebarPortal";

interface SidebarProps {
  open: boolean;             // 사이드바 열림/닫힘 상태
  onClose: () => void;       // 닫기 이벤트 핸들러
  children: React.ReactNode; // 사이드바 안에 들어갈 콘텐츠
}

export default function Sidebar({ open, onClose, children }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);  // 터치 시작 지점 (스와이프용)
  const endX = useRef(0);    // 터치 종료 지점 (스와이프용)

  /* ESC 키 입력 시 사이드바 닫기 */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();  // ESC → 닫기
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* 사이드바 열릴 때 body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  /* 모바일 스와이프(→ 방향)로 사이드바 닫기 */
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;  // 터치 시작 X좌표
    };
    const handleTouchMove = (e: TouchEvent) => {
      endX.current = e.touches[0].clientX;  // 터치 이동 X좌표
    };
    const handleTouchEnd = () => {
      const diff = startX.current - endX.current;
      if (diff > 50) onClose();  // → 방향으로 50px 넘게 이동하면 닫기
    };

    sidebar.addEventListener("touchstart", handleTouchStart);
    sidebar.addEventListener("touchmove", handleTouchMove);
    sidebar.addEventListener("touchend", handleTouchEnd);

    return () => {
      sidebar.removeEventListener("touchstart", handleTouchStart);
      sidebar.removeEventListener("touchmove", handleTouchMove);
      sidebar.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onClose]);

  return (
    <SidebarPortal>
      <>
        {/* --------------------------------------------
            사이드바 오버레이(배경 어둡게)
            사이드바가 열렸을 때 클릭하면 닫힘
        -------------------------------------------- */}
        <div
          className={`
            fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300
            ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
          onClick={onClose}
        />

        {/* --------------------------------------------
            실제 사이드바 영역
            오른쪽에서 슬라이드되는 애니메이션
        -------------------------------------------- */}
        <div
          ref={sidebarRef}
          className={`
            fixed top-0 right-0 
            w-72 sm:w-80 lg:w-[420px]
            h-full bg-white z-[9999] shadow-xl
            transform transition-transform duration-300
            ${open ? "translate-x-0" : "translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}  // 내부 클릭 시 오버레이 닫힘 방지
        >
          {children}
        </div>
      </>
    </SidebarPortal>
  );
}
