"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";
import { IoIosArrowBack } from "react-icons/io";
import {
  FaUpload,
  FaImage,
  FaTrash,
  FaCheck,
  FaStar,
  FaEdit,
} from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";
const CkEditor = dynamic(() => import("@/components/CkEditor"), { ssr: false });
const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const EditPost = () => {
  const { id } = useParams();
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("buy");
  const [price, setPrice] = useState("");
  const [statusN, setStatusN] = useState("new");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [images, setImages] = useState([]); // New images to upload
  const [existingImages, setExistingImages] = useState([]); // Existing images
  const [priority, setPriority] = useState(0);

  // Data lists
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showBoostConfirm, setShowBoostConfirm] = useState(false);

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
  const handleOnUpdate = (data, field) => {
    // This function is passed to CkEditor but we handle changes directly in the onChange event
  };

  // Fetch post data
  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            populate: {
              category: true,
              images: true,
              city: true,
              district: true,
              ward: true,
            },
          },
        });

        const postData = response.data.data;
        setTitle(postData.title);
        setDescription(postData.description);
        setType(postData.type);
        setPrice(postData.price);
        setStatusN(postData.statusN);
        setPriority(postData.priority || 0);

        if (postData.category) setSelectedCategory(postData.category.id);
        if (postData.city) setSelectedCity(postData.city.id);
        if (postData.district) setSelectedDistrict(postData.district.id);
        if (postData.ward) setSelectedWard(postData.ward.id);

        // Set existing images
        if (postData.images && postData.images.length > 0) {
          setExistingImages(postData.images);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        ToastError("Không thể tải thông tin bài đăng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data.map((c) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải danh mục");
      }
    };
    fetchCategories();
  }, []);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/cities`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCities(res.data.data.map((c) => ({ id: c.id, name: c.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải thành phố");
      }
    };
    fetchCities();
  }, []);

  // Fetch districts based on selected city
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }

    const fetchDistricts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { filters: { city: { id: { $eq: selectedCity } } } },
        });
        setDistricts(res.data.data.map((d) => ({ id: d.id, name: d.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải quận/huyện");
      }
    };
    fetchDistricts();
  }, [selectedCity]);

  // Fetch wards based on selected district
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    const fetchWards = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/wards`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { filters: { district: { id: { $eq: selectedDistrict } } } },
        });
        setWards(res.data.data.map((w) => ({ id: w.id, name: w.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải phường/xã");
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newImageUrls);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !currentUser) {
      ToastError("Bạn cần đăng nhập để chỉnh sửa bài đăng");
      return;
    }

    if (
      !title ||
      !description ||
      !selectedCategory ||
      !selectedCity ||
      !selectedDistrict ||
      !selectedWard
    ) {
      ToastError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setIsSubmitting(true);
    try {
      // Upload new images if any
      let uploadedImages = [];
      if (images.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < images.length; i++) {
          formData.append("files", images[i]);
        }

        try {
          const uploadResponse = await axios.post(
            `${API_URL}/api/upload`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          uploadedImages = uploadResponse.data.map((img) => ({ id: img.id }));
        } catch (error) {
          console.error("Error uploading images:", error);
          ToastError("Upload ảnh thất bại");
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare post data
      const postData = {
        user: currentUser.id,
        category: {
          disconnect: [],
          connect: [{ id: selectedCategory }],
        },
        title,
        description,
        type,
        price: price,
        statusN,
        city: {
          disconnect: [],
          connect: [{ id: selectedCity }],
        },
        district: {
          disconnect: [],
          connect: [{ id: selectedDistrict }],
        },
        ward: {
          disconnect: [],
          connect: [{ id: selectedWard }],
        },
      };

      // Only update images if new ones were uploaded
      if (uploadedImages.length > 0) {
        postData.images = uploadedImages;
      }

      // Update post
      await axios.put(
        `${API_URL}/api/posts/${id}`,
        { data: postData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      ToastSuccess("Bài đăng đã được cập nhật thành công");
    } catch (error) {
      console.error("Error updating post:", error);
      ToastError("Cập nhật bài đăng thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete post
  const deletePost = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      // First check for related short videos
      const res = await axios.get(`${API_URL}/api/short-videos`, {
        params: { "filters[relatedPost][documentId][$eq]": id },
        headers: { Authorization: `Bearer ${token}` },
      });

      const videos = res.data.data || [];

      // Delete each short video
      for (const video of videos) {
        await axios.delete(`${API_URL}/api/short-videos/${video.documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Delete the post
      await axios.delete(`${API_URL}/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      ToastSuccess("Bài đăng đã được xóa thành công");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error deleting post:", error);
      ToastError("Xóa bài đăng thất bại");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Mark post as finished
  const markAsFinished = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        `${API_URL}/api/posts/${id}`,
        {
          data: {
            statusP: "sold",
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      ToastSuccess("Bài đăng đã được đánh dấu là đã hoàn thành");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Error marking post as finished:", error);
      ToastError("Không thể cập nhật trạng thái. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
      setShowFinishConfirm(false);
    }
  };

  // Boost post
  const boostPost = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    try {
      // Get user info to check balance
      const userRes = await axios.get(
        `${API_URL}/api/users/${currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userBalance = Number(userRes.data.balance || 0);
      if (userBalance < 5) {
        ToastError("Bạn không đủ xu để đẩy tin (cần 5 xu)");
        //setIsSubmitting(false);
        setShowBoostConfirm(false);
        return;
      }

      // Update post with priority
      await axios.put(
        `${API_URL}/api/posts/${id}`,
        {
          data: {
            priority: 1,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Deduct user balance
      await axios.put(
        `${API_URL}/api/users/${currentUser.id}`,
        {
          balance: userBalance - 5,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = {
        type: "push_post",
        amount: 5,
        description: `Đẩy tin ${id}`,
        user: currentUser.id,
      };
      await axios.post(
        `${API_URL}/api/transactions`,
        {
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPriority(1);
      ToastSuccess("Đẩy tin thành công!");
    } catch (error) {
      console.error("Error boosting post:", error);
      ToastError("Có lỗi xảy ra. Vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
      setShowBoostConfirm(false);
    }
  };

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
          href={`/post/${id}`}
          className="inline-flex items-center gap-2 font-bold border-2 border-black px-3 py-1 mb-6 hover:bg-black hover:text-white transition-colors"
        >
          <IoIosArrowBack />
          <span>Trở lại</span>
        </Link>

        {/* Page title */}
        <div className="border-4 border-black bg-white p-6 mb-8 transform rotate-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-black">
              CHỈNH SỬA BÀI ĐĂNG
            </h1>
            {priority === 1 && (
              <div className="bg-yellow-custom border-2 border-black px-3 py-1 transform -rotate-3 flex items-center gap-2">
                <FaStar className="text-black" />
                <span className="font-bold">TIN ƯU TIÊN</span>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="border-4 border-black bg-white p-6 transform -rotate-1">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 w-1/3"></div>
              <div className="h-40 bg-gray-200"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200"></div>
                <div className="h-12 bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200"></div>
                <div className="h-12 bg-gray-200"></div>
              </div>
              <div className="h-40 bg-gray-200"></div>
              <div className="h-12 bg-gray-200"></div>
            </div>
          </div>
        ) : (
          <div className="border-4 border-black bg-white p-6 transform -rotate-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block mb-2 text-lg font-bold uppercase"
                >
                  Tiêu đề
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform rotate-1"
                  required
                  placeholder="Nhập tiêu đề bài đăng"
                />
              </div>

              {/* Type and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="type"
                    className="block mb-2 text-lg font-bold uppercase"
                  >
                    Loại giao dịch
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform -rotate-1"
                  >
                    <option value="buy">Muốn mua</option>
                    <option value="sell">Muốn bán</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block mb-2 text-lg font-bold uppercase"
                  >
                    Giá (VND)
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform rotate-1"
                    required
                    placeholder="Nhập giá"
                    min="0"
                  />
                </div>
              </div>

              {/* Status and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="statusN"
                    className="block mb-2 text-lg font-bold uppercase"
                  >
                    Trạng thái
                  </label>
                  <select
                    id="statusN"
                    value={statusN}
                    onChange={(e) => setStatusN(e.target.value)}
                    className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform rotate-1"
                  >
                    <option value="new">Mới</option>
                    <option value="out">Hết bảo hành</option>
                    <option value="old">Đã sử dụng</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block mb-2 text-lg font-bold uppercase"
                  >
                    Danh mục
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform -rotate-1"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-lg font-bold uppercase"
                >
                  Mô tả chi tiết
                </label>
                <div className="border-4 border-black">
                  <CkEditor
                    editorData={description}
                    setEditorData={setDescription}
                    handleOnUpdate={handleOnUpdate}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="border-4 border-black p-4 bg-gray-50 transform rotate-1">
                <h3 className="text-lg font-bold mb-4 uppercase">Địa điểm</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block mb-2 font-bold">
                      Thành phố
                    </label>
                    <select
                      id="city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform -rotate-1"
                      required
                    >
                      <option value="">Chọn thành phố</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="district" className="block mb-2 font-bold">
                      Quận/Huyện
                    </label>
                    <select
                      id="district"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform rotate-1"
                      required
                      disabled={!selectedCity}
                    >
                      <option value="">
                        {selectedCity
                          ? "Chọn quận/huyện"
                          : "Chọn thành phố trước"}
                      </option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="ward" className="block mb-2 font-bold">
                      Phường/Xã
                    </label>
                    <select
                      id="ward"
                      value={selectedWard}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black transform -rotate-1"
                      required
                      disabled={!selectedDistrict}
                    >
                      <option value="">
                        {selectedDistrict
                          ? "Chọn phường/xã"
                          : "Chọn quận/huyện trước"}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="border-4 border-black p-4 bg-gray-50 transform -rotate-1">
                <label
                  htmlFor="images"
                  className="flex items-center gap-2 mb-4 text-lg font-bold uppercase"
                >
                  <FaImage size={20} />
                  <span>Hình ảnh</span>
                </label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2">Ảnh hiện tại:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((image, index) => (
                        <div
                          key={index}
                          className="border-2 border-black transform hover:rotate-1 transition-transform"
                        >
                          <img
                            src={`${STRAPI_URL_LOCAL}${image.url}`}
                            alt={`Existing ${index}`}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm mt-2 font-medium">
                      * Tải lên ảnh mới sẽ thay thế tất cả ảnh hiện tại
                    </p>
                  </div>
                )}

                {/* Upload new images */}
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-black cursor-pointer bg-white hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload size={24} className="mb-2" />
                      <p className="font-bold">Nhấp để tải lên hình ảnh mới</p>
                      <p className="text-sm text-gray-500">
                        (Có thể chọn nhiều ảnh)
                      </p>
                    </div>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="hidden"
                    />
                  </label>
                </div>

                {/* New image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-bold mb-2">Ảnh mới đã chọn:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="border-2 border-black transform hover:-rotate-1 transition-transform"
                        >
                          <img
                            src={url || "/placeholder.svg"}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-green-custom text-white font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FaEdit size={18} />
                    <span>CẬP NHẬT BÀI ĐĂNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFinishConfirm(true)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-green-500 text-white font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FaCheck size={18} />
                    <span>ĐÁNH DẤU HOÀN THÀNH</span>
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {priority === 1 ? (
                    <div className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-yellow-custom font-bold transform -rotate-1">
                      <FaStar size={18} />
                      <span>TIN ƯU TIÊN</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowBoostConfirm(true)}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-yellow-custom font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <FaStar size={18} />
                      <span>ĐẨY TIN (5 COIN)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="flex items-center justify-center gap-2 px-6 py-3 border-4 border-black bg-red-500 text-white font-bold transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FaTrash size={18} />
                    <span>XÓA BÀI ĐĂNG</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Confirmation modals */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-md transform rotate-2">
              <div className="border-b-4 border-black p-4 bg-gray-100">
                <h2 className="text-xl font-black">XÁC NHẬN XÓA</h2>
              </div>
              <div className="p-6">
                <p className="font-bold mb-6">
                  Bạn có chắc chắn muốn xóa bài đăng này? Hành động này không
                  thể hoàn tác.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border-4 border-black font-bold"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={deletePost}
                    className="px-4 py-2 border-4 border-black bg-red-500 text-white font-bold"
                  >
                    XÓA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showFinishConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-md transform -rotate-1">
              <div className="border-b-4 border-black p-4 bg-gray-100">
                <h2 className="text-xl font-black">XÁC NHẬN HOÀN THÀNH</h2>
              </div>
              <div className="p-6">
                <p className="font-bold mb-6">
                  Bạn có chắc chắn muốn đánh dấu bài đăng này là đã hoàn thành?
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowFinishConfirm(false)}
                    className="px-4 py-2 border-4 border-black font-bold"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={markAsFinished}
                    className="px-4 py-2 border-4 border-black bg-green-500 text-white font-bold"
                  >
                    HOÀN THÀNH
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBoostConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-md transform rotate-1">
              <div className="border-b-4 border-black p-4 bg-gray-100">
                <h2 className="text-xl font-black">XÁC NHẬN ĐẨY TIN</h2>
              </div>
              <div className="p-6">
                <p className="font-bold mb-6">
                  Đẩy tin sẽ tốn 5 xu. Bạn có chắc chắn muốn đẩy tin này?
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowBoostConfirm(false)}
                    className="px-4 py-2 border-4 border-black font-bold"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={boostPost}
                    className="px-4 py-2 border-4 border-black bg-yellow-custom font-bold"
                  >
                    ĐẨY TIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditPost;
