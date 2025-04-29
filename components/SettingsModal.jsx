"use client";
import { useState } from "react";
import { IoIosClose } from "react-icons/io";

const SettingsModal = ({ onClose, onLogout }) => {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    if (confirmLogout) {
      onLogout();
    } else {
      setConfirmLogout(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-center p-4">
      <div className="bg-white border-4 border-black w-full max-w-md transform rotate-1">
        <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black">CÀI ĐẶT</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200">
            <IoIosClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div className="border-b-2 border-black pb-4">
              <h3 className="font-bold text-lg mb-3">Tài khoản</h3>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-3 border-4 border-black bg-red-500 text-white font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {confirmLogout ? "XÁC NHẬN ĐĂNG XUẤT?" : "ĐĂNG XUẤT"}
              </button>
              {confirmLogout && (
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="w-full mt-2 py-2 text-sm font-medium hover:underline"
                >
                  Hủy
                </button>
              )}
            </div>

            <div className="border-b-2 border-black pb-4">
              <h3 className="font-bold text-lg mb-3">Quyền riêng tư</h3>
              <div className="flex items-center justify-between">
                <span className="font-medium">Hiển thị số điện thoại</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none border-2 border-black peer-checked:bg-yellow-custom"></div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Thông báo</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Thông báo tin nhắn</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none border-2 border-black peer-checked:bg-yellow-custom"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Thông báo tương tác</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none border-2 border-black peer-checked:bg-yellow-custom"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 border-4 border-black font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
