"use client";
import { useEffect, useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Bounce, toast, ToastContainer } from "react-toastify";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateForm = () => {
    let isValid = true;

    // Reset errors
    setPasswordError("");
    setUsernameError("");
    setEmailError("");

    // Username validation
    if (username.length < 3) {
      setUsernameError("Username phải có ít nhất 3 ký tự");
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      isValid = false;
    }

    // Password validation
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const registerPromise = new Promise(async (resolve, reject) => {
        try {
          await new Promise((r) => setTimeout(r, 1000)); // 500ms delay
          const data = await registerUser({ username, email, password });
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });

      toast.promise(registerPromise, {
        pending: "Đang đăng ký...",
        success: "Đăng ký thành công 👌",
        error: "Đăng ký thất bại 🤯",
      });

      const data = await registerPromise;
      if (data) {
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
      className="w-full min-h-screen pt-24 md:pt-28 px-4 relative"
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
      <div className="max-w-[550px] mx-auto border-4 border-black bg-white bg-opacity-90 backdrop-blur-sm transform -rotate-1 md:-rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <div className="absolute -top-6 -right-6 md:-top-8 md:-right-8 bg-black text-white py-2 px-4 transform rotate-3 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)]">
          <h1 className="text-xl md:text-2xl font-black tracking-wider">
            ĐĂNG KÝ
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="transform rotate-1">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-bold uppercase"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className={`w-full p-3 border-4 ${
                  usernameError ? "border-red-500" : "border-black"
                } focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium`}
                placeholder="Nhập username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              {usernameError && (
                <p className="mt-1 text-red-500 font-bold text-sm transform -rotate-1">
                  {usernameError}
                </p>
              )}
            </div>

            <div className="transform -rotate-1">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-bold uppercase"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full p-3 border-4 ${
                  emailError ? "border-red-500" : "border-black"
                } focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium`}
                placeholder="Nhập email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="mt-1 text-red-500 font-bold text-sm transform rotate-1">
                  {emailError}
                </p>
              )}
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
                className={`w-full p-3 border-4 ${
                  passwordError ? "border-red-500" : "border-black"
                } focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium`}
                placeholder="******"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="transform -rotate-1">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-bold uppercase"
              >
                Xác nhận Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={`w-full p-3 border-4 ${
                  passwordError ? "border-red-500" : "border-black"
                } focus:ring-0 focus:border-black bg-white placeholder-gray-500 font-medium`}
                placeholder="******"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {passwordError && (
                <p className="mt-1 text-red-500 font-bold text-sm transform rotate-1">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`relative inline-block px-8 py-3 font-bold text-lg uppercase border-4 border-black bg-primary text-white transform hover:-translate-x-1 hover:-translate-y-1 transition-transform ${
                  loading
                    ? "opacity-70"
                    : "hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 border-t-4 border-black">
            <div className="font-bold text-center">
              <span>Bạn đã có tài khoản? </span>
              <Link
                href="/login"
                className="text-primary underline decoration-4 decoration-primary hover:text-black transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 transform -rotate-12">
            <div className="bg-yellow-custom text-black py-1 px-3 border-2 border-black font-bold text-sm">
              Join Now!
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center mb-8">
        <Link
          href="/"
          className="inline-block border-2 border-black bg-white px-4 py-2 font-bold transform rotate-2 hover:rotate-0 transition-transform"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </main>
  );
}
