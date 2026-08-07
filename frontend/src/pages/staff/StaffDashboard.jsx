import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffFeedbacks } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Search, Filter, Lock, Eye, LogOut, User } from 'lucide-react';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, resolved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const loadData = async (status, search) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      // 1. Lấy data đã lọc từ backend (theo yêu cầu 26)
      const data = await getStaffFeedbacks(status, search, token);
      setFeedbacks(data);

      // 2. Lấy toàn bộ data để tính toán thẻ đếm số lượng (nếu chưa có API stats)
      const allData = await getStaffFeedbacks('all', '', token);
      setStats({
        total: allData.length,
        pending: allData.filter(f => f.status === 'pending').length,
        processing: allData.filter(f => f.status === 'processing').length,
        resolved: allData.filter(f => f.status === 'resolved').length,
        rejected: allData.filter(f => f.status === 'rejected').length,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(statusFilter, searchTerm);
    // eslint-disable-next-line
  }, [statusFilter, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="s-badge pending">Mới gửi</span>;
      case 'processing': return <span className="s-badge processing">Đang xử lý</span>;
      case 'resolved': return <span className="s-badge resolved">Đã xử lý</span>;
      case 'rejected': return <span className="s-badge rejected">Từ chối</span>;
      default: return <span className="s-badge">{status}</span>;
    }
  };

  return (
    <div className="staff-layout">
      {/* Sidebar / Header */}
      <div className="staff-header">
        <div className="staff-brand">
          <h2>BẢNG ĐIỀU KHIỂN CÁN BỘ</h2>
          <p>Xin chào, {user?.full_name}</p>
        </div>
        <div className="staff-actions">
          {user?.role === 'admin' && (
            <button className="btn-admin" onClick={() => navigate('/admin/categories')}>Quản lý Danh mục</button>
          )}
          <button className="btn-profile" onClick={() => navigate('/profile')}><User size={18} /> Cá nhân</button>
          <button className="btn-logout" onClick={logout}><LogOut size={18} /> Đăng xuất</button>
        </div>
      </div>

      <div className="staff-content">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Thẻ thống kê (27) */}
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng số phiếu</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Mới gửi</div>
          </div>
          <div className="stat-card processing">
            <div className="stat-value">{stats.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Đã xử lý</div>
          </div>
        </div>

        {/* Bảng danh sách & Bộ lọc */}
        <div className="staff-panel">
          <div className="panel-header">
            <h3>Danh sách Phản ánh & Góp ý</h3>
            <div className="panel-filters">
              <form onSubmit={handleSearchSubmit} className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm tiêu đề, nội dung..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit"><Search size={18} /></button>
              </form>

              <div className="filter-box">
                <Filter size={18} className="filter-icon" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Mới gửi</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="staff-table">
              <thead>
                <tr>
                  <th width="15%">Thời gian</th>
                  <th width="20%">Người gửi (Bảo mật)</th>
                  <th width="15%">Danh mục</th>
                  <th width="30%">Tiêu đề</th>
                  <th width="10%">Trạng thái</th>
                  <th width="10%">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center loading">Đang tải dữ liệu...</td></tr>
                ) : feedbacks.length === 0 ? (
                  <tr><td colSpan="6" className="text-center empty">Không tìm thấy phản ánh nào.</td></tr>
                ) : (
                  feedbacks.map(fb => (
                    <tr key={fb.id}>
                      <td>{new Date(fb.created_at).toLocaleString('vi-VN')}</td>
                      <td>
                        {fb.is_anonymous ? (
                          <span className="privacy-badge private"><Lock size={14} /> {fb.users?.full_name}</span>
                        ) : (
                          <span className="privacy-badge public"><Eye size={14} /> {fb.users?.full_name} ({fb.users?.student_code})</span>
                        )}
                      </td>
                      <td>{fb.categories?.name}</td>
                      <td className="fb-title-cell">{fb.title}</td>
                      <td>{getStatusBadge(fb.status)}</td>
                      <td>
                        <button className="btn-view" onClick={() => alert("Màn hình Chi tiết phản ánh đang phát triển ở Ngày 29!")}>
                          Xem / Xử lý
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
