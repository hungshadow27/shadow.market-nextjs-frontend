"use client";
import { useEffect, useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bounce, ToastContainer, toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loginPromise = new Promise(async (resolve, reject) => {
        try {
          await new Promise((r) => setTimeout(r, 1000)); // 500ms delay
          const data = await loginUser({ identifier, password });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      toast.promise(loginPromise, {
        pending: "Đang đăng nhập...",
        success: "Đăng nhập thành công 👌",
        error: "Đăng nhập thất bại 🤯",
      });

      const data = await loginPromise;
      if (data) {
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  return (
    <main
      className="w-full min-h-screen pt-24 md:pt-32 px-4 relative"
      style={{
        backgroundImage: `url("${origin}/images/login-bg.jpg")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
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
      <div className="max-w-[500px] mx-auto border-4 border-black bg-white bg-opacity-90 backdrop-blur-sm transform rotate-1 md:rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="absolute -top-6 -left-6 md:-top-8 md:-left-8 bg-black text-white py-2 px-4 transform -rotate-3 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
          <h1 className="text-xl md:text-2xl font-black tracking-wider">
            ĐĂNG NHẬP
          </h1>
        </div>

        <div className="p-6 md:p-8 mt-6">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="with-black-stroke text-4xl font-black text-primary">
                S
              </span>
              <span className="text-lg font-bold">shadow.market</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="transform -rotate-1">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-bold uppercase"
              >
                Username/Email
              </label>
              <input
                type="text"
                id="username"
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium"
                placeholder="Nhập username hoặc email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="transform rotate-1">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-bold uppercase"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium"
                placeholder="******"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className={`relative inline-block px-8 py-3 font-bold text-lg uppercase border-4 border-black bg-primary text-white transform hover:-translate-x-1 hover:-translate-y-1 transition-transform ${
                  isLoading
                    ? "opacity-70"
                    : "hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    Đang xử lý...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 border-t-4 border-black">
            <div className="font-bold text-center">
              <span>Bạn chưa có tài khoản? </span>
              <Link
                href="/register"
                className="text-primary underline decoration-4 decoration-primary hover:text-black transition-colors"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-5 -right-5 transform rotate-12">
            <div className="bg-yellow-custom text-black py-1 px-3 border-2 border-black font-bold text-sm">
              Secure Login
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block border-2 border-black bg-white px-4 py-2 font-bold transform -rotate-2 hover:rotate-0 transition-transform"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </main>
  );
}
