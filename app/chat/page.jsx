"use client";
import Link from "next/link";
import { IoSend } from "react-icons/io5";

export default function ChatDefault() {
  return (
    <div className="border-4 border-black bg-white h-[600px] transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      <div className="border-b-4 border-black p-4 bg-gray-100">
        <h2 className="text-xl font-black">TIN NHẮN</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 border-4 border-black bg-gray-100 rounded-full flex items-center justify-center mb-6 transform rotate-3">
          <IoSend size={32} />
        </div>

        <h3 className="text-2xl font-black mb-3">
          Chưa có cuộc trò chuyện nào
        </h3>

        <p className="text-gray-600 max-w-md mb-6">
          Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu một cuộc
          trò chuyện mới từ trang sản phẩm.
        </p>

        <Link
          href="/posts"
          className="px-6 py-3 border-4 border-black bg-primary text-white font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    </div>
  );
}
