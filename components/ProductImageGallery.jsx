"use client";
import { useState, useRef } from "react";
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const ProductImageGallery = ({ images }) => {
  const [mainImage, setMainImage] = useState(images[0].url);
  const [isZoomed, setIsZoomed] = useState(false);
  const mainImageContainerRef = useRef(null);
  const mainImageRef = useRef(null);

  // Handle thumbnail click
  const handleThumbnailClick = (imageSrc) => {
    setMainImage(imageSrc);
  };

  // Handle zoom effect
  const handleMouseMove = (e) => {
    if (!isZoomed) return;

    const rect = mainImageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    mainImageRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    mainImageRef.current.style.transform = "scale(2)";
  };

  // Toggle zoom when clicked
  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
    if (isZoomed) {
      mainImageRef.current.style.transformOrigin = "center center";
      mainImageRef.current.style.transform = "scale(1)";
    }
  };

  // Reset zoom when mouse leaves
  const handleMouseLeave = () => {
    if (isZoomed) {
      mainImageRef.current.style.transformOrigin = "center center";
      mainImageRef.current.style.transform = "scale(1)";
      setIsZoomed(false);
    }
  };

  return (
    <div className="product-image-gallery">
      <div
        className="main-image-container relative cursor-zoom-in"
        ref={mainImageContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
        style={{ overflow: "hidden" }}
      >
        <img
          ref={mainImageRef}
          src={`${STRAPI_URL_LOCAL}${mainImage}`}
          alt="Main product"
          className="w-full h-[500px] object-cover"
          style={{ transition: "transform 0.1s ease" }}
        />
        {isZoomed && (
          <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 font-bold">
            Click to exit zoom
          </div>
        )}
      </div>

      <div className="thumbnail-container flex gap-2 mt-4 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`border-4 ${
              mainImage === image.url ? "border-yellow-custom" : "border-black"
            } transform hover:-rotate-2 transition-transform cursor-pointer`}
          >
            <img
              src={`${STRAPI_URL_LOCAL}${image.url}`}
              alt={`Thumbnail ${index + 1}`}
              className="w-20 h-20 object-cover"
              onClick={() => handleThumbnailClick(image.url)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
