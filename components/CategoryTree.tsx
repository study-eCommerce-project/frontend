"use client";

/**
 * Category 컴포넌트
 * - 카테고리 트리(대·중·소)를 보여주고
 * - 소분류(leaf)를 클릭하면 leafCode를 부모에게 전달하는 UI
 */
interface CategoryProps {
  data: any; // 카테고리 트리 전체 데이터(대 → 중 → 소)
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
                    
                    // 소분류 클릭 → 선택한 leafCode를 부모로 전달
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
