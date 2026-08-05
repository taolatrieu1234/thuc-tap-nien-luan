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

/**
 * Hàm tạo mới danh mục (Admin) (15)
 */
export const createCategory = async (name, description, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể tạo danh mục.");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi createCategory:", error);
    throw error;
  }
};

/**
 * Hàm cập nhật danh mục (Admin) (15)
 */
export const updateCategory = async (id, name, description, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, description })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể cập nhật danh mục.");
    }
    return await response.json();
  } catch (error) {
    console.error("Lỗi updateCategory:", error);
    throw error;
  }
};

/**
 * Hàm xóa danh mục (Admin) (15)
 */
export const deleteCategory = async (id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể xóa danh mục.");
    }
    // Delete trả về 204 No Content nên không cần parse json
    return true;
  } catch (error) {
    console.error("Lỗi deleteCategory:", error);
    throw error;
  }
};

/**
 * Hàm gửi phản ánh mới (Sinh viên) (17)
 */
export const createFeedback = async (title, content, category_id, is_anonymous, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/feedbacks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        category_id: parseInt(category_id),
        is_anonymous
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Bắt lỗi validation trả về từ FastAPI
      if (errorData.detail && Array.isArray(errorData.detail)) {
        throw new Error(errorData.detail[0].msg || "Dữ liệu không hợp lệ.");
      }
      throw new Error(errorData.detail || "Không thể gửi phản ánh.");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi createFeedback:", error);
    throw error;
  }
};

/**
 * Hàm lấy lịch sử phản ánh của sinh viên (19, 20)
 */
export const fetchMyFeedbacks = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/feedbacks/my`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể tải lịch sử phản ánh.");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi fetchMyFeedbacks:", error);
    throw error;
  }
};

/**
 * Hàm cập nhật, chỉnh sửa phiếu phản ánh (21,22)
 */
export const updateFeedback = async (feedback_id, update_data, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/feedbacks/${feedback_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(update_data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.detail && Array.isArray(errorData.detail)) {
        throw new Error(errorData.detail[0].msg || "Dữ liệu không hợp lệ.");
      }
      throw new Error(errorData.detail || "Không thể cập nhật phản ánh.");
    }

    return await response.json();
  } catch (error) {
    console.error("Lỗi updateFeedback:", error);
    throw error;
  }
};




/**
 * Hàm xóa (rút) phiếu phản ánh (21,23)
 */
export const deleteFeedback = async (feedback_id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/feedbacks/${feedback_id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể xóa phản ánh.");
    }

    // API trả về 204 No Content nên không có body
    return true;
  } catch (error) {
    console.error("Lỗi deleteFeedback:", error);
    throw error;
  }
};

/**
 * Hàm xem chi tiết phản ánh của sinh viên (24, 25)
 */
export const getFeedbackDetail = async (feedback_id, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/feedbacks/${feedback_id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Không thể tải chi tiết phản ánh.");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Lỗi getFeedbackDetail:", error);
    throw error;
  }
};