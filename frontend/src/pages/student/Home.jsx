import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>👋 Chào sinh viên: {user?.full_name} ({user?.student_code})</h1>
      <p>Lớp sinh hoạt: {user?.class_name} | Quyền hệ thống: {user?.role}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => navigate('/profile')}>Trang cá nhân</button>
        <button style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#4a90e2", color: "white", border: "none", cursor: "pointer" }} onClick={() => navigate('/submit-feedback')}>Gửi phản ánh</button>
        <button style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }} onClick={() => navigate('/track-feedback')}>Lịch sử phản ánh</button>
        <button style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
};

export default Home;
