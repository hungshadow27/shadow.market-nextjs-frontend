"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";

const reasons = [
  "Tin sai sự thật",
  "Nội dung phản cảm",
  "Hành vi lừa đảo",
  "Spam hoặc quảng cáo",
  "Khác",
];

const ReportModal = ({ onClose, postId, userId }) => {
  const router = useRouter();

  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${process.env.STRAPI_URL}/api/reports`,
        {
          data: {
            reason: selectedReason,
            description,
            post: postId,
            user: userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onClose(true); // báo thành công
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-md transform rotate-1">
        <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black">BÁO CÁO TIN ĐĂNG</h2>
          <button
            onClick={() => onClose(false)}
            className="p-1 hover:bg-gray-200"
          >
            <IoIosClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-bold mb-3 uppercase">Lý do báo cáo:</h3>
            <div className="space-y-3">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    onChange={() => setSelectedReason(reason)}
                    checked={selectedReason === reason}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <span className="font-medium">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Khác" && (
            <div className="mb-6">
              <label className="block font-bold mb-2 uppercase">
                Mô tả chi tiết:
              </label>
              <textarea
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                placeholder="Mô tả chi tiết lý do báo cáo..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-2 border-4 border-black font-bold hover:bg-gray-100"
            >
              HỦY
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedReason || submitting}
              className="px-4 py-2 border-4 border-black bg-red-500 text-white font-bold disabled:opacity-50"
            >
              {submitting ? "ĐANG GỬI..." : "GỬI BÁO CÁO"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
