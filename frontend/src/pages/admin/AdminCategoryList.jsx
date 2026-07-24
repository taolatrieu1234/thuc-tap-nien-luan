import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import './AdminCategoryList.css';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //(15) thêm các trạng thái cửa sổ modal 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    // Chỉ admin mới có quyền truy cập
    if (user && user.role !== 'admin') {
      alert("Bạn không có quyền truy cập trang này!");
      navigate('/');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  //  modal Thêm mới(15)
  const handleOpenAddModal = () => {
    setModalMode('add');
    setCurrentCategory({ id: null, name: '', description: '' });
    setIsModalOpen(true);
  };

  //  modal Sửa (15)
  const handleOpenEditModal = (cat) => {
    setModalMode('edit');
    setCurrentCategory({ id: cat.id, name: cat.name, description: cat.description || '' });
    setIsModalOpen(true);
  };

  // Đóng modal (15)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({ id: null, name: '', description: '' });
  };

  // Xử lý Submit Form (Thêm / Sửa) (15)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");

    try {
      if (modalMode === 'add') {
        await createCategory(currentCategory.name, currentCategory.description, token);
        alert("Thêm danh mục thành công!");
      } else {
        await updateCategory(currentCategory.id, currentCategory.name, currentCategory.description, token);
        alert("Cập nhật danh mục thành công!");
      }
      handleCloseModal();
      loadCategories(); // reload data
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý Xóa (15)
  const handleDelete = async (cat) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?\nLưu ý: Không thể xóa nếu danh mục đang chứa phiếu phản ánh.`)) {
      const token = localStorage.getItem("access_token");
      try {
        await deleteCategory(cat.id, token);
        alert("Xóa danh mục thành công!");
        loadCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="category-container">
      <div className="category-header">
        <h2>Quản lý Danh mục Phản ánh</h2>
        <button
          className="btn-add"
          onClick={handleOpenAddModal}
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
                          onClick={() => handleOpenEditModal(cat)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          title="Xóa"
                          onClick={() => handleDelete(cat)}
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







      {/* Giao diện hộp thoại */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Thêm mới Danh mục' : 'Chỉnh sửa Danh mục'}</h3>
              <button className="btn-close" onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitForm} className="modal-body">
              <div className="form-group">
                <label>Tên danh mục <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                  placeholder="Nhập tên danh mục..."
                />
              </div>
              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                  placeholder="Mô tả cho danh mục này..."
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>
                  {isSubmitting ? "Đang lưu..." : "Lưu dữ liệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryList;
