"use client";

import { Suspense } from "react";
import SearchContent from "./SearchContent";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">검색 중입니다...</div>}>
      <SearchContent />
    </Suspense>
  );
}
