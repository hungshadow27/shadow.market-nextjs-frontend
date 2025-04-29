"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Banner from "@/components/Banner";
import CategoryCard from "@/components/CategoryCard";
import Introduce from "@/components/Introduce";
import PostCard from "@/components/PostCard";

const API_URL = process.env.STRAPI_URL;

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [latestPosts, setLatestPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`, {
        params: {
          "filters[parent][id][$null]": true,
          populate: "image",
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchLatestPosts = async (page = 1, pageSize = 6) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/posts`, {
        params: {
          sort: "createdAt:desc",
          "pagination[page]": page,
          "pagination[pageSize]": pageSize,
          populate: {
            user: { populate: ["avatar"] },
            category: true,
            images: true,
            city: true,
          },
          "filters[statusP][$eq]": "active",
          publicationState: "live",
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });

      const newPosts = res.data.data;
      const totalPosts = res.data.meta.pagination.total;
      const currentLength = latestPosts.length + newPosts.length;

      setLatestPosts((prev) => [...prev, ...newPosts]);
      setHasMore(currentLength < totalPosts);
    } catch (err) {
      console.error("Error fetching latest posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchLatestPosts();
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchLatestPosts(nextPage);
    setPage(nextPage);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16">
        {/* Banner Section */}
        <div className="mt-8 md:mt-12">
          <Banner />
        </div>

        {/* Categories Section */}
        <div className="mt-16 md:mt-24" id="list-category">
          <div className="relative mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-center uppercase relative z-10">
              Danh mục sản phẩm
            </h2>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-yellow-custom -z-0"></div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="transform hover:-rotate-2 transition-transform"
              >
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>

        {/* Latest Posts Section */}
        <div className="mt-16 md:mt-24">
          <div className="relative mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-center uppercase relative z-10">
              Tin đăng mới nhất
            </h2>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-yellow-custom -z-0"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {latestPosts.map((post, index) => (
              <PostCard post={post} key={index} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="relative px-8 py-3 font-bold text-lg uppercase border-4 border-black bg-yellow-custom transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tải...
                  </span>
                ) : (
                  "Tải thêm"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Introduction Section */}
        <div className="mt-16 md:mt-24 mb-16" id="intro">
          <Introduce />
        </div>
      </main>
    </div>
  );
}
