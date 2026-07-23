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



/**
 Hàm gọi API Đăng nhập hệ thống #(9)
 */
export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    // Nếu Backend trả về lỗi (401, 403, 500...), trích xuất thông báo lỗi để hiển thị
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Đăng nhập thất bại!");
    }

    return await response.json(); // Trả về cục dữ liệu chứa access_token
  } catch (error) {
    console.error("Lỗi trong quá trình gọi API Login:", error);
    throw error;
  }
};




/**
 Hàm lấy thông tin người dùng hiện hành từ JWT Token (10)
 */
export const fetchUserProfile = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token đã hết hạn hoặc không hợp lệ.");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi fetchUserProfile:", error);
    throw error;
  }
};



/**
 Hàm gọi API Đổi mật khẩu cá nhân(11)
 Gửi mật khẩu cũ và mật khẩu mới kèm Token JWT ở Header
 */
export const changePassword = async (oldPassword, newPassword, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    //nếu lỗi
    if (!response.ok) {
      throw new Error(data.detail || "Đổi mật khẩu thất bại!");
    }

    return data;
  } catch (error) {
    console.error("Lỗi khi thực hiện changePassword:", error);
    throw error;
  }
};

/**
 Hàm gọi API Lấy danh sách danh mục (14)
 */
export const fetchCategories = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/`);
    if (!response.ok) {
      throw new Error("Lỗi khi tải danh sách danh mục.");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi fetchCategories:", error);
    throw error;
  }
};