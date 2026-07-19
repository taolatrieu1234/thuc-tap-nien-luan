
//(10)
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUserProfile } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin định danh và role của user
    const [loading, setLoading] = useState(true); // Trạng thái kiểm tra token khi F5

    // khôi phục phiên khi f5 trang 
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem("access_token");
            if (token) {
                try {
                    const userProfile = await fetchUserProfile(token);
                    setUser(userProfile); // Nạp thông tin user vào state toàn cục
                } catch (error) {
                    console.log("Phiên đăng nhập hết hạn, tự động xóa token cũ.");
                    localStorage.removeItem("access_token");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    // Hàm xử lý đăng xuất hệ thống nhanh
    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        alert("Đã đăng xuất khỏi hệ thống!");
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook tùy biến để các component con gọi nhanh dữ liệu Auth
export const useAuth = () => useContext(AuthContext);