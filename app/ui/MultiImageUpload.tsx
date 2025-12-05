import React, { useState } from "react";

interface MultiImageUploadProps {
  images: string[];
  onChange: (imgs: string[]) => void;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({ images, onChange }) => {
  const [newImageUrl, setNewImageUrl] = useState("");

  // 새로운 이미지 URL을 추가하는 함수
  const handleAddImage = () => {
    if (newImageUrl) {
      onChange([...images, newImageUrl]);  // 기존 이미지 배열에 새로운 URL 추가
      setNewImageUrl("");  // URL 입력 필드 초기화
    }
  };

  // 이미지 URL을 제거하는 함수
  const handleRemoveImage = (imageUrl: string) => {
    onChange(images.filter((img) => img !== imageUrl));
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          placeholder="이미지 URL을 입력하세요"
          className="border p-2 w-full"
        />
        <button
          onClick={handleAddImage}
          className="bg-blue-500 text-white p-2 rounded"
        >
          추가
        </button>
      </div>
      
      <div className="flex gap-2">
        {images.map((img, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <img src={img} alt={`sub-image-${idx}`} className="w-24 h-24 object-cover" />
            <button
              onClick={() => handleRemoveImage(img)}
              className="bg-red-500 text-white p-2 rounded"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiImageUpload;
