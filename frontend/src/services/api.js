// Thiết lập Base URL trỏ về cổng chạy của Backend FastAPI(5)
const BASE_URL = "http://127.0.0.1:8000";

/**
 * Hàm gọi API kiểm tra  hệ thống*/
export const fetchHealthCheck = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`Lỗi kết nối HTTP! Trạng thái: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi thực hiện fetchHealthCheck:", error);
    throw error;
  }
};




