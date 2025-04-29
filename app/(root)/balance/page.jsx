"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IoIosClose } from "react-icons/io";

const API_URL = process.env.STRAPI_URL;

const BalancePage = () => {
  const [user, setUser] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 5;

  const VIP_PACKAGES = [
    { label: "7 ngày", days: 7, price: 20 },
    { label: "1 tháng", days: 30, price: 70 },
    { label: "1 năm", days: 365, price: 800 },
  ];

  // Fetch user data
  const fetchUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return null;
      }
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          "filters[documentId][$eq]": id,
        },
      });
      return response.data[0];
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  // Fetch transaction history
  const fetchTransactions = async (userId, pageNum = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          "filters[user][id][$eq]": userId,
          sort: "createdAt:desc",
          "pagination[page]": pageNum,
          "pagination[pageSize]": pageSize,
        },
      });
      setTransactions(res.data.data);
      setTotalPages(res.data.meta.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new transaction
  const createTransaction = async (data) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/api/transactions`,
      {
        data,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    fetchTransactions(user.id);
  };

  // Load user data and transactions on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    const loadUserData = async () => {
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const userData = await fetchUser(parsedUser.documentId);
        setUser(userData);
        fetchTransactions(userData.id, page);
      }
    };

    loadUserData();
  }, [page]);

  // Handle recharge confirmation
  const handleRechargeConfirm = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        { balance: Number(user.balance) + Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const userData = await fetchUser(user?.documentId);
        setUser(userData);
        setShowRechargeModal(false);
        setAmount("");

        await createTransaction({
          type: "recharge",
          amount: Number(amount),
          description: `Nạp ${amount} coin`,
          user: user.id,
        });
      }
    } catch (error) {
      console.error("Error updating user balance:", error);
    }
  };

  // Handle VIP package selection
  const handleSelectVip = async (days, price) => {
    if (user?.balance < price) {
      alert("Không đủ số dư để mua gói này.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const currentExpire = new Date(user.vipExpireAt || new Date());
      const newExpire = new Date(
        currentExpire.setDate(currentExpire.getDate() + days)
      );

      const response = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        {
          balance: user.balance - price,
          vipExpireAt: newExpire.toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const userData = await fetchUser(user.documentId);
        setUser(userData);
        setShowVipModal(false);

        await createTransaction({
          type: "buy_vip",
          amount: price,
          description: `Mua gói VIP ${days} ngày`,
          user: user.id,
        });
      }
    } catch (error) {
      console.error("Error buying VIP:", error);
    }
  };

  // Get transaction type icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case "recharge":
        return "/images/deposite.png";
      case "buy_vip":
        return "/images/vip.webp";
      case "push_post":
        return "/images/push.png";
      default:
        return "/images/coin.png";
    }
  };

  // Get transaction type color
  const getTransactionColor = (type) => {
    switch (type) {
      case "recharge":
        return "text-green-600";
      case "buy_vip":
        return "text-yellow-custom";
      case "push_post":
        return "text-blue-600";
      default:
        return "text-black";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-black mb-6 relative inline-block">
            <span className="relative z-10">QUẢN LÝ TÀI KHOẢN</span>
            <div className="absolute bottom-0 left-0 w-full h-3 bg-yellow-custom -z-0"></div>
          </h1>

          {/* Balance Card */}
          <div className="border-4 border-black bg-white p-6 mb-8 transform rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-black uppercase mb-2">
                  Thông tin tài khoản
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Tài khoản:</span>
                    <span className="font-medium">
                      {user?.username || "Đang tải..."}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">Trạng thái VIP:</span>
                    {user?.vipExpireAt &&
                    new Date(user.vipExpireAt) > new Date() ? (
                      <span className="bg-yellow-custom border-2 border-black px-2 py-0.5 font-bold transform -rotate-2">
                        VIP đến{" "}
                        {new Date(user.vipExpireAt).toLocaleDateString("vi-VN")}
                      </span>
                    ) : (
                      <span className="bg-gray-200 border-2 border-black px-2 py-0.5 font-medium transform rotate-1">
                        Chưa kích hoạt
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-yellow-50 border-4 border-yellow-custom p-3 transform -rotate-2">
                <span className="font-bold text-lg">Số dư:</span>
                <div className="flex items-center gap-2">
                  <img src="/images/coin.png" alt="coin" className="w-6 h-6" />
                  <span className="text-2xl font-black">
                    {user?.balance || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2 transform -rotate-1 inline-block">
              CHỨC NĂNG
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <button
                onClick={() => setShowRechargeModal(true)}
                className="border-4 border-black bg-white p-4 flex flex-col items-center gap-3 transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-16 h-16 flex items-center justify-center border-4 border-black bg-green-100 transform rotate-3">
                  <img
                    src="/images/deposite.png"
                    alt="Nạp tiền"
                    className="w-10 h-10"
                  />
                </div>
                <span className="font-bold text-center">Nạp Coin</span>
              </button>

              <button
                onClick={() => setShowVipModal(true)}
                className="border-4 border-black bg-white p-4 flex flex-col items-center gap-3 transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-16 h-16 flex items-center justify-center border-4 border-black bg-yellow-50 transform -rotate-3">
                  <img
                    src="/images/vip.webp"
                    alt="Mua VIP"
                    className="w-10 h-10"
                  />
                </div>
                <span className="font-bold text-center">Mua VIP</span>
              </button>

              <Link
                href={`/profile/${user?.documentId}`}
                className="border-4 border-black bg-white p-4 flex flex-col items-center gap-3 transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-16 h-16 flex items-center justify-center border-4 border-black bg-blue-50 transform rotate-2">
                  <img
                    src="/images/push.png"
                    alt="Đẩy tin"
                    className="w-10 h-10"
                  />
                </div>
                <span className="font-bold text-center">Đẩy Tin</span>
              </Link>

              <Link
                href={`/profile/${user?.documentId}`}
                className="border-4 border-black bg-white p-4 flex flex-col items-center gap-3 transform hover:-translate-y-1 transition-transform hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="w-16 h-16 flex items-center justify-center border-4 border-black bg-gray-100 transform -rotate-2">
                  <img
                    src="/images/avatar-default.png"
                    alt="Hồ sơ"
                    className="w-10 h-10"
                  />
                </div>
                <span className="font-bold text-center">Hồ Sơ</span>
              </Link>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2 transform rotate-1 inline-block">
              LỊCH SỬ GIAO DỊCH
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="border-4 border-black bg-gray-100 p-4 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="border-4 border-black bg-white p-8 text-center transform -rotate-1">
                <div className="mb-4">
                  <img
                    src="/images/empty-box.png"
                    alt="Empty"
                    className="w-16 h-16 mx-auto"
                  />
                </div>
                <p className="text-xl font-bold mb-2">Không có giao dịch nào</p>
                <p className="text-gray-600">
                  Các giao dịch của bạn sẽ được hiển thị tại đây khi bạn nạp
                  coin hoặc sử dụng dịch vụ.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="border-4 border-black bg-white p-4 transform hover:-rotate-1 transition-transform"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex-shrink-0 border-2 border-black flex items-center justify-center bg-gray-100">
                        <img
                          src={
                            getTransactionIcon(tx.type) || "/placeholder.svg"
                          }
                          alt={tx.type}
                          className="w-8 h-8"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                          <h3 className="font-bold">{tx.description}</h3>
                          <span className="text-sm text-gray-500">
                            {formatDate(tx.createdAt)}
                          </span>
                        </div>

                        <div
                          className={`font-bold mt-1 ${getTransactionColor(
                            tx.type
                          )}`}
                        >
                          {tx.type === "recharge" ? "+" : "-"} {tx.amount} coin
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      className={`border-4 border-black px-4 py-2 font-bold ${
                        page === 1
                          ? "bg-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white hover:bg-black hover:text-white transition-colors"
                      }`}
                    >
                      Trước
                    </button>

                    <div className="font-bold">
                      Trang {page} / {totalPages}
                    </div>

                    <button
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className={`border-4 border-black px-4 py-2 font-bold ${
                        page === totalPages
                          ? "bg-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white hover:bg-black hover:text-white transition-colors"
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Recharge Modal */}
      {showRechargeModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-md transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black">NẠP COIN</h2>
                <button
                  onClick={() => setShowRechargeModal(false)}
                  className="p-1 hover:bg-gray-200"
                >
                  <IoIosClose size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label
                    htmlFor="amount"
                    className="block font-bold mb-2 uppercase"
                  >
                    Số coin muốn nạp:
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className="w-full p-3 border-4 border-black focus:ring-0 focus:border-black"
                    placeholder="VD: 100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <h3 className="font-bold mb-2 uppercase">Gói nạp nhanh:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 200].map((value) => (
                      <button
                        key={value}
                        onClick={() => setAmount(value.toString())}
                        className="border-4 border-black py-2 font-bold hover:bg-yellow-custom transition-colors"
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRechargeModal(false)}
                    className="px-4 py-2 border-4 border-black font-bold hover:bg-gray-100"
                  >
                    HỦY
                  </button>
                  <button
                    onClick={handleRechargeConfirm}
                    className="px-4 py-2 border-4 border-black bg-green-500 text-white font-bold transform hover:-translate-y-1 transition-transform"
                  >
                    XÁC NHẬN
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* VIP Modal */}
      {showVipModal &&
        createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black w-full max-w-md transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black">MUA GÓI VIP</h2>
                <button
                  onClick={() => setShowVipModal(false)}
                  className="p-1 hover:bg-gray-200"
                >
                  <IoIosClose size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold mb-4 uppercase">Chọn gói VIP:</h3>
                  <div className="space-y-4">
                    {VIP_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.label}
                        onClick={() => handleSelectVip(pkg.days, pkg.price)}
                        className="w-full border-4 border-black p-4 flex justify-between items-center hover:bg-yellow-50 transition-colors transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-yellow-custom transform rotate-3">
                            <span className="font-bold">VIP</span>
                          </div>
                          <span className="font-bold">{pkg.label}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <img
                            src="/images/coin.png"
                            alt="coin"
                            className="w-5 h-5"
                          />
                          <span className="font-bold">{pkg.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t-4 border-black pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold">Số dư hiện tại:</span>
                    <div className="flex items-center gap-1">
                      <img
                        src="/images/coin.png"
                        alt="coin"
                        className="w-5 h-5"
                      />
                      <span className="font-bold">{user?.balance || 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowVipModal(false)}
                      className="px-4 py-2 border-4 border-black font-bold hover:bg-gray-100"
                    >
                      HỦY
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default BalancePage;
