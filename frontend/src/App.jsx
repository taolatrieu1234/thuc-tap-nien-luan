//(10)
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; //(12)
import { useNavigate } from "react-router-dom";//(12)

// Component tạm thời cho  trang chủ Sinh viên 
const StudentHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>👋 Chào sinh viên: {user?.full_name} ({user?.student_code})</h1>
      <p>Lớp sinh hoạt: {user?.class_name} | Quyền hệ thống: {user?.role}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => navigate('/profile')}>Trang cá nhân</button>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => alert("Chức năng gửi phản ánh đang phát triển ở Tuần 4!")}>Gửi phản ánh</button>
        <button style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
};

// Component tạm thời cho Bảng điều khiển của Cán bộ 
const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8f9fa", minHeight: "80vh" }}>
      <h1 style={{ color: "#28a745" }}>🛠️ BẢNG ĐIỀU KHIỂN CỦA CÁN BỘ / ADMIN</h1>
      <p>Xin chào thầy/cô: {user?.full_name} | Vai trò hệ thống: {user?.role}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => navigate('/profile')}>Trang cá nhân</button>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={() => alert("Danh sách phản ánh toàn trường đang được phát triển ở Tuần 6!")}>Quản lý phản ánh</button>
        <button style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "#fff", border: "none", cursor: "pointer" }} onClick={logout}>Đăng xuất</button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Đường dẫn mở cho trang Đăng nhập */}
          <Route path="/login" element={<Login />} />


          {/* ROUTER  CHO TRANG CÁ NHÂN (Cho phép cả student, staff, admin) (12) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student", "staff", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />


          {/*  (Chỉ cho phép tài khoản role là 'student') */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentHome />
              </ProtectedRoute>
            }
          />



          {/* (Chỉ cho phép role 'staff' hoặc 'admin') */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff", "admin"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />



          {/*  gõ bừa link linh tinh -> Tự chuyển hướng về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;