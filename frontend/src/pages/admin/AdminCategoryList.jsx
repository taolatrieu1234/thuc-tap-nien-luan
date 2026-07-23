import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './AdminCategoryList.css';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ admin mới có quyền truy cập
    if (user && user.role !== 'admin') {
      alert("Bạn không có quyền truy cập trang này!");
      navigate('/');
      return;
    }

    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [user, navigate]);

  return (
    <div className="category-container">
      <div className="category-header">
        <h2>Quản lý Danh mục Phản ánh</h2>
        <button 
          className="btn-add" 
          onClick={() => alert("Chức năng thêm mới đang phát triển ở Ngày 15!")}
        >
          <Plus size={20} /> Thêm danh mục
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <div className="table-responsive">
          <table className="category-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Danh Mục</th>
                <th>Mô Tả</th>
                <th>Ngày Tạo</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">Chưa có danh mục nào.</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td className="fw-bold">{cat.name}</td>
                    <td>{cat.description || <span className="text-muted">Không có</span>}</td>
                    <td>{new Date(cat.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit" 
                          title="Sửa"
                          onClick={() => alert(`Chức năng sửa danh mục ${cat.id} đang phát triển ở Ngày 15!`)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          title="Xóa"
                          onClick={() => alert(`Chức năng xóa danh mục ${cat.id} đang phát triển ở Ngày 15!`)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryList;
