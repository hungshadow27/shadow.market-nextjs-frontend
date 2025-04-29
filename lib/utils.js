export default function formatCurrencyVND(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(number);
}
export function timeSince(dateString) {
  const postDate = new Date(dateString);
  const now = new Date();
  const secondsPast = Math.floor((now - postDate) / 1000);

  if (secondsPast < 0) {
    return "Trong tương lai";
  }

  if (secondsPast < 60) {
    return `${secondsPast} giây trước`;
  }

  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) {
    return `${minutesPast} phút trước`;
  }

  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) {
    return `${hoursPast} giờ trước`;
  }

  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast < 30) {
    return `${daysPast} ngày trước`;
  }

  const monthsPast = Math.floor(daysPast / 30);
  if (monthsPast < 12) {
    return `${monthsPast} tháng trước`;
  }

  const yearsPast = Math.floor(monthsPast / 12);
  return `${yearsPast} năm trước`;
}
export function maskPhoneNumber(phoneNumber) {
  // Kiểm tra nếu input không phải chuỗi hoặc quá ngắn
  if (typeof phoneNumber !== "string" || phoneNumber.length < 4) {
    return phoneNumber;
  }

  // Lấy 4 số cuối và thay bằng ****
  return phoneNumber.slice(0, -4) + "****";
}
export function convertGender(gender) {
  if (gender === "male") {
    return "Nam";
  } else if (gender === "female") {
    return "Nữ";
  } else {
    return "Khác";
  }
}
export function convertStatusN(statusN) {
  if (statusN === "new") {
    return "Mới";
  } else if (statusN === "old") {
    return "Đã sử dụng";
  } else {
    return "Hết bảo hành";
  }
}
