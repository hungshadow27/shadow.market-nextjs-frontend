"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaComment, FaShare } from "react-icons/fa";
const API_URL = process.env.STRAPI_URL;
const STRAPI_URL_LOCAL = process.env.NEXT_PUBLIC_STRAPI_URL_LOCAL;

export default function Shorts() {
  const [loginUser, setLoginUser] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef([]);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [videos, setVideos] = useState([]);
  const handleVideoClick = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;
    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };
  useEffect(() => {
    setLoginUser(JSON.parse(localStorage.getItem("user")));
  }, []);
  useEffect(() => {
    if (videoRefs.current.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const i = Number(entry.target.dataset.index);
          if (entry.isIntersecting) setCurrentVideoIndex(i);
        });
      },
      { threshold: 0.75 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;

      if (index === currentVideoIndex) {
        video.currentTime = 0;
        video.play().catch((err) => {
          console.error(`Failed to play video ${index}:`, err);
        });
      } else {
        video.pause();
      }
    });
  }, [currentVideoIndex]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/short-videos?filters[relatedPost][statusP][$eq]=active`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
            },
            params: {
              populate: {
                video: true,
                postedBy: true,
                relatedPost: {
                  populate: ["images"],
                },
              },
              sort: "createdAt:desc",
            },
          }
        );
        setVideos(res.data.data);
        console.log(res.data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="snap-y snap-mandatory w-full h-screen overflow-y-scroll no-scrollbar bg-black/90">
      {videos.map((video, index) => (
        <div
          key={video.documentId}
          className="snap-center w-fit mx-auto h-screen flex items-start justify-center relative pt-10"
        >
          <video
            data-index={index}
            src={`${STRAPI_URL_LOCAL}${video.video[0].url}`}
            ref={(el) => (videoRefs.current[index] = el)}
            muted={muted}
            playsInline
            loop
            className="max-w-[482px] h-[820px] w-full object-cover cursor-pointer shadow-sm shadow-white rounded-xl"
            style={{ maxHeight: "100vh" }}
            onClick={() => handleVideoClick(index)}
          />

          <div className="absolute bottom-33 left-4 text-white">
            <Link
              href={`/profile/${video.postedBy.documentId}`}
              className="text-lg font-bold"
            >
              @{video.postedBy.username}
            </Link>
            <div>
              <Link
                href={`/post/${video.relatedPost.documentId}`}
                className="w-full flex items-center gap-2 p-2 bg-black/95 text-white rounded-sm shadow"
              >
                <img
                  src={`${STRAPI_URL_LOCAL}${video.relatedPost.images[0].url}`}
                  alt="small"
                  className="w-14 h-14 object-cover"
                />
                <span className="truncate max-w-[200px]">
                  {video.relatedPost.title}
                </span>
              </Link>
            </div>
          </div>

          <div className="absolute -right-17 top-1/2 -translate-y-1/2 flex flex-col gap-4">
            {loginUser && video.postedBy.id !== loginUser.id && (
              <Link
                href={`/chat/${video.postedBy.id}`}
                className="flex flex-col gap-1 items-center text-white"
              >
                <FaComment className="text-2xl bg-black/70 w-12 h-12 p-3 rounded-full" />
              </Link>
            )}

            <button className="flex flex-col gap-1 items-center text-white">
              <FaShare className="text-2xl bg-black/70 w-12 h-12 p-3 rounded-full" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
