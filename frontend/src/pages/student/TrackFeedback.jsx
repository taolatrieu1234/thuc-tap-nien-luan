import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyFeedbacks, fetchCategories, updateFeedback } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, Edit2, X } from 'lucide-react';
import './TrackFeedback.css';

const TrackFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit State
  const [editingFb, setEditingFb] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', category_id: '', is_anonymous: false });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const [fbData, catData] = await Promise.all([
          fetchMyFeedbacks(token),
          fetchCategories()
        ]);
        setFeedbacks(fbData);
        setCategories(catData);
      } catch (err) {
        setError("Lỗi tải dữ liệu: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEditClick = (fb) => {
    setUpdateError(null);
    setEditForm({
      title: fb.title,
      content: fb.content,
      category_id: fb.category_id,
      is_anonymous: fb.is_anonymous
    });
    setEditingFb(fb);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    if (editForm.content.length < 20) {
      setUpdateError("Nội dung phải có ít nhất 20 ký tự.");
      return;
    }

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const updatedFb = await updateFeedback(editingFb.id, editForm, token);
      // Update locally
      setFeedbacks(prev => prev.map(f => f.id === editingFb.id ? updatedFb : f));
      setEditingFb(null);
      alert("Đã cập nhật phản ánh thành công!");
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

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
                  {fb.status === 'pending' && (
                    <button className="btn-action btn-edit" onClick={() => handleEditClick(fb)}>
                      <Edit2 size={16} style={{ marginRight: '5px' }}/> Chỉnh sửa
                    </button>
                  )}
                  <button className="btn-detail" onClick={() => alert("Chức năng Xem chi tiết & Hủy phiếu đang phát triển ở Tuần 5!")}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CHỈNH SỬA PHẢN ÁNH */}
      {editingFb && (
        <div className="tf-modal-overlay">
          <div className="tf-modal-content">
            <div className="tf-modal-header">
              <h3>Chỉnh Sửa Phản Ánh</h3>
              <button className="btn-close" onClick={() => setEditingFb(null)}><X size={20}/></button>
            </div>
            <div className="tf-modal-body">
              {updateError && <div className="alert alert-danger" style={{padding: "10px", marginBottom: "15px"}}>{updateError}</div>}
              <form onSubmit={handleUpdateSubmit} className="tf-form">
                <div className="tf-form-group">
                  <label>Tiêu đề <span className="required">*</span></label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                </div>
                <div className="tf-form-group">
                  <label>Danh mục <span className="required">*</span></label>
                  <select value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: parseInt(e.target.value)})} required>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="tf-form-group">
                  <label>Nội dung <span className="required">*</span> <small>({editForm.content.length} ký tự)</small></label>
                  <textarea rows="5" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} required />
                  {editForm.content.length < 20 && <small className="error-text">Tối thiểu 20 ký tự.</small>}
                </div>
                <div className="tf-form-group tf-checkbox">
                  <label>
                    <input type="checkbox" checked={editForm.is_anonymous} onChange={e => setEditForm({...editForm, is_anonymous: e.target.checked})} />
                    Gửi ẩn danh
                  </label>
                </div>
                <div className="tf-modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setEditingFb(null)}>Hủy bỏ</button>
                  <button type="submit" className="btn-save" disabled={updateLoading || editForm.content.length < 20}>
                    {updateLoading ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackFeedback;
