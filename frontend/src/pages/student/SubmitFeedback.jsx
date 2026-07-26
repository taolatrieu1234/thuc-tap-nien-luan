import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, createFeedback } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './SubmitFeedback.css';

const SubmitFeedback = () => {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  // Ẩn danh sẽ được phát triển đầy đủ ở Ngày 18 theo plan, tạm thời để code nền
  const [isAnonymous, setIsAnonymous] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Kiểm tra client-side validation
    if (content.length < 20) {
      setError("Nội dung chi tiết phải có ít nhất 20 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      await createFeedback(title, content, categoryId, isAnonymous, token);
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      
      // Hiển thị thông báo và có thể chuyển hướng sau vài giây (nếu muốn)
      setTimeout(() => {
        alert("Gửi phản ánh thành công! Bạn có thể xem lại trong lịch sử.");
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Đang tải biểu mẫu...</div>;

  return (
    <div className="submit-feedback-container">
      <div className="submit-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          &larr; Quay lại
        </button>
        <h2>Tạo Phản Ánh / Góp Ý Mới</h2>
      </div>

      <div className="submit-content">
        <div className="user-info-banner">
          <p>
            Bạn đang gửi phản ánh với tư cách: <strong>{user?.full_name} ({user?.student_code})</strong>
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Phản ánh của bạn đã được gửi thành công!</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề phản ánh <span className="required">*</span></label>
            <input 
              type="text" 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vd: Quạt phòng A201 bị hỏng"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Danh mục <span className="required">*</span></label>
            <select 
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              Nội dung chi tiết <span className="required">*</span> 
              <span className="char-count" style={{ color: content.length < 20 ? 'red' : 'green' }}>
                ({content.length} ký tự)
              </span>
            </label>
            <textarea 
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải (tối thiểu 20 ký tự)..."
              rows="6"
              required 
            ></textarea>
            {content.length > 0 && content.length < 20 && (
              <small className="error-text">Còn thiếu {20 - content.length} ký tự nữa.</small>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={submitting || content.length < 20}
          >
            {submitting ? "Đang gửi..." : "Gửi Phản Ánh"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitFeedback;
