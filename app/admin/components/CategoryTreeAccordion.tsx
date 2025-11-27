"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryTreeProps {
  data: any;
  onSelect: (leafCode: string) => void;
  selectedLeaf: string | null; // 선택된 카테고리 관리
}

export default function CategoryTreeAccordion({
  data,
  onSelect,
  selectedLeaf,
}: CategoryTreeProps) {
  const [openBig, setOpenBig] = useState<{ [key: string]: boolean }>({});
  const [openMid, setOpenMid] = useState<{ [key: string]: boolean }>({});

  // 대분류 펼침/접힘 상태
  const toggleBig = (code: string) =>
    setOpenBig((prev) => ({ ...prev, [code]: !prev[code] }));

  // 중분류 펼침/접힘 상태
  const toggleMid = (code: string) =>
    setOpenMid((prev) => ({ ...prev, [code]: !prev[code] }));

  return (
    <div className="text-gray-900 select-none">
      {Object.entries(data).map(([bigCode, bigNode]: any) => (
        <div key={bigCode} className="mb-3">
          {/* 🔵 대분류 */}
          <button
            onClick={() => toggleBig(bigCode)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded cursor-pointer transition-all"
          >
            <span className="font-semibold text-lg">{bigNode.title}</span>
            {openBig[bigCode] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openBig[bigCode] && (
            <div className="ml-3 mt-2 space-y-2">
              {Object.entries(bigNode.children).map(([midCode, midNode]: any) => (
                <div key={midCode}>
                  {/* 🟣 중분류 */}
                  <button
                    onClick={() => toggleMid(midCode)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-200 rounded cursor-pointer transition-all"
                  >
                    <span className="text-gray-700">{midNode.title}</span>
                    {openMid[midCode] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {openMid[midCode] && (
                    <div className="ml-3 mt-1 space-y-1">
                      {/* 🟢 소분류 */}
                      {Object.entries(midNode.children).map(([leafCode, leafNode]: any) => (
                        <p
                          key={leafCode}
                          onClick={() => onSelect(leafCode)} // 소분류 선택 시 onSelect 호출
                          className={`px-4 py-1 rounded cursor-pointer transition-all ${
                            selectedLeaf === leafCode
                              ? "bg-gray-500 text-white" // 선택된 카테고리 강조
                              : ""
                          }`}
                        >
                          {leafNode}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
