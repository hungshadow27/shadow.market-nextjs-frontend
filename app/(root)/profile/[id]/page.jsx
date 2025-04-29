"use client";
import EditProfileModal from "@/components/EditProfileModal";
import PostCardSmall from "@/components/PostCardSmall";
import { timeSince, convertGender } from "@/lib/utils";
import axios from "axios";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FaHeart,
  FaRegClock,
  FaRegEdit,
  FaShareSquare,
  FaTrashRestore,
} from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { IoIosArrowBack, IoMdGrid, IoMdSettings } from "react-icons/io";
import { SlUserFollow } from "react-icons/sl";
import SettingsModal from "@/components/SettingsModal";
import ShareModal from "@/components/ShareModal";
import { Bounce, toast, ToastContainer } from "react-toastify";

const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const UserProfile = () => {
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [expiredPosts, setExpiredPosts] = useState([]);
  const [savePosts, setSavePosts] = useState([]);
  const [tab, setTab] = useState(1);
  const [loginUser, setLoginUser] = useState(null);
  const [fetchedTabs, setFetchedTabs] = useState({
    1: false,
    2: false,
    3: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileInputRef = useRef(null);

  const ToastError = (text) =>
    toast.error(text, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  const ToastSuccess = (text) =>
    toast.success(text, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });

  const isVipActive =
    user?.vipExpireAt && new Date(user.vipExpireAt) > new Date();
  const isOwnProfile = user?.username === loginUser?.username;

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    try {
      const uploadedFile = await uploadAvatar(file);
      await updateUserAvatar(uploadedFile.id);
      ToastSuccess("Update avatar thành công!");
    } catch (err) {
      ToastError("Update avatar thất bại!");
    }
  };

  async function uploadAvatar(file) {
    const formData = new FormData();
    formData.append("files", file);
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    setAvatarUrl(data[0].url);
    if (user?.avatar != null) {
      await deleteOldAvatar(user.avatar.id);
    }
    setUser((prevState) => ({
      ...prevState,
      avatar: data[0],
    }));
    return data[0];
  }

  async function deleteOldAvatar(imageId) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/upload/files/${imageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    return data;
  }

  async function updateUserAvatar(avatarId) {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: avatarId }),
    });
  }

  const fetchUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          "filters[documentId][$eq]": id,
          populate: {
            avatar: true,
            city: true,
            district: true,
            ward: true,
          },
        },
      });
      return response.data[0];
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const fetchPosts = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sort: "createdAt:desc",
          filters: {
            user: {
              documentId: { $eq: id },
            },
            statusP: "active",
          },
          populate: {
            user: true,
            images: true,
            city: true,
            district: true,
            ward: true,
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return null;
    }
  };

  const fetchFinishedPosts = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sort: "createdAt:desc",
          filters: {
            user: {
              documentId: { $eq: id },
            },
            statusP: "sold",
          },
          populate: {
            user: true,
            images: true,
            city: true,
            district: true,
            ward: true,
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching expired posts:", error);
      return null;
    }
  };

  const fetchSavePosts = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }
      const response = await axios.get(`${API_URL}/api/saveposts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sort: "createdAt:desc",
          filters: {
            user: {
              documentId: { $eq: id },
            },
          },
          populate: {
            posts: {
              sort: "createdAt:desc",
              populate: ["images", "city", "user"],
            },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching save posts:", error);
      return null;
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }
      const response = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        const userData = await fetchUser(params?.id);
        setUser(userData);
        setIsModalOpen(false);
        ToastSuccess("Cập nhật hồ sơ thành công!");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      ToastError("Cập nhật hồ sơ thất bại!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Nếu không có token hoặc user thì chuyển hướng sang trang đăng nhập
    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setLoginUser(JSON.parse(userData));
    const id = params?.id;
    if (!id) {
      notFound();
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const initUser = async () => {
      const userData = await fetchUser(id);
      if (!isMounted || !userData) {
        notFound();
        return;
      }

      setAvatarUrl(userData?.avatar?.url || "/images/avatar-default.png");
      setUser(userData);

      const postsData = await fetchPosts(id);
      if (!isMounted || !postsData) return;
      setPosts(postsData);
      setFetchedTabs((prev) => ({ ...prev, 1: true }));
      setIsLoading(false);
    };

    initUser();

    return () => {
      isMounted = false;
    };
  }, [params?.id, router]);

  useEffect(() => {
    const id = params?.id;
    if (!id || !user) return;

    const fetchTabData = async () => {
      if (tab === 2 && !fetchedTabs[2]) {
        const expiredData = await fetchFinishedPosts(id);
        if (expiredData) {
          setExpiredPosts(expiredData);
          setFetchedTabs((prev) => ({ ...prev, 2: true }));
        }
      }
      if (tab === 3 && !fetchedTabs[3]) {
        const savePostsData = await fetchSavePosts(id);
        if (savePostsData[0]?.posts) {
          setSavePosts(savePostsData[0].posts);
          setFetchedTabs((prev) => ({ ...prev, 3: true }));
        }
      }
    };

    fetchTabData();
  }, [tab, params?.id, user, fetchedTabs]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
          <div className="mt-8 animate-pulse">
            <div className="h-8 bg-gray-200 w-1/4 mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-32 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 w-1/4 mb-6"></div>
                <div className="h-20 bg-gray-200 w-full"></div>
              </div>
              <div className="w-40">
                <div className="h-10 bg-gray-200 mb-4"></div>
                <div className="h-10 bg-gray-200"></div>
              </div>
            </div>
            <div className="mt-12">
              <div className="h-12 bg-gray-200 mb-8"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200"></div>
                ))}
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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-bold border-2 border-black px-3 py-1 mb-6 hover:bg-black hover:text-white transition-colors"
        >
          <IoIosArrowBack />
          <span>Trở lại</span>
        </Link>

        {/* Profile header */}
        <div className="border-4 border-black bg-white p-6 mb-8 transform rotate-1">
          <h1 className="text-2xl md:text-3xl font-black mb-6">
            TRANG CÁ NHÂN
          </h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {!isAvatarLoaded && (
                  <div className="w-32 h-32 border-4 border-black bg-gray-200 animate-pulse flex items-center justify-center">
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

                <div
                  className={`relative ${isOwnProfile ? "cursor-pointer" : ""}`}
                  title={isOwnProfile ? "Nhấp để thay đổi ảnh đại diện" : ""}
                >
                  {user?.avatar?.url ? (
                    <img
                      src={`${STRAPI_URL_LOCAL}${avatarUrl}`}
                      alt="avatar"
                      className={`w-32 h-32 object-cover border-4 ${
                        isVipActive ? "border-yellow-custom" : "border-black"
                      } ${isAvatarLoaded ? "opacity-100" : "opacity-0"}`}
                      onClick={handleAvatarClick}
                      onLoad={() => setIsAvatarLoaded(true)}
                      onError={() => setIsAvatarLoaded(true)}
                    />
                  ) : (
                    <img
                      src={`${avatarUrl}`}
                      alt="avatar"
                      className={`w-32 h-32 object-cover border-4 ${
                        isVipActive ? "border-yellow-custom" : "border-black"
                      } ${isAvatarLoaded ? "opacity-100" : "opacity-0"}`}
                      onClick={handleAvatarClick}
                      onLoad={() => setIsAvatarLoaded(true)}
                      onError={() => setIsAvatarLoaded(true)}
                    />
                  )}

                  {isVipActive && (
                    <div className="absolute -top-4 -right-4 bg-yellow-custom border-2 border-black px-2 py-1 transform rotate-12">
                      <span className="font-bold text-sm">VIP</span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                <div className="flex flex-col items-center border-2 border-black px-3 py-2 bg-gray-100">
                  <span className="text-xl font-bold">{posts.length}</span>
                  <span className="text-sm font-medium">Tin đăng</span>
                </div>
                <div className="flex flex-col items-center border-2 border-black px-3 py-2 bg-gray-100">
                  <span className="text-xl font-bold">36</span>
                  <span className="text-sm font-medium">Người theo dõi</span>
                </div>
              </div>
            </div>

            {/* User info section */}
            <div className="flex-1">
              <div className="text-2xl font-black">
                @{user?.username}
                {user?.name && <span className="ml-2">- {user?.name}</span>}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 flex items-center justify-center border-2 border-black bg-gray-100">
                  <FiMapPin size={14} />
                </div>
                <span className="font-medium">
                  {user?.ward?.name ? `${user.ward.name} - ` : ""}
                  {user?.district?.name ? `${user.district.name} - ` : ""}
                  {user?.city?.name || "Chưa cập nhật địa chỉ"}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div className="w-6 h-6 flex items-center justify-center border-2 border-black bg-gray-100">
                  <FaRegClock size={14} />
                </div>
                <span className="font-medium">
                  Đã tham gia: {timeSince(user?.createdAt)}
                </span>
              </div>

              {user?.gender && (
                <div className="mt-2 font-medium">
                  Giới tính: {convertGender(user.gender)}
                </div>
              )}

              <div className="mt-4 p-4 border-2 border-black bg-gray-50">
                <p className="font-medium">
                  {user?.bio || "Chưa có thông tin giới thiệu."}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-4">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 border-4 border-black bg-white py-3 px-4 font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FaRegEdit size={18} />
                    <span>Sửa hồ sơ</span>
                  </button>

                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="flex items-center justify-center gap-2 border-4 border-black bg-yellow-custom py-3 px-4 font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <IoMdSettings size={18} />
                    <span>Cài đặt</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center justify-center gap-2 border-4 border-black bg-white py-3 px-4 font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SlUserFollow size={18} />
                    <span>Theo dõi</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center justify-center gap-2 border-4 border-black bg-yellow-custom py-3 px-4 font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FaShareSquare size={18} />
                    <span>Chia sẻ</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="border-4 border-black bg-white transform -rotate-1">
          {/* Tab navigation */}
          <div className="flex border-b-4 border-black">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg ${
                tab === 1 ? "bg-yellow-custom" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab(1)}
            >
              <IoMdGrid size={20} />
              <span>Tin đăng</span>
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg border-l-4 border-r-4 border-black ${
                tab === 2 ? "bg-yellow-custom" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab(2)}
            >
              <FaTrashRestore size={20} />
              <span>Đã hoàn thành</span>
            </button>

            <button
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg ${
                tab === 3 ? "bg-yellow-custom" : "hover:bg-gray-100"
              }`}
              onClick={() => setTab(3)}
            >
              <FaHeart size={20} />
              <span>Đã lưu</span>
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {tab === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCardSmall post={post} key={post.id} />
                  ))
                ) : (
                  <div className="col-span-full border-4 border-dashed border-gray-300 p-8 text-center">
                    <p className="text-xl font-bold mb-4">
                      Không có tin đăng nào.
                    </p>
                    {isOwnProfile && (
                      <Link
                        href="/create"
                        className="inline-block border-4 border-black bg-yellow-custom px-4 py-2 font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Đăng tin ngay
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {expiredPosts.length > 0 ? (
                  expiredPosts.map((post) => (
                    <PostCardSmall post={post} key={post.id} />
                  ))
                ) : (
                  <div className="col-span-full border-4 border-dashed border-gray-300 p-8 text-center">
                    <p className="text-xl font-bold">
                      Không có tin đăng đã hoàn thành.
                    </p>
                  </div>
                )}
              </div>
            )}

            {tab === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savePosts.length > 0 ? (
                  savePosts.map((post) => (
                    <PostCardSmall post={post} key={post.id} />
                  ))
                ) : (
                  <div className="col-span-full border-4 border-dashed border-gray-300 p-8 text-center">
                    <p className="text-xl font-bold">
                      Không có tin đăng đã lưu.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onLogout={handleLogout}
        />
      )}

      {isShareModalOpen && (
        <ShareModal
          onClose={() => setIsShareModalOpen(false)}
          postTitle={`Trang cá nhân của ${user?.username}`}
          postId={params?.id}
          isProfile={true}
        />
      )}
    </div>
  );
};

export default UserProfile;
