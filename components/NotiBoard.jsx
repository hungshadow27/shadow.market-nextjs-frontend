import { timeSince } from "@/lib/utils";
import Link from "next/link";

const NotiBoard = ({ noties }) => {
  return (
    <div className="fixed top-20 right-1/4 border-2 rounded-sm bg-white w-80 h-96 z-50 overflow-y-scroll">
      <h1 className="text-lg font-semibold text-center bg-primary sticky top-0">
        Thông báo
      </h1>

      <div className="px-2">
        {noties.map((noti, index) => (
          <div className="font-normal text-sm border-b-[1px]" key={index}>
            {noti?.type === "follow" && (
              <>
                <Link
                  className="font-bold"
                  href={`/profile/${noti?.user1?.documentId}`}
                >
                  {noti?.user1?.username}
                </Link>
                <span> đã theo dõi bạn! </span>
                <div>{timeSince(noti?.createdAt)}</div>
              </>
            )}
            {noti?.type === "love" && (
              <>
                <Link
                  className="font-bold"
                  href={`/profile/${noti?.user1?.documentId}`}
                >
                  {noti?.user1?.username}
                </Link>
                <span> đã thích bài đăng </span>
                <Link
                  className="font-bold"
                  href={`/post/${noti?.post?.documentId}`}
                >
                  {noti?.post?.documentId}
                </Link>
                <span> của bạn!</span>
                <div>{timeSince(noti?.createdAt)}</div>
              </>
            )}
            {noti?.type === "new-subscriber-post" && (
              <>
                <Link
                  className="font-bold"
                  href={`/profile/${noti?.user1?.documentId}`}
                >
                  {noti?.user1?.username}
                </Link>
                <span> đã tạo bài đăng mới </span>
                <Link
                  className="font-bold"
                  href={`/post/${noti?.post?.documentId}`}
                >
                  {noti?.post?.documentId}
                </Link>
                <div>{timeSince(noti?.createdAt)}</div>
              </>
            )}
            {noti?.type === "post-approve" && (
              <>
                <span> Bài đăng </span>
                <Link
                  className="font-bold"
                  href={`/post/${noti?.post?.documentId}`}
                >
                  {noti?.post?.documentId}
                </Link>
                <span> của bạn đã được duyệt thành công!</span>
                <div>{timeSince(noti?.createdAt)}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotiBoard;
