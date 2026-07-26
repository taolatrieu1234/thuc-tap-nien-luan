//(10)
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Profile from "./pages/Profile"; //(12)

import StudentHome from "./pages/student/Home";
import SubmitFeedback from "./pages/student/SubmitFeedback"; //(17)
import StaffDashboard from "./pages/staff/StaffDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategoryList from "./pages/admin/AdminCategoryList"; //(14)

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Đường dẫn mở cho trang Đăng nhập */}
          <Route path="/login" element={<Login />} />

          {/* ROUTER CHO TRANG CÁ NHÂN (Cho phép cả student, staff, admin) (12) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["student", "staff", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Nhóm Router dành cho Sinh viên (Route /) */}
          <Route path="/" element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route index element={<StudentHome />} />
            <Route path="submit-feedback" element={<SubmitFeedback />} />
          </Route>

          {/* Nhóm Router dành cho Cán bộ (Route /staff) */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={["staff", "admin"]} />}>
            <Route index element={<StaffDashboard />} />
          </Route>

          {/* Nhóm Router dành cho Admin (Route /admin) */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategoryList />} />
          </Route>

          {/* gõ bừa link linh tinh -> Tự chuyển hướng về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;