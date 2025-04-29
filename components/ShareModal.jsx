"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaFacebook, FaTwitter, FaLink, FaCheck } from "react-icons/fa";
import { FaTelegram } from "react-icons/fa6";
import { IoIosClose } from "react-icons/io";

const ShareModal = ({ onClose, postTitle, postId }) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Get the current URL when component mounts
    if (typeof window !== "undefined") {
      setShareUrl(`${window.location.origin}/post/${postId}`);
    }
  }, [postId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToTwitter = () => {
    const text = `Xem tin đăng "${postTitle}" trên Shadow Market`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareToTelegram = () => {
    const text = `Xem tin đăng "${postTitle}" trên Shadow Market`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-md transform -rotate-1">
        <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black">CHIA SẺ TIN ĐĂNG</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200">
            <IoIosClose size={24} />
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-bold mb-4">"{postTitle}"</h3>

          {/* Copy link section */}
          <div className="mb-6">
            <div className="flex">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 p-3 border-4 border-r-0 border-black focus:ring-0 focus:border-black bg-gray-50"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 border-4 border-black bg-yellow-custom font-bold flex items-center gap-2"
              >
                {copied ? <FaCheck size={16} /> : <FaLink size={16} />}
                <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
              </button>
            </div>
          </div>

          {/* Social media sharing */}
          <div>
            <h3 className="font-bold mb-3 uppercase">Chia sẻ qua:</h3>
            <div className="flex gap-4">
              <button
                onClick={shareToFacebook}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-4 border-black hover:bg-blue-100 transition-colors"
              >
                <FaFacebook size={32} className="text-blue-600" />
                <span className="font-bold">Facebook</span>
              </button>

              <button
                onClick={shareToTwitter}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-4 border-black hover:bg-blue-100 transition-colors"
              >
                <FaTwitter size={32} className="text-blue-400" />
                <span className="font-bold">Twitter</span>
              </button>

              <button
                onClick={shareToTelegram}
                className="flex-1 flex flex-col items-center gap-2 p-4 border-4 border-black hover:bg-blue-100 transition-colors"
              >
                <FaTelegram size={32} className="text-blue-500" />
                <span className="font-bold">Telegram</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareModal;
