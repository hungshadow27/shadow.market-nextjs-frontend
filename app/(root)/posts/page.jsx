"use client";
import PostCardSmall from "@/components/PostCardSmall";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CiFilter } from "react-icons/ci";
import { FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.STRAPI_URL;

export default function PostList() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    price: searchParams.get("price") || "",
    search: searchParams.get("search") || "",
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch posts with filters
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = {
        sort: ["priority:desc", "createdAt:desc"],
        "pagination[limit]": 20,
        populate: {
          user: true,
          category: true,
          images: true,
          city: true,
          district: true,
          ward: true,
        },
        "filters[statusP][$eq]": "active",
        publicationState: "live",
      };

      if (filters.category)
        params["filters[category][slug][$eq]"] = filters.category;
      if (filters.price) params["filters[price][$lte]"] = filters.price;
      if (filters.search) params["filters[title][$containsi]"] = filters.search;

      const response = await axios.get(`${API_URL}/api/posts`, {
        params,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL params on mount
  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      price: searchParams.get("price") || "",
      search: searchParams.get("search") || "",
    });
    fetchCategories();
  }, [searchParams]);

  // Fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    const url = new URL(window.location);
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
    window.history.pushState({}, "", url);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      category: "",
      price: "",
      search: "",
    });
    window.history.pushState({}, "", window.location.pathname);
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-black mb-6 relative inline-block">
            <span className="relative z-10">DANH SÁCH SẢN PHẨM</span>
            <div className="absolute bottom-0 left-0 w-full h-3 bg-yellow-custom -z-0"></div>
          </h1>

          {/* Search bar */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  name="search"
                  value={filters.search || ""}
                  onChange={handleFilterChange}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium"
                />
              </div>
              <button
                onClick={toggleMobileFilters}
                className="sm:hidden flex items-center justify-center gap-2 bg-black text-white font-bold py-3 px-4 border-4 border-black"
              >
                <LuSettings2 size={20} />
                <span>Bộ lọc</span>
                {mobileFiltersOpen ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="hidden md:block w-1/2 md:w-1/4 lg:w-1/5">
              <div className="border-4 border-black bg-white p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <CiFilter size={24} />
                    <span>BỘ LỌC</span>
                  </h2>
                  {(filters.category || filters.price) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center text-sm font-bold hover:underline"
                    >
                      <FiX size={16} />
                      <span>Xóa lọc</span>
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="category"
                      className="block mb-2 text-sm font-bold uppercase"
                    >
                      Danh mục
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full p-2 border-4 border-black focus:ring-0 focus:border-black bg-white"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.attributes?.slug || cat.slug}
                        >
                          {cat.attributes?.name || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block mb-2 text-sm font-bold uppercase"
                    >
                      Giá tối đa
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={filters.price || ""}
                      onChange={handleFilterChange}
                      placeholder="Giá tối đa (VND)"
                      className="w-full p-2 border-4 border-black focus:ring-0 focus:border-black bg-white placeholder-gray-500"
                    />
                  </div>

                  <button
                    onClick={fetchPosts}
                    className="w-full bg-yellow-custom text-black font-bold py-2 px-4 border-4 border-black transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    ÁP DỤNG
                  </button>
                </div>
              </div>
            </div>

            {/* Filters - Mobile */}
            {mobileFiltersOpen && (
              <div className="md:hidden w-full border-4 border-black bg-white p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black flex items-center gap-2">
                    <CiFilter size={24} />
                    <span>BỘ LỌC</span>
                  </h2>
                  {(filters.category || filters.price) && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center text-sm font-bold hover:underline"
                    >
                      <FiX size={16} />
                      <span>Xóa lọc</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="mobile-category"
                      className="block mb-2 text-sm font-bold uppercase"
                    >
                      Danh mục
                    </label>
                    <select
                      id="mobile-category"
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full p-2 border-4 border-black focus:ring-0 focus:border-black bg-white"
                    >
                      <option value="">Tất cả danh mục</option>
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.attributes?.slug || cat.slug}
                        >
                          {cat.attributes?.name || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="mobile-price"
                      className="block mb-2 text-sm font-bold uppercase"
                    >
                      Giá tối đa
                    </label>
                    <input
                      type="number"
                      id="mobile-price"
                      name="price"
                      value={filters.price || ""}
                      onChange={handleFilterChange}
                      placeholder="Giá tối đa (VND)"
                      className="w-full p-2 border-4 border-black focus:ring-0 focus:border-black bg-white placeholder-gray-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        fetchPosts();
                        setMobileFiltersOpen(false);
                      }}
                      className="flex-1 bg-yellow-custom text-black font-bold py-2 px-4 border-4 border-black"
                    >
                      ÁP DỤNG
                    </button>
                    <button
                      onClick={toggleMobileFilters}
                      className="bg-white text-black font-bold py-2 px-4 border-4 border-black"
                    >
                      ĐÓNG
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={index}
                      className="border-4 border-black bg-gray-100 h-80 animate-pulse flex items-center justify-center"
                    >
                      <div className="w-16 h-16 border-4 border-black rounded-full bg-gray-200"></div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {posts.map((post) => (
                    <PostCardSmall key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="border-4 border-black bg-white p-8 text-center">
                  <p className="text-xl font-bold mb-4">
                    Không tìm thấy bài viết nào.
                  </p>
                  <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-4 bg-yellow-custom text-black font-bold py-2 px-4 border-4 border-black transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    XÓA BỘ LỌC
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
