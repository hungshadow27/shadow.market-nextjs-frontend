"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import io from "socket.io-client";
import { IoSend } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";

let socket;
const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export default function Chat() {
  const router = useRouter();
  const { userId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Initialize Socket.IO and fetch user data
  useEffect(() => {
    const fetchUserAndConnect = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch current user
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await res.json();
        setCurrentUser(userData);

        // Fetch receiver user
        const resReceiver = await axios.get(`${API_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            "filters[documentId][$eq]": userId,
          },
        });

        if (resReceiver.data && resReceiver.data.length > 0) {
          const receiverUserData = resReceiver.data[0];
          setReceiver(receiverUserData);
        } else {
          console.error("Receiver not found");
          return;
        }

        // Connect to Socket.IO
        socket = io(SOCKET_URL, {
          auth: { token },
        });

        socket.on("connect", () => {
          console.log("Connected to socket server");
          socket.emit("join", {
            userId: userData.documentId,
            chatWith: userId,
          });
        });

        socket.on("message", (message) => {
          setMessages((prev) => [...prev, message]);
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err);
        });

        // Fetch previous messages
        const messagesRes = await fetch(
          `${API_URL}/api/messages?filters[$or][0][sender][$eq]=${userData.documentId}&filters[$or][0][receiver][$eq]=${userId}&filters[$or][1][sender][$eq]=${userId}&filters[$or][1][receiver][$eq]=${userData.documentId}&sort[0]=createdAt:asc`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const messagesData = await messagesRes.json();
        const formattedMessages = messagesData.data.map((msg) => ({
          sender: msg.sender,
          receiver: msg.receiver,
          content: msg.content,
          createdAt: msg.createdAt,
        }));

        setMessages(formattedMessages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setIsLoading(false);
      }
    };

    if (userId) fetchUserAndConnect();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [userId, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser) return;

    const messageData = {
      content: newMessage,
      sender: currentUser.documentId,
      receiver: userId,
      createdAt: new Date().toISOString(),
    };

    // Send via socket
    socket.emit("sendMessage", messageData);
    setNewMessage("");

    // Save to Strapi
    const messageDataForStrapi = {
      content: newMessage,
      sender: currentUser.documentId,
      receiver: userId,
    };

    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ data: messageDataForStrapi }),
    }).catch((err) => console.error("Error saving message:", err));
  };

  // Format date for message groups
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach((msg) => {
      const date = formatMessageDate(msg.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });

    return groups;
  };

  // Format time for individual messages
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const messageGroups = groupMessagesByDate();

  if (isLoading) {
    return (
      <div className="border-4 border-black bg-white h-[600px] transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 border-2 border-black animate-pulse"></div>
          <div className="h-5 bg-gray-200 w-1/3 animate-pulse"></div>
        </div>

        <div className="h-[500px] p-4">
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-black border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-4 border-black bg-white transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[600px]">
      {/* Chat header */}
      <div className="border-b-4 border-black p-4 bg-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="md:hidden p-1 hover:bg-gray-200 border-2 border-black"
          >
            <FaArrowLeft size={20} />
          </Link>

          <div className="flex items-center gap-3">
            {receiver?.avatar ? (
              <img
                src={`${STRAPI_URL_LOCAL}${receiver.avatar.url}`}
                alt={receiver.username}
                className="w-10 h-10 object-cover border-2 border-black transform rotate-2"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 border-2 border-black flex items-center justify-center transform -rotate-2">
                <span className="font-bold">
                  {receiver?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <h2 className="font-bold text-lg">{receiver?.username}</h2>
          </div>
        </div>

        <Link
          href={`/profile/${receiver?.documentId}`}
          className="text-sm font-bold border-2 border-black px-2 py-1 hover:bg-black hover:text-white transition-colors"
        >
          Xem hồ sơ
        </Link>
      </div>

      {/* Messages container */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {Object.keys(messageGroups).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-black bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <IoSend size={24} />
            </div>
            <p className="font-bold text-lg mb-2">Bắt đầu cuộc trò chuyện</p>
            <p className="text-gray-600 text-center max-w-xs">
              Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với{" "}
              {receiver?.username}
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center">
                <div className="inline-block bg-gray-200 border-2 border-black px-3 py-1 font-bold text-sm transform rotate-1">
                  {date}
                </div>
              </div>

              {msgs.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === currentUser?.documentId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md p-3 border-2 ${
                      msg.sender === currentUser?.documentId
                        ? "border-black bg-primary text-white transform -rotate-1"
                        : "border-black bg-gray-100 transform rotate-1"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <div className="text-right">
                      <span
                        className={`text-xs ${
                          msg.sender === currentUser?.documentId
                            ? "text-white/70"
                            : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t-4 border-black p-4 bg-gray-100 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 p-3 border-4 border-black focus:ring-0 focus:border-black"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className={`px-4 py-2 border-4 border-black font-bold flex items-center gap-2 ${
            newMessage.trim()
              ? "bg-primary text-white hover:-translate-y-1 transition-transform"
              : "bg-gray-200 cursor-not-allowed"
          }`}
        >
          <IoSend size={18} />
          <span className="hidden sm:inline">Gửi</span>
        </button>
      </form>
    </div>
  );
}
