-- ==========================================
-- 1. TẠO BẢNG USERS (Tự quản lý)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    student_code VARCHAR(20) UNIQUE, -- Chỉ sinh viên mới có, cán bộ để trống
    class_name VARCHAR(50),          -- Chỉ sinh viên mới có, cán bộ để trống
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. TẠO BẢNG CATEGORIES (Danh mục phản ánh)
-- ==========================================
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. TẠO BẢNG FEEDBACKS (Phản ánh & Góp ý)
-- ==========================================
CREATE TABLE feedbacks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE RESTRICT,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'resolved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. TẠO BẢNG RESPONSES (Phản hồi của Cán bộ)
-- ==========================================
CREATE TABLE responses (
    id SERIAL PRIMARY KEY,
    feedback_id INT UNIQUE REFERENCES feedbacks(id) ON DELETE CASCADE, -- Đảm bảo mỗi phản ánh chỉ có tối đa 1 phản hồi chính thức
    staff_id INT REFERENCES users(id) ON DELETE RESTRICT,
    response_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. TẠO CÁC CHỈ MỤC (INDEXES) TỐI ƯU HÓA TÌM KIẾM
-- ==========================================
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_student ON feedbacks(student_id);
CREATE INDEX idx_feedbacks_category ON feedbacks(category_id);

-- ==========================================
-- 7. CHÈN DỮ LIỆU MẪU (SEED DATA)
-- ==========================================

-- Chèn Danh mục mẫu
INSERT INTO categories (name, description) VALUES
('Góp ý học tập', 'Ý kiến về chương trình học, giảng viên, lịch học'),
('Cơ sở vật chất', 'Phản ánh về phòng học, thiết bị máy chiếu, điều hòa, wifi'),
('Dịch vụ sinh viên', 'Nhà xe, căng tin, thư viện, y tế'),
('Khiếu nại/Tố cáo', 'Các vấn đề tiêu cực hoặc tranh chấp cần xử lý gấp');

-- Chèn Tài khoản mẫu
-- Mật khẩu mẫu cho tất cả các tài khoản là: "123456" 
-- (Được băm bằng bcrypt: $2b$12$K1dUpZ9tV1i/M2cK3tI.i.bUvIodv8m1lO9Ww67t1l9.Y8/tQcRZu)
INSERT INTO users (username, password_hash, email, full_name, student_code, class_name, role) VALUES
-- Sinh viên
('sinhvien1', '$2b$12$K1dUpZ9tV1i/M2cK3tI.i.bUvIodv8m1lO9Ww67t1l9.Y8/tQcRZu', 'sv1@school.edu.vn', 'Nguyễn Văn A', 'SV001', 'CNTT-K16A', 'student'),
('sinhvien2', '$2b$12$K1dUpZ9tV1i/M2cK3tI.i.bUvIodv8m1lO9Ww67t1l9.Y8/tQcRZu', 'sv2@school.edu.vn', 'Trần Thị B', 'SV002', 'KTPM-K16B', 'student'),
-- Cán bộ xử lý
('canbo1', '$2b$12$K1dUpZ9tV1i/M2cK3tI.i.bUvIodv8m1lO9Ww67t1l9.Y8/tQcRZu', 'cb1@school.edu.vn', 'Thầy Nguyễn Khắc Huy', NULL, NULL, 'staff'),
-- Admin quản trị hệ thống
('admin', '$2b$12$K1dUpZ9tV1i/M2cK3tI.i.bUvIodv8m1lO9Ww67t1l9.Y8/tQcRZu', 'admin@school.edu.vn', 'Quản trị viên Hệ thống', NULL, NULL, 'admin');

-- Chèn một số phản ánh mẫu
INSERT INTO feedbacks (title, content, category_id, student_id, is_anonymous, status) VALUES
-- Phản ánh công khai của SV001
('Điều hòa phòng 402 H3 không hoạt động', 'Hôm nay chúng em học ca 2 tại phòng 402 tòa nhà H3 nhưng điều hòa bật không mát, thời tiết rất nóng mong nhà trường sửa chữa sớm.', 2, 1, FALSE, 'pending'),

-- Phản ánh ẩn danh của SV002
('Ý kiến về thái độ phục vụ tại Căng tin', 'Thái độ phục vụ của nhân viên căng tin khu B rất khó chịu khi sinh viên mua đồ. Ngoài ra chất lượng vệ sinh khay ăn chưa tốt.', 3, 2, TRUE, 'pending'),

-- Phản ánh đã được xử lý (Công khai)
('Wifi thư viện quá yếu không kết nối được', 'Mạng wifi sinh viên tại tầng 2 thư viện rất chập chờn, không thể tra cứu tài liệu học tập.', 2, 1, FALSE, 'resolved');

-- Chèn phản hồi tương ứng cho phản ánh đã được xử lý
INSERT INTO responses (feedback_id, staff_id, response_content) VALUES
(3, 3, 'Nhà trường đã cử kỹ thuật kiểm tra và thay mới bộ phát wifi (Access Point) tại tầng 2 thư viện vào sáng nay. Các em sinh viên có thể kết nối bình thường.');