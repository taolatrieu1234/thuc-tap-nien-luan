//(10)
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // Đợi hệ thống giải mã xong Token ở localStorage
    if (loading) {
        return <div style={{ textAlign: "center", marginTop: "50px" }}>Đang kiểm tra quyền truy cập...</div>;
    }


    // Nếu chưa đăng nhập -> Ép quay xe về trang Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu vai trò (Role) hiện tại không nằm trong danh sách cho phép -> Trả về trang chặn

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
                <h2>LỖI 403: BẠN KHÔNG CÓ QUYỀN TRUY CẬP TRANG NÀY!</h2>
                <button onClick={() => window.location.href = "/"} style={{ padding: "10px", marginTop: "15px", cursor: "pointer" }}>
                    Quay lại Trang chủ
                </button>
            </div>
        );
    }

    // Nếu hợp lệ -> Cho phép đi tiếp vào giao diện mong muốn
    return children ? children : <Outlet />;
};

export default ProtectedRoute;