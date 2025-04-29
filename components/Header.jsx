"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { FaRegBell } from "react-icons/fa";
import { MdOutlineChat } from "react-icons/md";
import { RiMenu3Line, RiCloseLine } from "react-icons/ri";
import NotiBoard from "./NotiBoard";
import axios from "axios";
const API_URL = process.env.STRAPI_URL;

const Header = () => {
  const [search, setSearch] = useState("");
  const [showNotiBoard, setShowNotiBoard] = useState(false);
  const [noties, setNoties] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchNoties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/notifications`, {
          params: {
            populate: {
              user1: true,
              user2: true,
              post: true,
            },
            "filters[user2][id][$eq]": user?.id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return res.data.data;
      } catch (error) {
        console.error("Error fetching notifications:", error);
        return null;
      }
    };

    if (user) {
      fetchNoties().then((data) => {
        if (data) setNoties(data);
      });
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && search.trim()) {
      window.location.href = `/posts?search=${encodeURIComponent(search)}`;
      setSearchOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (searchOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleCloseNotiBoard = () => {
      setShowNotiBoard(false);
    };

    document.addEventListener("closeNotiBoard", handleCloseNotiBoard);
    return () => {
      document.removeEventListener("closeNotiBoard", handleCloseNotiBoard);
    };
  }, []);

  return (
    <>
      <header className="w-full fixed top-0 z-40 bg-opacity-20 backdrop-blur-sm border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between py-3">
            <div className="flex items-center gap-8 font-semibold">
              <Link href="/" className="flex items-center gap-2">
                <span className="with-black-stroke text-5xl font-black text-primary">
                  S
                </span>
                <span className="text-lg font-bold">shadow.market</span>
              </Link>
              <Link
                href="/#list-category"
                className="hover:underline hover:text-primary transition-colors"
              >
                Danh mục
              </Link>
              <Link
                href="/shorts"
                className="hover:underline hover:text-primary transition-colors"
              >
                Shorts
              </Link>
              <Link
                href="/#intro"
                className="hover:underline hover:text-primary transition-colors"
              >
                Giới thiệu
              </Link>
            </div>
            <div className="flex items-center font-semibold gap-6">
              <div className="flex items-center bg-white px-2 border-4 border-gray-800 transform rotate-1 hover:rotate-0 transition-transform">
                <CiSearch size={24} className="bg-white" color="#000000" />
                <input
                  type="text"
                  className="border-0 border-transparent focus:border-transparent focus:ring-0 w-40 lg:w-60"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              {user ? (
                <>
                  <button
                    className="cursor-pointer relative transform hover:scale-110 transition-transform noti-bell-button"
                    onClick={() => setShowNotiBoard(!showNotiBoard)}
                  >
                    <FaRegBell size={25} />
                    {noties.length > 0 && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-500"></span>
                    )}
                  </button>
                  <Link
                    href="/chat"
                    className="transform hover:scale-110 transition-transform"
                  >
                    <MdOutlineChat size={25} color="#282826" />
                  </Link>
                  <Link
                    href="/create"
                    className="border-4 border-black px-4 py-1 font-bold hover:bg-black hover:text-white transition-colors transform rotate-1 hover:rotate-0"
                  >
                    Tạo
                  </Link>
                  <Link
                    href="/balance"
                    className="flex items-center justify-center gap-1 border-4 border-yellow-custom px-4 py-1 transform -rotate-1 hover:rotate-0 transition-transform"
                  >
                    <img src="/images/coin.png" alt="coin" className="w-5" />
                    <span className="font-bold">Coin</span>
                  </Link>
                  <Link
                    href={`/profile/${user.documentId}`}
                    className="font-bold underline decoration-4 decoration-primary"
                  >
                    {user.username}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="border-4 border-black px-4 py-1 font-bold hover:bg-black hover:text-white transition-colors transform rotate-1 hover:rotate-0"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="border-4 border-primary bg-primary text-white px-4 py-1 font-bold hover:bg-white hover:text-primary transition-colors transform -rotate-1 hover:rotate-0"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between py-3">
            <Link href="/" className="flex items-center gap-1 z-50">
              <span className="with-black-stroke text-3xl font-black text-primary">
                S
              </span>
              <span className="text-sm font-bold">shadow.market</span>
            </Link>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleSearch}
                className="p-2 border-2 border-black transform rotate-3 hover:rotate-0 transition-transform"
              >
                <CiSearch size={24} color="#000000" />
              </button>

              {user && (
                <>
                  <button
                    className="cursor-pointer relative p-2 border-2 border-black transform -rotate-2 hover:rotate-0 transition-transform noti-bell-button"
                    onClick={() => setShowNotiBoard(!showNotiBoard)}
                  >
                    <FaRegBell size={20} />
                    {noties.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
                    )}
                  </button>
                </>
              )}

              <button
                onClick={toggleMobileMenu}
                className="p-2 border-2 border-black transform rotate-1 hover:rotate-0 transition-transform z-50"
              >
                {mobileMenuOpen ? (
                  <RiCloseLine size={24} />
                ) : (
                  <RiMenu3Line size={24} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="md:hidden py-2 px-1 bg-white border-4 border-black absolute left-0 right-0 mx-4 z-40 transform -rotate-1">
              <div className="flex items-center">
                <CiSearch size={24} className="ml-2" color="#000000" />
                <input
                  type="text"
                  className="border-0 border-transparent focus:border-transparent focus:ring-0 w-full"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="p-2">
                  <RiCloseLine size={24} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-6 border-b-4 border-black">
              <div className="flex flex-col gap-6 font-bold text-xl bg-white border-2 p-3">
                <Link
                  href="/#list-category"
                  className="border-b-4 border-black pb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Danh mục
                </Link>
                <Link
                  href="/shorts"
                  className="border-b-4 border-black pb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shorts
                </Link>
                <Link
                  href="/#intro"
                  className="border-b-4 border-black pb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giới thiệu
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/create"
                      className="border-4 border-black px-4 py-2 text-center font-bold hover:bg-black hover:text-white transition-colors transform rotate-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Tạo
                    </Link>
                    <Link
                      href="/balance"
                      className="flex items-center justify-center gap-2 border-4 border-yellow-custom bg-yellow-50 px-4 py-2 transform -rotate-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <img src="/images/coin.png" alt="coin" className="w-5" />
                      <span className="font-bold">Coin</span>
                    </Link>
                    <Link
                      href={`/profile/${user.documentId}`}
                      className="border-4 border-primary px-4 py-2 text-center font-bold transform rotate-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {user.username}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="border-4 border-red-500 px-4 py-2 text-center font-bold text-red-500 transform -rotate-1"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="border-4 border-black px-4 py-2 text-center font-bold hover:bg-black hover:text-white transition-colors transform rotate-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="border-4 border-primary bg-primary text-white px-4 py-2 text-center font-bold hover:bg-white hover:text-primary transition-colors transform -rotate-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      {showNotiBoard && <NotiBoard noties={noties} />}
      {/* Add spacing to prevent content from being hidden under the fixed header */}
      <div className="h-16 md:h-20"></div>
    </>
  );
};

export default Header;
