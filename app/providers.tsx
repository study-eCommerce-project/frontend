/**
 * Providers 컴포넌트가 필요한 이유
 * - Next.js에서는 layout.tsx는 서버 컴포넌트(Server Component)
 *   → 여기에서 직접 useState, useEffect 같은 Hook 사용 불가
 * - 하지만 UserProvider, CartProvider는 클라이언트 전용(Client Component)
 *   → 반드시 "use client" 환경에서 렌더링해야 함
 *
 * 그래서 Providers.tsx 파일을 따로 두고
 * layout.tsx(서버) → Providers(클라이언트) 구조로 감싸주는 것이 필수.
 */
"use client";

import { UserProvider } from "../context/UserContext";
import { CartProvider } from "../context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <CartProvider>{children}</CartProvider>
    </UserProvider>
  );
}
