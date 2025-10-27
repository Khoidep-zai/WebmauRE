# Hệ thống Chia sẻ Thông tin - Van Lang University

Ứng dụng web cho sinh viên Van Lang University chia sẻ thông tin trong ký túc xá (KTX).

## Chức năng (UA1_Chia sẻ thông tin)

### 1. Đăng nhập
- Nhập Email VLU
- Nhập Password
- Click "Đăng nhập"

### 2. Tạo bài viết mới
- Chọn loại bài viết:
  - **Thông báo**: Đăng các thông báo quan trọng
  - **Hỏi đáp**: Đặt câu hỏi và nhận câu trả lời
  - **Trao đổi**: Thảo luận và trao đổi ý kiến

### 3. Đăng bài viết
- Nhập tiêu đề bài viết
- Nhập nội dung
- Thêm tags (phân cách bằng dấu phẩy)
- Thêm hình ảnh/đính kèm (tùy chọn)
- Chọn quyền hiển thị:
  - Công khai
  - Nội bộ KTX
- Click "Đăng bài"

### 4. Xem phản hồi và tương tác
- Hiển thị bài viết trên bảng tin
- Sinh viên khác có thể like và comment
- Tác giả nhận thông báo khi có phản hồi
- Tác giả có thể chỉnh sửa/xóa (trong thời gian cho phép)

## Cấu trúc File

```
mauweb/
├── index.html          # Trang lớp học (giao diện ban đầu)
├── login.html          # Trang đăng nhập
├── feed.html           # Trang bảng tin chính
├── styles.css          # CSS cho trang lớp học và sidebar
├── login.css           # CSS cho trang đăng nhập
├── feed.css            # CSS cho trang bảng tin
├── login.js            # JavaScript cho đăng nhập
├── feed.js             # JavaScript cho bảng tin
├── logo/
│   └── vanlang.png     # Logo VanLang
└── README.md           # File hướng dẫn này
```

## Cách sử dụng

1. Mở file `login.html` trong trình duyệt
2. Đăng nhập bằng email VLU (ví dụ: student@vlu.edu.vn) và password
3. Sau khi đăng nhập, bạn sẽ được chuyển đến trang bảng tin
4. Nhấn nút "Viết bài" để tạo bài viết mới
5. Chọn loại bài viết: Thông báo, Hỏi đáp, hoặc Trao đổi
6. Điền thông tin và đăng bài
7. Tương tác với bài viết bằng nút Like và Comment

## Tính năng nổi bật

- ✅ Đăng nhập an toàn (lưu session trong localStorage)
- ✅ Tạo bài viết với 3 loại khác nhau
- ✅ Upload hình ảnh
- ✅ Phân quyền hiển thị (Công khai/Nội bộ)
- ✅ Hệ thống like và comment
- ✅ Thông báo khi có tương tác mới
- ✅ Tags để phân loại bài viết
- ✅ Giao diện đẹp, responsive

## Business Rules

- Sinh viên phải có tài khoản để truy cập hệ thống
- Chỉ sinh viên đăng nhập mới có thể tạo bài viết
- Tất cả sinh viên đăng nhập đều có thể xem và tương tác với bài viết
- Bài viết nội bộ KTX chỉ dành cho sinh viên KTX

## Ghi chú

- Dữ liệu được lưu trữ trong localStorage của trình duyệt
- Để xóa dữ liệu, clear localStorage trong Developer Tools
- Ứng dụng sử dụng Font Awesome icons

---

**Bản quyền thuộc Van Lang university © 2021.**
VanLang make with ❤️

