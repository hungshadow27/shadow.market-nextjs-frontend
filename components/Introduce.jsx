const Introduce = () => {
  return (
    <div className="border-4 border-black bg-white p-6 md:p-8 relative transform rotate-1 md:rotate-0">
      <div className="absolute -top-6 -left-6 transform -rotate-6 bg-black text-white py-2 px-4 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
        <h2 className="text-xl font-black tracking-wider">GIỚI THIỆU</h2>
      </div>

      <div className="mt-6">
        <h1 className="text-2xl md:text-3xl font-black mb-4 transform -rotate-1">
          Giới thiệu ShadowMarket
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-l-4 border-black pl-4">
            <p className="font-medium">
              ShadowMarket là nền tảng mua bán rao vặt trực tuyến hiện đại, nơi
              kết nối người mua và người bán một cách nhanh chóng, tiện lợi. Với
              giao diện thân thiện và tính năng đa dạng, ShadowMarket cho phép
              bạn dễ dàng đăng tin rao bán, tìm kiếm sản phẩm từ đồ gia dụng,
              điện tử, thời trang đến bất động sản và dịch vụ.
            </p>
          </div>

          <div className="border-l-4 border-black pl-4">
            <p className="font-medium">
              Chúng tôi cam kết mang đến trải nghiệm an toàn, minh bạch và hiệu
              quả, giúp bạn giao dịch thành công trong từng cú nhấp chuột. Hãy
              tham gia ShadowMarket ngay hôm nay để khám phá cơ hội mua sắm và
              kinh doanh không giới hạn!
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#list-category"
            className="inline-block bg-white text-black text-center text-lg font-bold px-6 py-3 border-4 border-black transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Khám phá danh mục
          </a>

          <a
            href="/register"
            className="inline-block bg-primary text-white text-center text-lg font-bold px-6 py-3 border-4 border-black transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Đăng ký ngay
          </a>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-5 transform rotate-12">
        <div className="bg-yellow-custom text-black py-1 px-3 border-2 border-black font-bold text-sm">
          Since 2025
        </div>
      </div>
    </div>
  );
};

export default Introduce;
