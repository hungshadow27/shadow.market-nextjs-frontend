"use client";
import Link from "next/link";
import { LuHandCoins } from "react-icons/lu";
import { FiMapPin } from "react-icons/fi";
import { CiClock2, CiEdit } from "react-icons/ci";
import { useState, useEffect } from "react";
import formatCurrencyVND, { timeSince } from "@/lib/utils";
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const PostCardSmall = ({ post }) => {
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage on client side
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoginUser(JSON.parse(storedUser));
    }
  }, []);

  // Determine main image source
  const mainImageSrc =
    post.images == null
      ? `/images/no-img.webp`
      : `${STRAPI_URL_LOCAL}${post.images[0].url}`;

  return (
    <div className="border-4 border-black bg-white transform hover:-translate-y-1 transition-transform hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative h-full">
      {/* Type badge */}
      <div className="absolute z-20 top-0 left-0 bg-black text-white px-3 py-1 font-bold">
        <div className="flex items-center gap-2">
          <LuHandCoins size={18} />
          <span>{post.type === "buy" ? "Muốn mua" : "Muốn bán"}</span>
        </div>
      </div>

      {/* Main image */}
      <div className="relative w-full h-48 border-b-4 border-black overflow-hidden">
        {/* Skeleton for main image */}
        {!isMainImageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>
        )}
        {/* Main image */}
        <img
          src={mainImageSrc}
          alt={post.title || "Post image"}
          className={`w-full h-full object-cover ${
            isMainImageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsMainImageLoaded(true)}
          onError={() => setIsMainImageLoaded(true)}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 min-h-[3.5rem]">
          {post.title}
        </h3>

        {/* Price */}
        <div className="mb-3 border-t-2 border-b-2 border-black py-2">
          <div className="flex items-center">
            <span className="font-bold">Giá:</span>
            <span className="text-lg font-bold ml-2">
              {post?.price ? formatCurrencyVND(post?.price) : "Thương lượng"}
            </span>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1">
            <CiClock2 size={16} />
            <span>{timeSince(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiMapPin size={16} />
            <span>{post.city?.name ? post.city?.name : "Không xác định"}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link
            href={`/post/${post.documentId}`}
            className="flex-1 block bg-yellow-custom text-center font-bold py-2 border-2 border-black transform hover:-translate-y-1 transition-transform"
          >
            Xem chi tiết
          </Link>

          {loginUser && post?.user?.id === loginUser?.id && (
            <Link
              href={`/edit/${post.documentId}`}
              className="flex items-center justify-center bg-black text-white w-10 h-10 border-2 border-black transform hover:-translate-y-1 transition-transform"
              title="Chỉnh sửa"
            >
              <CiEdit size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Status overlay */}
      {post?.statusP !== "active" && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="bg-black text-white text-2xl font-black border-4 border-white shadow-xl px-4 py-2 transform rotate-12">
            {post?.statusP === "sold" ? "ĐÃ HOÀN THÀNH" : "ĐÃ ẨN"}
          </div>
        </div>
      )}

      {/* Priority badge */}
      {post?.priority >= 1 && (
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 rotate-12 z-10">
          <div className="bg-yellow-custom border-4 border-black px-3 py-1 font-bold shadow-lg">
            TIN ƯU TIÊN
          </div>
        </div>
      )}

      {/* Category tag */}
      {post.category && (
        <div className="absolute top-10 right-0 transform translate-x-1/4 rotate-90 origin-bottom-left">
          <div className="bg-white border-2 border-black px-2 py-1">
            <span className="text-xs font-bold">{post.category.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCardSmall;
