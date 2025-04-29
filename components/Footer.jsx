import Link from "next/link";
import { FaInstagramSquare, FaFacebookSquare, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-black mt-16 relative">
      {/* Decorative elements */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black h-16 w-1 md:w-2"></div>
      <div className="absolute -top-6 left-[calc(50%-40px)] transform rotate-12 bg-yellow-custom border-2 border-black px-3 py-1">
        <span className="font-bold text-sm">FOOTER</span>
      </div>
      <div className="absolute -top-6 left-[calc(50%+20px)] transform -rotate-6 bg-white border-2 border-black px-3 py-1">
        <span className="font-bold text-sm">2025</span>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-4">
          {/* Logo section */}
          <div className="w-full md:w-1/3 border-4 border-black p-4 transform rotate-1 bg-white">
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="with-black-stroke text-4xl md:text-5xl font-black text-primary">
                  S
                </span>
                <span className="text-lg font-bold">shadow.market</span>
              </Link>
              <p className="font-medium text-sm md:text-base">
                Nền tảng mua bán, rao vặt trực tuyến hàng đầu Việt Nam. Chúng
                tôi kết nối người mua và người bán lại với nhau một cách nhanh
                chóng và hiệu quả.
              </p>
              <div className="mt-2">
                <p className="font-bold">Liên hệ:</p>
                <p className="font-medium">support@shadow.market</p>
              </div>
            </div>
          </div>

          {/* Categories section */}
          <div className="w-full md:w-1/3 border-4 border-black p-4 transform -rotate-1 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h2 className="text-lg font-bold uppercase border-b-4 border-black pb-1 mb-3">
                  Danh mục
                </h2>
                <ul className="space-y-2">
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Đồ điện tử
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Thú cưng
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Thời trang
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b-4 border-black pb-1 mb-3">
                  Hỗ trợ
                </h2>
                <ul className="space-y-2">
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Trung tâm trợ giúp
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      An toàn mua bán
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Quy định
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b-4 border-black pb-1 mb-3">
                  Về chúng tôi
                </h2>
                <ul className="space-y-2">
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Giới thiệu
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Tuyển dụng
                    </Link>
                  </li>
                  <li className="transform hover:translate-x-1 transition-transform">
                    <Link href="/" className="font-medium hover:font-bold">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Social and newsletter section */}
          <div className="w-full md:w-1/3 border-4 border-black p-4 transform rotate-1 bg-white">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-bold uppercase border-b-4 border-black pb-1 mb-3">
                  Theo dõi chúng tôi
                </h2>
                <ul className="flex items-center gap-4 mt-4">
                  <li>
                    <a
                      href="/"
                      className="block border-2 border-black p-2 transform hover:rotate-6 transition-transform"
                    >
                      <FaInstagramSquare size={25} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="/"
                      className="block border-2 border-black p-2 transform hover:-rotate-6 transition-transform"
                    >
                      <FaFacebookSquare size={25} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="/"
                      className="block border-2 border-black p-2 transform hover:rotate-6 transition-transform"
                    >
                      <FaYoutube size={25} />
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold uppercase border-b-4 border-black pb-1 mb-3">
                  Đăng ký nhận tin
                </h2>
                <div className="mt-2">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Email của bạn"
                      className="flex-1 border-4 border-black p-2 focus:ring-0 focus:border-black"
                    />
                    <button className="bg-black text-white font-bold px-4 py-2 border-4 border-black transform hover:-translate-y-1 transition-transform">
                      GỬI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="mt-8 pt-4 border-t-4 border-black">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-bold text-center md:text-left">
              © {new Date().getFullYear()} Shadow Market. Tất cả các quyền được
              bảo lưu.
            </p>
            <div className="flex gap-4 font-medium">
              <Link
                href="/"
                className="hover:underline decoration-2 underline-offset-4"
              >
                Điều khoản sử dụng
              </Link>
              <Link
                href="/"
                className="hover:underline decoration-2 underline-offset-4"
              >
                Chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
