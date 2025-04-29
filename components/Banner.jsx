import Link from "next/link";

const Banner = () => {
  return (
    <div className="relative overflow-hidden border-4 border-black bg-white">
      {/* Decorative elements */}
      <div className="absolute top-4 left-4 transform -rotate-12 bg-yellow-custom border-2 border-black px-3 py-1 z-10">
        <span className="font-bold text-sm">HOT</span>
      </div>

      <div className="absolute bottom-4 right-4 transform rotate-6 bg-white border-2 border-black px-3 py-1 z-10">
        <span className="font-bold text-sm">NEW</span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Left content */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          <span className="text-sm md:text-base font-bold uppercase transform -skew-x-6 inline-block ms-14">
            Chào mừng bạn đến với
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black my-4 md:my-6 leading-tight">
            <span className="with-black-stroke text-primary block transform -rotate-1">
              SHADOW
            </span>
            <span className="with-black-stroke text-primary block transform rotate-1">
              .MARKET
            </span>
            <span className="text-2xl md:text-3xl font-bold block mt-2 transform -rotate-1">
              DEVNET
            </span>
          </h1>

          <span className="text-sm md:text-base font-medium mb-6">
            Pham Viet Hung - CNTT2 - K22
          </span>

          <Link
            href="/posts"
            className="inline-block bg-yellow-custom text-lg font-bold px-7 py-3 border-4 border-black transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Mua bán ngay
          </Link>
        </div>

        {/* Right content */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-0 bg-gradient-to-br from-gray-100 to-white border-t-4 md:border-t-0 md:border-l-4 border-black">
          <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <img
              src="/images/ninja.png"
              alt="banner"
              className="w-64 md:w-80 lg:w-96"
            />
          </div>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-black"></div>
    </div>
  );
};

export default Banner;
