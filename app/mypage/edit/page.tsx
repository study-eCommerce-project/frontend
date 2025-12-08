"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
  isVirtual?: boolean;
}

export default function MyInfoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [member, setMember] = useState<MemberInfo>({
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
    zipcode: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

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

  // 전화번호 자동 하이픈
  const formatPhone = (value: string) => {
    const number = value.replace(/[^0-9]/g, "").slice(0, 11);
    if (number.length < 4) return number;
    if (number.length < 7) return `${number.slice(0, 3)}-${number.slice(3)}`;
    if (number.length < 11)
      return `${number.slice(0, 3)}-${number.slice(3, 6)}-${number.slice(6)}`;
    return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
  };

  useEffect(() => {
    loadMyInfo();
    loadAddresses();
  }, []);

  const loadMyInfo = async () => {
    try {
      const res = await fetch(`${API_URL}/api/member/me`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMember({
        name: data.name,
        phone: formatPhone(data.phone ?? ""),
        address: data.address,
        addressDetail: data.addressDetail,
        zipcode: data.zipcode,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch(`${API_URL}/api/address`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setAddresses(await res.json());
    } catch (e) {
      console.error(e);
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

  // 가상 주소 생성
  const getRenderList = (): Address[] => {
    const hasDefault = addresses.some((a) => a.isDefault);
    if (hasDefault) return addresses;
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

  const convertVirtualToReal = async (): Promise<Address | null> => {
    const res = await fetch(`${API_URL}/api/address/add`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: member.name,
        phone: member.phone,
        address: member.address,
        detail: member.addressDetail,
        zipcode: member.zipcode ?? "",
        isDefault: false,
      }),
    });
    if (!res.ok) return null;

    await loadAddresses();
    const refreshed = await fetch(`${API_URL}/api/address`, {
      credentials: "include",
    });
    return (await refreshed.json())[0];
  };

  const saveMyInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member),
      });
      if (!res.ok) throw new Error();
      toast.success("내 정보 저장 완료");
    } catch {
      toast.error("저장 실패");
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async () => {
    try {
      const res = await fetch(`${API_URL}/api/address/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddress),
      });
      if (!res.ok) throw new Error();
      toast.success("배송지 추가 완료");
      setNewAddress({ name: "", phone: "", address: "", detail: "", zipcode: "", isDefault: false });
      loadAddresses();
    } catch {
      toast.error("추가 실패");
    }
  };

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

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_URL}/api/address/${editId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error();
      toast.success("수정 완료");
      setEditId(null);
      loadAddresses();
    } catch {
      toast.error("수정 실패");
    }
  };

  const handleDelete = async (item: Address) => {
    if (item.isVirtual) {
      toast.error("회원가입 기본주소는 삭제할 수 없습니다.");
      return;
    }

    if (item.isDefault) {
      toast.error("기본 배송지는 삭제할 수 없습니다.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/address/${item.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("삭제 완료");
      loadAddresses();
    } catch {
      toast.error("삭제 실패");
    }
  };

  const handleDefault = async (item: Address) => {
    try {
      if (item.isVirtual) {
        const newReal = await convertVirtualToReal();
        if (newReal) {
          const res = await fetch(`${API_URL}/api/address/${newReal.id}/default`, {
            method: "PATCH",
            credentials: "include",
          });
          if (!res.ok) throw new Error();
          toast.success("기본 배송지로 설정되었습니다.");
          loadAddresses();
        }
        return;
      }

      const res = await fetch(`${API_URL}/api/address/${item.id}/default`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("기본 배송지로 설정되었습니다.");
      loadAddresses();
    } catch {
      toast.error("기본 배송지 설정 실패");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
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
              onChange={(e) => setMember({ ...member, phone: formatPhone(e.target.value) })}
              placeholder="전화번호"
              className="w-full border-b py-2"
            />

            {/* 우편번호 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={member.zipcode ?? ""}
                onChange={(e) => setMember({ ...member, zipcode: e.target.value })}
                placeholder="우편번호"
                readOnly
                className="flex-1 border-b py-2"
              />

              <button
                type="button"
                onClick={openPostcodeForMyInfo}
                className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100 cursor-pointer"
              >
                주소 찾기
              </button>
            </div>

            <input
              type="text"
              value={member.address}
              onChange={(e) => setMember({ ...member, address: e.target.value })}
              placeholder="기본 주소"
              className="w-full border-b py-2"
            />

            <input
              type="text"
              value={member.addressDetail}
              onChange={(e) => setMember({ ...member, addressDetail: e.target.value })}
              placeholder="상세 주소"
              className="w-full border-b py-2"
            />

            <button
              onClick={saveMyInfo}
              className="w-full py-2 bg-black text-white rounded cursor-pointer"
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

              {editId === a.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full border-b p-2"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />

                  <input
                    className="w-full border-b p-2"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: formatPhone(e.target.value) })
                    }
                  />

                  {/* 우편번호 */}
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
                      className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      주소 찾기
                    </button>
                  </div>

                  <input className="w-full border-b p-2" value={editData.address} readOnly />

                  <input
                    className="w-full border-b p-2"
                    value={editData.detail}
                    onChange={(e) =>
                      setEditData({ ...editData, detail: e.target.value })
                    }
                  />

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-black text-white rounded cursor-pointer" onClick={saveEdit}>
                      저장
                    </button>
                    <button
                      className="px-3 py-1 bg-gray-300 rounded cursor-pointer"
                      onClick={() => setEditId(null)}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-semibold flex items-center gap-2">
                    <span>{a.name}</span>

                    {a.zipcode && <span className="text-sm text-gray-500">{a.zipcode}</span>}

                    {a.isDefault && <span className="text-sm text-gray-500">(기본)</span>}
                  </p>

                  <p className="text-gray-600">{a.phone}</p>
                  <p className="text-gray-600">{a.address} {a.detail}</p>

                  <div className="flex gap-4 mt-2 items-center">

                    {/* 수정 */}
                    <button
                      className="text-blue-600 cursor-pointer"
                      onClick={() => handleEdit(a)}
                    >
                      수정
                    </button>

                    {/* 삭제 (기본 배송지는 비활성화) */}
                    <button
                      className={`cursor-pointer ${a.isDefault ? "text-gray-400 cursor-not-allowed" : "text-red-500"
                        }`}
                      disabled={a.isDefault}
                      onClick={() => !a.isDefault && handleDelete(a)}
                    >
                      삭제
                    </button>

                    {/* 기본 배송지 설정 */}
                    <button
                      className="text-gray-800 cursor-pointer"
                      onClick={() => handleDefault(a)}
                    >
                      기본 배송지 설정
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
            onChange={(e) =>
              setNewAddress({ ...newAddress, name: e.target.value })
            }
          />

          <input
            className="w-full border-b p-2"
            placeholder="전화번호"
            value={newAddress.phone}
            onChange={(e) =>
              setNewAddress({ ...newAddress, phone: formatPhone(e.target.value) })
            }
          />

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
              className="px-3 py-1 border border-gray-300 bg-white rounded-sm text-sm hover:bg-gray-100 cursor-pointer"
            >
              주소 찾기
            </button>
          </div>

          <input className="w-full border-b p-2" placeholder="주소" value={newAddress.address} readOnly />

          <input
            className="w-full border-b p-2"
            placeholder="상세주소"
            value={newAddress.detail}
            onChange={(e) =>
              setNewAddress({ ...newAddress, detail: e.target.value })
            }
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={newAddress.isDefault}
              onChange={() =>
                setNewAddress({ ...newAddress, isDefault: !newAddress.isDefault })
              }
            />
            기본 배송지 설정
          </label>

          <button
            className="w-full bg-black text-white py-2 rounded cursor-pointer"
            onClick={addAddress}
          >
            배송지 추가
          </button>
        </div>
      </div>
    </div>
  );
}
