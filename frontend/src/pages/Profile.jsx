import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Các State quản lý dữ liệu nhập vào của Form Đổi mật khẩu
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // State hiển thị thông báo thành công hoặc thất bại
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    // State quản lý tab đang hiển thị
    const [activeTab, setActiveTab] = useState("profile");

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Mật khẩu mới phải đạt tối thiểu 6 ký tự!" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "Mật khẩu mới và Xác nhận mật khẩu không trùng khớp!" });
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const res = await changePassword(oldPassword, newPassword, token);

            setMessage({ type: "success", text: res.message || "Đổi mật khẩu thành công!" });
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setMessage({ type: "error", text: err.message || "Có lỗi xảy ra khi đổi mật khẩu." });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Lấy ngày hiện tại format hiển thị
    const today = new Date();
    const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const dateString = `${days[today.getDay()]}, ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    return (
        <div className="profile-container">
            {/* Header trên cùng */}
            <div className="profile-top-header">

                <div className="profile-date">{dateString}</div>
            </div>

            <div className="profile-body">
                {/* Thanh điều hướng bên trái (Sidebar) */}
                <aside className="profile-sidebar">
                    <div className="sidebar-user-name">{user?.full_name || "Sinh Viên"}</div>

                    <ul className="sidebar-menu">
                        <li className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                            <span className="menu-icon">👤</span> Lý lịch cá nhân
                        </li>
                        <li className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>
                            <span className="menu-icon">🔑</span> Đổi mật khẩu
                        </li>
                        <li onClick={handleLogout}>
                            <span className="menu-icon">🚪</span> Đăng xuất
                        </li>
                    </ul>
                </aside>

                {/* Khu vực nội dung chính */}
                <main className="profile-content-area">
                    <div className="content-header">
                        {activeTab === 'profile' ? 'THÔNG TIN CÁ NHÂN' : 'ĐỔI MẬT KHẨU'}
                    </div>

                    <div className="content-body">
                        {activeTab === 'profile' ? (
                            <div className="profile-details-card">
                                <h3>Hồ sơ tài khoản</h3>
                                <div className="info-grid">
                                    <div className="info-row"><span className="info-label">Họ và tên:</span> <span className="info-value">{user?.full_name}</span></div>
                                    <div className="info-row"><span className="info-label">Email:</span> <span className="info-value">{user?.email}</span></div>
                                    <div className="info-row"><span className="info-label">Tài khoản / MSSV:</span> <span className="info-value">{user?.student_code || user?.username}</span></div>
                                    {user?.class_name && <div className="info-row"><span className="info-label">Lớp sinh hoạt:</span> <span className="info-value">{user?.class_name}</span></div>}
                                    <div className="info-row">
                                        <span className="info-label">Vai trò hệ thống:</span>
                                        <span className="info-value"><span className="role-badge">{user?.role}</span></span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="password-change-card">
                                <h3>Đổi mật khẩu tài khoản</h3>
                                {message.text && (
                                    <div className={`alert-message ${message.type}`}>
                                        {message.text}
                                    </div>
                                )}
                                <form onSubmit={handleChangePassword} className="password-form">
                                    <div className="form-group">
                                        <label>Mật khẩu hiện tại:</label>
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            placeholder="Nhập mật khẩu cũ của bạn"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Mật khẩu mới (tối thiểu 6 ký tự):</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            placeholder="Nhập mật khẩu mới"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Xác nhận mật khẩu mới:</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`btn-submit ${loading ? 'loading' : ''}`}
                                    >
                                        {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;