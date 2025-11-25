"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryTreeProps {
  data: any;
  onSelect: (leafCode: string) => void;
}

export default function CategoryTreeAccordion({ data, onSelect }: CategoryTreeProps) {
  const [openBig, setOpenBig] = useState<{ [key: string]: boolean }>({});
  const [openMid, setOpenMid] = useState<{ [key: string]: boolean }>({});

  const toggleBig = (code: string) =>
    setOpenBig(prev => ({ ...prev, [code]: !prev[code] }));

  const toggleMid = (code: string) =>
    setOpenMid(prev => ({ ...prev, [code]: !prev[code] }));

  return (
    <div className="text-white select-none">
      {Object.entries(data).map(([bigCode, bigNode]: any) => (
        <div key={bigCode} className="mb-3">
          {/* 🔵 대분류 */}
          <button
            onClick={() => toggleBig(bigCode)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            <span className="font-semibold">{bigNode.title}</span>
            {openBig[bigCode] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openBig[bigCode] && (
            <div className="ml-3 mt-2 space-y-2">
              {Object.entries(bigNode.children).map(([midCode, midNode]: any) => (
                <div key={midCode}>
                  {/* 🟣 중분류 */}
                  <button
                    onClick={() => toggleMid(midCode)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded"
                  >
                    <span>{midNode.title}</span>
                    {openMid[midCode] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {openMid[midCode] && (
                    <div className="ml-3 mt-1 space-y-1">
                      {/* 🟢 소분류 */}
                      {Object.entries(midNode.children).map(([leafCode, leafNode]: any) => (
                        <p
                          key={leafCode}
                          onClick={() => onSelect(leafCode)}
                          className="px-3 py-1 rounded cursor-pointer bg-gray-500 hover:bg-gray-400"
                        >
                          {leafNode.title}
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
