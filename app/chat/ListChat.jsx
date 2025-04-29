"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";

const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

const ListChat = () => {
  const { userId } = useParams();
  const [chatUsers, setChatUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return null;

        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await res.json();
        setCurrentUser(userData);
        return userData;
      } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
      }
    };

    const fetchChatUsers = async (currentUserId) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch all messages where current user is sender or receiver
        const messagesRes = await fetch(
          `${API_URL}/api/messages?filters[$or][0][sender][$eq]=${currentUserId}&filters[$or][1][receiver][$eq]=${currentUserId}&sort[0]=createdAt:desc`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const messagesData = await messagesRes.json();

        // Extract unique user IDs (excluding current user)
        const uniqueUserIds = new Set();
        messagesData.data.forEach((msg) => {
          if (msg.sender !== currentUserId) uniqueUserIds.add(msg.sender);
          if (msg.receiver !== currentUserId) uniqueUserIds.add(msg.receiver);
        });

        // Get user details for each unique user ID
        const userDetailsPromises = Array.from(uniqueUserIds).map(
          async (userId) => {
            const userRes = await axios.get(`${API_URL}/api/users`, {
              headers: { Authorization: `Bearer ${token}` },
              params: {
                "filters[documentId][$eq]": userId,
                populate: {
                  avatar: true,
                },
              },
            });

            if (userRes.data && userRes.data.length > 0) {
              const userData = userRes.data[0];

              // Find the latest message between current user and this user
              const latestMessage = messagesData.data.find(
                (msg) =>
                  (msg.sender === currentUserId && msg.receiver === userId) ||
                  (msg.sender === userId && msg.receiver === currentUserId)
              );

              return {
                ...userData,
                latestMessage: latestMessage
                  ? {
                      content: latestMessage.content,
                      createdAt: latestMessage.createdAt,
                      isFromMe: latestMessage.sender === currentUserId,
                    }
                  : null,
              };
            }
            return null;
          }
        );

        const userDetails = await Promise.all(userDetailsPromises);
        const filteredUsers = userDetails.filter((user) => user !== null);

        // Sort by latest message time
        filteredUsers.sort((a, b) => {
          if (!a.latestMessage) return 1;
          if (!b.latestMessage) return -1;
          return (
            new Date(b.latestMessage.createdAt) -
            new Date(a.latestMessage.createdAt)
          );
        });

        setChatUsers(filteredUsers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chat users:", error);
        setIsLoading(false);
      }
    };

    const init = async () => {
      setIsLoading(true);
      const user = await fetchCurrentUser();
      if (user) {
        fetchChatUsers(user.documentId);
      } else {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Format time for display
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      // Yesterday
      return "Hôm qua";
    } else if (diffDays < 7) {
      // Within a week
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      return days[date.getDay()];
    } else {
      // Older than a week
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }
  };

  // Truncate message content
  const truncateMessage = (content, maxLength = 30) => {
    if (!content) return "";
    return content.length > maxLength
      ? content.substring(0, maxLength) + "..."
      : content;
  };

  if (isLoading) {
    return (
      <div className="border-4 border-black bg-white h-[600px]">
        <div className="border-b-4 border-black p-4 bg-gray-100">
          <h2 className="text-xl font-black">ĐOẠN CHAT</h2>
        </div>

        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="border-2 border-black p-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 border-2 border-black"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-white transform rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="border-b-4 border-black p-4 bg-gray-100">
        <h2 className="text-xl font-black">ĐOẠN CHAT</h2>
      </div>

      <div className="overflow-y-auto max-h-[600px]">
        {chatUsers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mb-4">
              <img
                src="/images/empty-box.png"
                alt="Empty"
                className="w-16 h-16 mx-auto"
              />
            </div>
            <p className="text-lg font-bold mb-2">Chưa có tin nhắn nào</p>
            <p className="text-gray-600">
              Bắt đầu trò chuyện với người bán để tìm hiểu thêm về sản phẩm.
            </p>
          </div>
        ) : (
          <div>
            {chatUsers.map((user) => (
              <Link
                key={user.documentId}
                href={`/chat/${user.documentId}`}
                className={`block border-b-2 border-black hover:bg-gray-50 transition-colors ${
                  userId === user.documentId ? "bg-yellow-50" : ""
                }`}
              >
                <div className="p-4 flex items-center gap-3">
                  <div className="relative">
                    {user.avatar ? (
                      <img
                        src={`${STRAPI_URL_LOCAL}${user.avatar.url}`}
                        alt={user.username}
                        className="w-12 h-12 object-cover border-2 border-black transform -rotate-2"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 border-2 border-black flex items-center justify-center transform rotate-2">
                        <span className="font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {user.vipExpireAt &&
                      new Date(user.vipExpireAt) > new Date() && (
                        <div className="absolute -top-2 -right-2 bg-yellow-custom border-2 border-black px-1 py-0.5 transform rotate-12">
                          <span className="text-xs font-bold">VIP</span>
                        </div>
                      )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold">{user.username}</h3>
                      {user.latestMessage && (
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(user.latestMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {user.latestMessage && (
                      <p className="text-sm text-gray-600">
                        {user.latestMessage.isFromMe && (
                          <span className="font-medium">Bạn: </span>
                        )}
                        {truncateMessage(user.latestMessage.content)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListChat;
