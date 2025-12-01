"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function SidebarPortal({ children }: { children: React.ReactNode }) {
  // 클라이언트에서 렌더링 여부를 관리하는 상태
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // hydration 오류 방지: 브라우저에서 렌더링될 때 true로 설정
    setMounted(true);
  }, []);

    // 클라이언트에서만 렌더되게
    // 서버에서는 document가 없어서 렌더 불가능 → 클라이언트 준비 전에는 null 반환
  if (!mounted) return null;

  // Portal로 body 바로 아래에 렌더링(body 바로 아래로 강제 렌더링)
  //    - Sidebar가 레이아웃의 overflow나 z-index에 잡히지 않게 독립적으로 띄우려고 사용
  return createPortal(children, document.body); 
}
