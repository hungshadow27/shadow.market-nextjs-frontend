"use client";
import Link from "next/link";
import { useState } from "react";

const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const CategoryCard = ({ category }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Link
      href={`/posts?category=${category.slug}`}
      className="block w-full h-full border-4 border-black bg-white transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
    >
      <div className="flex flex-col items-center p-2">
        <div className="w-16 h-16 relative mb-2">
          {/* Skeleton placeholder while image is loading */}
          {!isImageLoaded && (
            <div className="w-full h-full bg-gray-200 border-2 border-black animate-pulse flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-300"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
              </svg>
            </div>
          )}
          {/* Actual image */}
          <img
            src={`${STRAPI_URL_LOCAL}${category.image.url}`}
            alt={category.name}
            className={`w-16 h-16 border-2 border-black object-cover ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)} // Handle broken images
          />
        </div>
        <div className="font-bold text-center px-1 text-sm">
          {category.name}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
