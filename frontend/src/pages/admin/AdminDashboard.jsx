import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8f9fa", minHeight: "80vh" }}>
      <h1 style={{ color: "#007bff" }}>👑 BẢNG ĐIỀU KHIỂN CỦA QUẢN TRỊ VIÊN (ADMIN)</h1>
      <p>Xin chào Admin: {user?.full_name} | Vai trò hệ thống: {user?.role}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => navigate('/profile')}>Trang cá nhân</button>
        <button style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer" }} onClick={() => navigate('/admin/categories')}>Quản lý Danh mục</button>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => alert("Quản lý Người dùng đang phát triển!")}>Quản lý Người dùng</button>
        <button style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
