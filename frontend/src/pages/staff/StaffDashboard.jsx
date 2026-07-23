import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8f9fa", minHeight: "80vh" }}>
      <h1 style={{ color: "#28a745" }}>🛠️ BẢNG ĐIỀU KHIỂN CỦA CÁN BỘ </h1>
      <p>Xin chào thầy/cô: {user?.full_name} | Vai trò hệ thống: {user?.role}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => navigate('/profile')}>Trang cá nhân</button>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => alert("Danh sách phản ánh toàn trường đang được phát triển ở Tuần 6!")}>Quản lý phản ánh</button>

        {/* nút bấm của admin( quản lý danh mục ) */}
        {user?.role === 'admin' && (
          <button style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }} onClick={() => navigate('/admin/categories')}>Quản lý Danh mục</button>
        )}

        <button style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
};

export default StaffDashboard;
