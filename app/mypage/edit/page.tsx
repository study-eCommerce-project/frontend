"use client";

import { useState, useEffect } from "react";

interface MemberInfo {
  name: string;
  phone: string;
  address: string;
  addressDetail: string;
  zipcode: string;
}

interface Address {
  id: number;
  name: string;
  phone: string;
  address: string;
  detail: string;
  zipcode: string;
  isDefault: boolean;
  isVirtual?: boolean; // 회원가입 기본주소 여부 표시
}

export default function MyInfoPage() {
  const [member, setMember] = useState<MemberInfo>({
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
    zipcode: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // 신규 배송지 추가 값
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    detail: "",
    zipcode: "",
    isDefault: false,
  });

  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    address: "",
    detail: "",
    zipcode: "",
  });

  // -------------------------------
  // 1) 내 정보 + 배송지 목록 불러오기
  // -------------------------------
  useEffect(() => {
    loadMyInfo();
    loadAddresses();
  }, []);

  const loadMyInfo = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/member/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("내 정보 조회 실패");

      const data = await res.json();
      setMember({
        name: data.name,
        phone: data.phone,
        address: data.address,
        addressDetail: data.addressDetail,
        zipcode: data.zipcode,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/address", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("주소 목록 조회 실패");

      const list = await res.json();
      setAddresses(list);
    } catch (err) {
      console.error(err);
    }
  };

  const openPostcodeForNew = () => {
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setNewAddress((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  // 수정용
  const openPostcodeForEdit = () => {
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setEditData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  // -----------------------------
  // 🚀 기본주소 가상 배송지 생성 로직
  // -----------------------------
  const getRenderList = (): Address[] => {
    const hasDefault = addresses.some((a) => a.isDefault);

    // 기본 배송지가 이미 존재하면 가상 주소는 숨김
    if (hasDefault) return addresses;

    // 회원가입 기본주소가 없으면 숨김
    if (!member.address) return addresses;

    const virtual: Address = {
      id: -1,
      name: member.name,
      phone: member.phone,
      address: member.address,
      detail: member.addressDetail,
      zipcode: member.zipcode ?? "",
      isDefault: false,
      isVirtual: true,
    };

    return [virtual, ...addresses];
  };

  // ----------------------------------
  // 🚀 가상 주소를 실제 주소로 변환 (DB 저장)
  // ----------------------------------
  const convertVirtualToReal = async (): Promise<Address | null> => {
    const body = {
      name: member.name,
      phone: member.phone,
      address: member.address,
      detail: member.addressDetail,
      zipcode: member.zipcode ?? "",
      isDefault: false,
    };

    const res = await fetch("http://localhost:8080/api/address/add", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) return null;

    await loadAddresses();
    const refreshed = await fetch("http://localhost:8080/api/address", {
      credentials: "include",
    });
    return (await refreshed.json())[0]; // 가장 최근 항목
  };

  // --------------------------
  // 2) 내 정보 저장
  // --------------------------
  const saveMyInfo = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/update", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      });

      if (!res.ok) throw new Error("저장 실패");

      alert("내 정보가 저장되었습니다.");
    } catch (err) {
      alert("저장 오류");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // 3) 배송지 추가
  // --------------------------
  const addAddress = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/address/add", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });

      if (!res.ok) throw new Error();

      alert("추가 완료");
      setNewAddress({ name: "", phone: "", address: "", detail: "", zipcode: "", isDefault: false });
      loadAddresses();
    } catch (err) {
      alert("추가 실패");
    }
  };

  // --------------------------
  // 🚀 4) 수정 버튼 클릭
  // --------------------------
  const handleEdit = async (item: Address) => {
    if (item.isVirtual) {
      const newReal = await convertVirtualToReal();
      if (newReal) {
        setEditId(newReal.id);
        setEditData({
          name: newReal.name,
          phone: newReal.phone,
          address: newReal.address,
          detail: newReal.detail,
          zipcode: newReal.zipcode ?? "",
        });
      }
      return;
    }

    setEditId(item.id);
    setEditData({
      name: item.name,
      phone: item.phone,
      address: item.address,
      detail: item.detail,
      zipcode: item.zipcode ?? "",
    });
  };

  // --------------------------
  // 4-2) 수정 저장
  // --------------------------
  const saveEdit = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/address/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error();

      alert("수정 완료");
      setEditId(null);
      loadAddresses();
    } catch (err) {
      alert("수정 실패");
    }
  };

  // --------------------------
  // 5) 삭제
  // --------------------------
  const handleDelete = async (item: Address) => {
    if (item.isVirtual) {
      alert("회원가입 기본주소는 삭제할 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/address/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error();

      alert("삭제 완료");
      loadAddresses();
    } catch (err) {
      alert("삭제 실패");
    }
  };

  // --------------------------
  // 6) 기본 설정
  // --------------------------
  const handleDefault = async (item: Address) => {
    if (item.isVirtual) {
      const newReal = await convertVirtualToReal();
      if (newReal) {
        await fetch(`http://localhost:8080/api/address/${newReal.id}/default`, {
          method: "PATCH",
          credentials: "include",
        });
        loadAddresses();
      }
      return;
    }

    await fetch(`http://localhost:8080/api/address/${item.id}/default`, {
      method: "PATCH",
      credentials: "include",
    });

    loadAddresses();
  };

  const openPostcodeForMyInfo = () => {
    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        setMember((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };


  // --------------------------
  // UI 렌더링
  // --------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* 내 정보 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">내 정보</h2>

          <div className="space-y-3">
            <input
              type="text"
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
              placeholder="이름"
              className="w-full border-b py-2"
            />

            <input
              type="text"
              value={member.phone}
              onChange={(e) => setMember({ ...member, phone: e.target.value })}
              placeholder="전화번호"
              className="w-full border-b py-2"
            />

            
            <div className="flex gap-2">
              <input
                type="text"
                value={member.address}
                onChange={(e) => setMember({ ...member, address: e.target.value })}
                placeholder="기본 주소"
                className="flex-1 border-b py-2"
              />

              <button
                type="button"
                onClick={openPostcodeForMyInfo}
                className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100"
              >
                주소 찾기
              </button>
            </div>

            <input
              type="text"
              value={member.addressDetail}
              onChange={(e) => setMember({ ...member, addressDetail: e.target.value })}
              placeholder="상세 주소"
              className="w-full border-b py-2"
            />

            <button
              onClick={saveMyInfo}
              className="w-full py-2 bg-black text-white rounded"
              disabled={loading}
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>

        {/* 주소 목록 */}
        <div className="space-y-4">
          {getRenderList().map((a) => (
            <div key={a.id} className="bg-white p-4 rounded shadow border">

              {/* 수정모드 */}
              {editId === a.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full border-b p-2"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />

                  <input
                    className="w-full border-b p-2"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <input
                      className="flex-1 border-b p-2"
                      placeholder="우편번호"
                      value={editData.zipcode}
                      readOnly
                    />

                    <button
                      type="button"
                      onClick={openPostcodeForEdit}
                      className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100"
                    >
                      주소 찾기
                    </button>
                  </div>

                  
                  <input
                    className="w-full border-b p-2"
                    value={editData.address}
                    readOnly
                  />

                  <input
                    className="w-full border-b p-2"
                    value={editData.detail}
                    onChange={(e) => setEditData({ ...editData, detail: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-black text-white rounded" onClick={saveEdit}>
                      저장
                    </button>
                    <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setEditId(null)}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold">
                    {a.name}{" "}
                    {a.isDefault && <span className="text-sm text-gray-500">(기본)</span>}
                  </p>
                  <p className="text-gray-600">{a.phone}</p>
                  <p className="text-gray-600">{a.address} {a.detail}</p>

                  <div className="flex gap-4 mt-2">
                    <button className="text-blue-600" onClick={() => handleEdit(a)}>
                      수정
                    </button>
                    <button className="text-red-500" onClick={() => handleDelete(a)}>
                      삭제
                    </button>
                    <button className="text-gray-800" onClick={() => handleDefault(a)}>
                      기본 설정
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>

        {/* 주소 추가 */}
        <div className="bg-white p-4 border rounded space-y-3 shadow">
          <input
            className="w-full border-b p-2"
            placeholder="이름"
            value={newAddress.name}
            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
          />

          <input
            className="w-full border-b p-2"
            placeholder="전화번호"
            value={newAddress.phone}
            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
          />

          {/* 우편번호 + 주소 찾기 버튼 */}
          <div className="flex gap-2">
            <input
              className="flex-1 border-b p-2"
              placeholder="우편번호"
              value={newAddress.zipcode}
              readOnly
            />

            <button
              type="button"
              onClick={openPostcodeForNew}
              className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100"
            >
              주소 찾기
            </button>
          </div>

          {/* 주소 input (자동입력) */}
          <input
            className="w-full border-b p-2"
            placeholder="주소"
            value={newAddress.address}
            readOnly
          />

          <input
            className="w-full border-b p-2"
            placeholder="상세주소"
            value={newAddress.detail}
            onChange={(e) => setNewAddress({ ...newAddress, detail: e.target.value })}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newAddress.isDefault}
              onChange={() =>
                setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })
              }
            />
            기본 배송지 설정
          </label>

          <button className="w-full bg-black text-white py-2 rounded" onClick={addAddress}>
            배송지 추가
          </button>
        </div>
      </div>
    </div>
  );
}
