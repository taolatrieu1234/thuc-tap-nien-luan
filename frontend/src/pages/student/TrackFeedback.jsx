import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyFeedbacks } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye } from 'lucide-react';
import './TrackFeedback.css';

const TrackFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const data = await fetchMyFeedbacks(token);
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFeedbacks();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">Mới gửi</span>;
      case 'processing':
        return <span className="status-badge status-processing">Đang xử lý</span>;
      case 'resolved':
        return <span className="status-badge status-resolved">Đã xử lý</span>;
      case 'rejected':
        return <span className="status-badge status-rejected">Từ chối</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="track-container">
      <div className="track-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          &larr; Quay lại
        </button>
        <h2>Lịch Sử Phản Ánh Cá Nhân</h2>
      </div>

      <div className="track-content">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="loading">Đang tải lịch sử...</div>
        ) : feedbacks.length === 0 ? (
          <div className="empty-state">
            <p>Bạn chưa gửi bất kỳ phản ánh nào.</p>
            <button className="btn-primary" onClick={() => navigate('/submit-feedback')}>
              Gửi phản ánh đầu tiên
            </button>
          </div>
        ) : (
          <div className="feedback-list">
            {feedbacks.map(fb => (
              <div key={fb.id} className="feedback-card">
                <div className="card-header">
                  <h3 className="fb-title">{fb.title}</h3>
                  {getStatusBadge(fb.status)}
                </div>
                
                <div className="card-meta">
                  <span className="fb-date">Gửi ngày: {new Date(fb.created_at).toLocaleString('vi-VN')}</span>
                  
                  {fb.is_anonymous ? (
                    <span className="fb-privacy anonymous">
                      <Lock size={14} /> Gửi ẩn danh
                    </span>
                  ) : (
                    <span className="fb-privacy public">
                      <Eye size={14} /> Công khai ({user?.student_code})
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <p className="fb-content">{fb.content}</p>
                </div>
                
                <div className="card-footer">
                  <button className="btn-detail" onClick={() => alert("Chức năng Xem chi tiết & Hủy phiếu đang phát triển ở Tuần 5!")}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackFeedback;
