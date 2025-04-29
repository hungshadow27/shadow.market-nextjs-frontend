"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";
import { IoIosArrowBack } from "react-icons/io";
import { FaUpload, FaVideo, FaImage } from "react-icons/fa";
import { Bounce, toast, ToastContainer } from "react-toastify";

const CkEditor = dynamic(() => import("@/components/CkEditor"), { ssr: false });
const API_URL = process.env.STRAPI_URL;

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("buy");
  const [price, setPrice] = useState("");
  const [statusN, setStatusN] = useState("new");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setSelectedDistrict("");
      return;
    }
    const fetchDistricts = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/districts`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { filters: { city: { id: { $eq: selectedCity } } } },
        });
        setDistricts(res.data.data.map((d) => ({ id: d.id, name: d.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải quận/huyện");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDistricts();
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }
    const fetchWards = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/wards`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { filters: { district: { id: { $eq: selectedDistrict } } } },
        });
        setWards(res.data.data.map((w) => ({ id: w.id, name: w.name })));
      } catch (e) {
        console.error(e);
        ToastError("Không thể tải phường/xã");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWards();
  }, [selectedDistrict]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Create preview URLs
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(newImageUrls);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);

    // Create preview URL for video
    if (file) {
      setVideoPreviewUrl(URL.createObjectURL(file));
    } else {
      setVideoPreviewUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !currentUser) {
      ToastError("Bạn cần đăng nhập để tạo bài đăng");
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
      // Upload images
      let uploadedImages = [];
      if (images.length) {
        const fd = new FormData();
        images.forEach((f) => fd.append("files", f));
        try {
          const upImg = await axios.post(`${API_URL}/api/upload`, fd, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          uploadedImages = upImg.data.map((img) => ({ id: img.id }));
        } catch (e) {
          console.error(e);
          ToastError("Upload ảnh thất bại");
          setIsSubmitting(false);
          return;
        }
      }

      // Upload video
      let uploadedVideo = null;
      if (video) {
        const fdv = new FormData();
        fdv.append("files", video);
        try {
          const upVid = await axios.post(`${API_URL}/api/upload`, fdv, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          uploadedVideo = upVid.data[0].id;
        } catch (e) {
          console.error(e);
          ToastError("Upload video thất bại");
          setIsSubmitting(false);
          return;
        }
      }

      // Create post
      const postData = {
        user: currentUser.id,
        category: { disconnect: [], connect: [{ id: selectedCategory }] },
        title,
        description,
        type,
        price: price,
        statusN,
        images: uploadedImages,
        city: { disconnect: [], connect: [{ id: selectedCity }] },
        district: { disconnect: [], connect: [{ id: selectedDistrict }] },
        ward: { disconnect: [], connect: [{ id: selectedWard }] },
      };

      const postRes = await axios.post(
        `${API_URL}/api/posts`,
        { data: postData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const postId = postRes.data.data.id;

      if (uploadedVideo) {
        // Create ShortVideo entry
        await axios.post(
          `${API_URL}/api/short-videos`,
          {
            data: {
              video: uploadedVideo,
              description,
              postedBy: currentUser.id,
              relatedPost: postId,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      ToastSuccess("Bài đăng tạo thành công");
      // Reset form
      setTitle("");
      setDescription("");
      setType("buy");
      setPrice("");
      setStatusN("new");
      setSelectedCategory("");
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedWard("");
      setImages([]);
      setVideo(null);
      setImagePreviewUrls([]);
      setVideoPreviewUrl("");
    } catch (e) {
      console.error(e);
      ToastError("Tạo bài đăng thất bại");
    } finally {
      setIsSubmitting(false);
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
          href="/"
          className="inline-flex items-center gap-2 font-bold border-2 border-black px-3 py-1 mb-6 hover:bg-black hover:text-white transition-colors"
        >
          <IoIosArrowBack />
          <span>Trở lại</span>
        </Link>

        {/* Page title */}
        <div className="border-4 border-black bg-white p-6 mb-8 transform -rotate-1">
          <h1 className="text-2xl md:text-3xl font-black">TẠO BÀI ĐĂNG MỚI</h1>
        </div>

        {/* Form container */}
        <div className="border-4 border-black bg-white p-6 transform rotate-1">
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
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
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
            <div className="border-4 border-black p-4 bg-gray-50">
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
                    disabled={!selectedCity || isLoading}
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
                    disabled={!selectedDistrict || isLoading}
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

            {/* Media uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Images */}
              <div className="border-4 border-black p-4 bg-gray-50 transform -rotate-1">
                <label
                  htmlFor="images"
                  className="flex items-center gap-2 mb-4 text-lg font-bold uppercase"
                >
                  <FaImage size={20} />
                  <span>Hình ảnh</span>
                </label>

                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-black cursor-pointer bg-white hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload size={24} className="mb-2" />
                      <p className="font-bold">Nhấp để tải lên hình ảnh</p>
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

                {/* Image previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="border-2 border-black">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video */}
              <div className="border-4 border-black p-4 bg-gray-50 transform rotate-1">
                <label
                  htmlFor="video"
                  className="flex items-center gap-2 mb-4 text-lg font-bold uppercase"
                >
                  <FaVideo size={20} />
                  <span>Video Short</span>
                </label>

                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="video"
                    className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-black cursor-pointer bg-white hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload size={24} className="mb-2" />
                      <p className="font-bold">Nhấp để tải lên video</p>
                      <p className="text-sm text-gray-500">(Chỉ 1 file)</p>
                    </div>
                    <input
                      id="video"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Video preview */}
                {videoPreviewUrl && (
                  <div className="mt-4 border-2 border-black">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative inline-block px-8 py-3 font-bold text-lg uppercase border-4 border-black bg-yellow-custom transform hover:-translate-y-1 transition-transform hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
              >
                {isSubmitting ? "ĐANG XỬ LÝ..." : "TẠO BÀI ĐĂNG"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePost;
