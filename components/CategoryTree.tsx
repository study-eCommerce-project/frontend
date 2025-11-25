"use client";

interface CategoryProps {
  data: any; // 카테고리 트리 전체 데이터
  onSelect: (leafCode: string) => void; // 선택한 소분류 코드 전달
}

export default function Category({ data, onSelect }: CategoryProps) {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(data).map(([bigCode, bigNode]: any) => (
        <div key={bigCode} className="mb-4">
          {/* 대분류 */}
          <p className="font-bold mb-2">{bigNode.title}</p>

          {/* 중분류 */}
          {Object.entries(bigNode.children).map(([midCode, midNode]: any) => (
            <div key={midCode} className="ml-3 mb-2">
              <p className="font-semibold">{midNode.title}</p>

              {/* 소분류 */}
              <div className="ml-3 flex flex-col gap-1">
                {Object.entries(midNode.children).map(([leafCode, leafName]: any) => (
                  <button
                    key={leafCode}
                    className="text-left hover:text-blue-600"
                    onClick={() => onSelect(leafCode)}
                  >
                    ▸ {leafName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
