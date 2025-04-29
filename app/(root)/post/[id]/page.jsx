"use client";
import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { BsShare } from "react-icons/bs";
import { IoCalendar } from "react-icons/io5";
import { notFound, useParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import formatCurrencyVND, {
  convertStatusN,
  maskPhoneNumber,
  timeSince,
} from "@/lib/utils";
import { FiMapPin } from "react-icons/fi";
import ProductImageGallery from "@/components/ProductImageGallery";
import { CiEdit } from "react-icons/ci";
import { MdOutlineReport } from "react-icons/md";
import { GrStatusUnknown } from "react-icons/gr";
import ReportModal from "@/components/ReportModal";
import ShareModal from "@/components/ShareModal";
import { useRouter } from "next/navigation";

const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const PostDetail = () => {
  const router = useRouter();

  const [loginUser, setLoginUser] = useState(undefined);
  const [showPhone, setShowPhone] = useState(false);
  const [post, setPost] = useState(null);
  const [savePost, setSavePost] = useState(0);
  const [video, setVideo] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setLoginUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchPost = async (id) => {
      try {
        const response = await axios.get(`${API_URL}/api/posts/${id}`, {
          params: {
            populate: {
              user: { populate: ["avatar", "city"] },
              category: true,
              images: true,
              ward: true,
              district: true,
              city: true,
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          },
        });
        return response.data.data;
      } catch (error) {
        console.error("Error fetching post:", error);
        return null;
      }
    };

    const fetchSavePost = async (id) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/saveposts`, {
          params: {
            "filters[user][documentId][$eq]": loginUser.documentId,
            "filters[posts][documentId][$eq]": id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.data;
      } catch (error) {
        console.error("Error fetching saved post:", error);
        return null;
      }
    };

    const fetchPostVideo = async (id) => {
      try {
        const response = await axios.get(`${API_URL}/api/short-videos`, {
          params: {
            "filters[relatedPost][documentId][$eq]": id,
            populate: {
              video: true,
            },
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
          },
        });
        return response.data.data;
      } catch (error) {
        console.error("Error fetching post video:", error);
        return null;
      }
    };

    const getPost = async () => {
      setIsLoading(true);
      const id = params?.id;
      if (!id) {
        notFound();
        return;
      }

      // Fetch public post data
      const postData = await fetchPost(id);
      if (!postData) {
        notFound();
        return;
      }
      setPost(postData);

      // Chỉ fetch savePost & video nếu đã đăng nhập
      if (loginUser) {
        const saveData = await fetchSavePost(id);
        setSavePost(saveData[0] || null);
      } else {
        setSavePost(null);
      }
      console.log(loginUser);
      const videoData = await fetchPostVideo(id);
      setVideo(videoData[0] || null);
      setIsLoading(false);
    };

    getPost();
  }, [params?.id, loginUser]);

  const pushNoti = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/notifications`, {
        params: {
          "filters[type][$eq]": "love",
          "filters[user1][documentId][$eq]": loginUser.documentId,
          "filters[user2][documentId][$eq]": post.user.documentId,
          "filters[post][id][$eq]": id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.data.length === 0) {
        const response = await axios.post(
          `${API_URL}/api/notifications`,
          {
            data: {
              type: "love",
              user1: loginUser.id,
              user2: post.user.id,
              post: {
                disconnect: [],
                connect: [{ id: id }],
              },
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error adding notification:", error);
      return null;
    }
  };

  const popNoti = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/notifications`, {
        params: {
          "filters[type][$eq]": "love",
          "filters[user1][documentId][$eq]": loginUser.documentId,
          "filters[user2][documentId][$eq]": post.user.documentId,
          "filters[post][id][$eq]": id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.data.length > 0) {
        const response = await axios.delete(
          `${API_URL}/api/notifications/${res.data.data[0].documentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data.data;
      }
    } catch (error) {
      console.error("Error removing notification:", error);
      return null;
    }
  };

  const addSavePost = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response1 = await axios.get(`${API_URL}/api/saveposts`, {
        params: {
          "filters[user][documentId][$eq]": loginUser.documentId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const savePostData = {
        posts: {
          disconnect: [],
          connect: [{ id }],
        },
      };

      if (response1.data.data.length !== 0) {
        const response = await axios.put(
          `${API_URL}/api/saveposts/${response1.data.data[0].documentId}`,
          {
            data: savePostData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        await pushNoti(id);
        return response.data.data;
      }
      savePostData.user = loginUser.id;
      const response = await axios.post(
        `${API_URL}/api/saveposts`,
        {
          data: savePostData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await pushNoti(id);
      return response.data.data;
    } catch (error) {
      console.error("Error adding saved post:", error);
      return null;
    }
  };

  const removeSavePost = async (id, postid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/saveposts/${id}`,
        {
          data: {
            posts: {
              disconnect: [{ id: post.id }],
              connect: [],
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await popNoti(postid);
      return response.data.data;
    } catch (error) {
      console.error("Error removing saved post:", error);
      return null;
    }
  };

  const handleSavePost = async () => {
    if (!loginUser) {
      router.push("/login");
      return;
    }

    if (!post) return;

    try {
      if (savePost) {
        console.log(savePost);
        await removeSavePost(savePost.documentId, post.id);
        setSavePost(null);
      } else {
        const data = await addSavePost(post.id);
        setSavePost(data);
      }
    } catch (error) {
      console.error("Error handling save post:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
          <div className="mt-8 animate-pulse">
            <div className="h-8 bg-gray-200 w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 w-3/4 mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-3/5">
                <div className="h-[500px] bg-gray-200 mb-6"></div>
                <div className="h-8 bg-gray-200 w-1/3 mb-4"></div>
                <div className="h-40 bg-gray-200 mb-6"></div>
              </div>
              <div className="w-full md:w-2/5">
                <div className="h-10 bg-gray-200 w-1/2 mb-6"></div>
                <div className="h-12 bg-gray-200 mb-4"></div>
                <div className="h-12 bg-gray-200 mb-8"></div>
                <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 w-3/4 mb-8"></div>
                <div className="h-16 bg-gray-200 mb-4"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
        {/* Announcement banner */}
        <div className="border-4 border-black bg-yellow-custom p-3 flex items-center justify-center gap-2 mb-6 transform -rotate-1">
          <FaStar size={20} />
          <Link href={`/`} className="font-bold">
            Holiday Giveaway is live now - Grab your free Gift!
          </Link>
        </div>

        {/* Back button */}
        <Link
          href={`/posts`}
          className="inline-flex items-center gap-2 font-bold border-2 border-black px-3 py-1 mb-6 hover:bg-black hover:text-white transition-colors"
        >
          <IoIosArrowBack />
          <span>Trở lại</span>
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Post details */}
          <div className="w-full lg:w-3/5">
            {/* Post title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 border-b-4 border-black pb-2">
              {post?.title || "Không có tiêu đề"}
            </h1>

            {/* Post category */}
            {post?.category && (
              <div className="mb-4">
                <span className="inline-block bg-black text-white font-bold px-3 py-1 transform rotate-1">
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Image gallery */}
            <div className="border-4 border-black mb-6">
              {post?.images ? (
                <ProductImageGallery images={post?.images} />
              ) : (
                <img
                  src="/images/no-img.webp"
                  alt=""
                  className="w-full h-[500px] object-cover"
                />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleSavePost}
                className="flex items-center gap-2 border-4 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
                title="Lưu tin"
              >
                {savePost ? (
                  <FaHeart size={20} className="text-red-500" />
                ) : (
                  <FaRegHeart size={20} />
                )}
                <span>{savePost ? "Đã lưu" : "Lưu tin"}</span>
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 border-4 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
                title="Chia sẻ tin"
              >
                <BsShare size={18} />
                <span>Chia sẻ</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 border-4 border-black px-4 py-2 font-bold hover:bg-red-500 hover:text-white transition-colors"
                title="Báo cáo tin vi phạm"
              >
                <MdOutlineReport size={20} />
                <span>Báo cáo</span>
              </button>
            </div>

            {/* Description section */}
            <div className="mb-8">
              <h2 className="text-xl font-black uppercase border-b-4 border-black pb-2 mb-4 transform -rotate-1 inline-block">
                Mô tả chi tiết
              </h2>

              {/* Video if available */}
              {video && (
                <div className="border-4 border-black mb-6">
                  <video
                    src={`${STRAPI_URL_LOCAL}${video.video[0].url}`}
                    controls
                    className="w-full h-auto"
                    poster={
                      post?.images?.[0]?.url
                        ? `${STRAPI_URL_LOCAL}${post.images[0].url}`
                        : undefined
                    }
                  />
                </div>
              )}

              {/* Description content */}
              <div
                className="border-4 border-black p-4 bg-white font-medium"
                dangerouslySetInnerHTML={{ __html: post?.description }}
              ></div>
            </div>
          </div>

          {/* Right column - Seller info and actions */}
          <div className="w-full lg:w-2/5">
            {/* Price section */}
            <div className="border-4 border-black bg-white p-4 mb-6 transform rotate-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Giá:</span>
                <span className="text-2xl md:text-3xl font-black text-green-custom">
                  {post?.price
                    ? formatCurrencyVND(post?.price)
                    : "Thương lượng"}
                </span>
              </div>
            </div>

            {/* Contact actions */}
            <div className="space-y-4 mb-8">
              <button
                className="w-full border-4 border-black bg-yellow-custom py-3 font-bold text-lg transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                onClick={() => setShowPhone(!showPhone)}
              >
                <span>
                  {showPhone
                    ? post?.user.phone
                    : maskPhoneNumber(post?.user.phone)}
                </span>
              </button>

              {loginUser?.id && post?.user.id === loginUser?.id ? (
                <Link
                  href={`/edit/${post.documentId}`}
                  className="flex items-center justify-center gap-2 w-full border-4 border-black bg-white py-3 font-bold text-lg transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <CiEdit size={24} />
                  <span>Sửa bài viết</span>
                </Link>
              ) : (
                <Link
                  href={`/chat/${post?.user.documentId}`}
                  className="w-full border-4 border-black bg-primary text-white py-3 font-bold text-lg text-center transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  Chat Ngay
                </Link>
              )}
            </div>

            {/* Post info */}
            <div className="border-4 border-black bg-white p-4 mb-8">
              <h3 className="font-black text-lg uppercase border-b-2 border-black pb-2 mb-4">
                Thông tin
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-yellow-custom">
                    <GrStatusUnknown size={20} />
                  </div>
                  <span className="font-bold">
                    {convertStatusN(post?.statusN)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-yellow-custom">
                    <IoCalendar size={20} />
                  </div>
                  <span className="font-bold">
                    {timeSince(post?.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-yellow-custom">
                    <FiMapPin size={20} />
                  </div>
                  <span className="font-bold">
                    {post?.ward?.name} - {post?.district?.name} -{" "}
                    {post?.city?.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Seller info */}
            <div className="border-4 border-black bg-white p-4">
              <h3 className="font-black text-lg uppercase border-b-2 border-black pb-2 mb-4">
                Người đăng
              </h3>

              <Link
                href={`/profile/${post?.user?.documentId}`}
                className="block group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {post?.user?.avatar ? (
                      <img
                        src={`${STRAPI_URL_LOCAL}${post?.user?.avatar.url}`}
                        alt="avatar"
                        className={`w-16 h-16 object-cover border-4 ${
                          post?.user?.vipExpireAt &&
                          new Date(post.user.vipExpireAt) > new Date()
                            ? "border-yellow-custom"
                            : "border-black"
                        }`}
                      />
                    ) : (
                      <img
                        src="/images/avatar-default.png"
                        alt="avatar"
                        className={`w-16 h-16 object-cover border-4 ${
                          post?.user?.vipExpireAt &&
                          new Date(post.user.vipExpireAt) > new Date()
                            ? "border-yellow-custom"
                            : "border-black"
                        }`}
                      />
                    )}
                    {post?.user?.vipExpireAt &&
                      new Date(post.user.vipExpireAt) > new Date() && (
                        <div className="absolute -top-2 -right-2 bg-yellow-custom border-2 border-black px-1 py-0.5 transform rotate-12">
                          <span className="text-xs font-bold">VIP</span>
                        </div>
                      )}
                  </div>

                  <div>
                    <div className="text-xl font-bold group-hover:underline">
                      @{post?.user?.username}
                      {post?.user?.name !== "" && (
                        <span> - {post?.user?.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin size={14} />
                      <span className="font-medium">
                        {post?.user?.city?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <FaStar className="text-yellow-custom" />
                      <FaStar className="text-yellow-custom" />
                      <FaStar className="text-yellow-custom" />
                      <FaStar className="text-yellow-custom" />
                      <FaStar className="text-gray-300" />
                      <span className="ml-2 font-bold">4.8</span>
                      <span className="text-sm text-gray-600">
                        (36 đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showReportModal && (
        <ReportModal
          onClose={(submitted) => {
            setShowReportModal(false);
            if (submitted) alert("Báo cáo của bạn đã được gửi. Cảm ơn bạn!");
          }}
          postId={post?.documentId}
          userId={loginUser?.id}
        />
      )}

      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          postTitle={post?.title}
          postId={post?.documentId}
        />
      )}
    </div>
  );
};

export default PostDetail;
