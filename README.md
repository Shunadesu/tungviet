# Zuna Tungviet - E-Commerce MERN Stack

Dự án thương mại điện tử cây cảnh với kiến trúc MERN Stack (MongoDB, Express.js, React, Node.js).

## Cấu trúc dự án

```
zuna-tungviet/
├── server/          # Backend API (Express + MongoDB)
├── client/          # Frontend cho khách hàng (React + Vite)
├── admin/           # Dashboard quản trị (React + Vite)
├── README.md        # Tài liệu chi tiết
├── install.bat      # Script cài đặt (Windows)
└── install.sh       # Script cài đặt (Linux/Mac)
```

## Yêu cầu

- **Node.js** v18.x trở lên
- **MongoDB** v6.x trở lên
- **npm** hoặc **yarn**

## Cài đặt

### Cách 1: Sử dụng script (Khuyến nghị)

**Windows:**

```bash
.\install.bat
```

**Linux/Mac:**

```bash
chmod +x install.sh
./install.sh
```

### Cách 2: Cài đặt thủ công

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# Admin
cd ../admin
npm install
```

## Khởi chạy

### 1. Khởi động MongoDB

Đảm bảo MongoDB đang chạy:

```bash
mongod
```

### 2. Seed Data (Lần đầu tiên)

```bash
cd server
npm run seed
```

Điều này sẽ tạo:

- 1 tài khoản admin: `admin@zuna.vn` / `admin123`
- 5 danh mục
- 20 sản phẩm mẫu

### 3. Chạy Server

```bash
cd server
npm run dev
```

Server chạy tại: http://localhost:9007

### 4. Chạy Client (Terminal mới)

```bash
cd client
npm run dev
```

Client chạy tại: http://localhost:3000

### 5. Chạy Admin Dashboard (Terminal mới)

```bash
cd admin
npm run dev
```

Admin chạy tại: http://localhost:3001

## Tài khoản Demo

| Vai trò | Email         | Mật khẩu |
| ------- | ------------- | -------- |
| Admin   | admin@zuna.vn | admin123 |

## Tính năng

### Client (Frontend)

- Trang chủ với banner và sản phẩm nổi bật
- Danh sách sản phẩm với bộ lọc
- Chi tiết sản phẩm
- Giỏ hàng
- Thanh toán
- Lịch sử đơn hàng
- Đăng nhập / Đăng ký

### Admin Dashboard

- Dashboard với thống kê
- Quản lý sản phẩm (CRUD)
- Quản lý danh mục (CRUD)
- Quản lý đơn hàng
- Cập nhật trạng thái đơn hàng

## API Endpoints

### Public Routes

- `GET /api/public/products` - Danh sách sản phẩm
- `GET /api/public/products/:id` - Chi tiết sản phẩm
- `GET /api/public/categories` - Danh sách danh mục

### Client Routes (Cần auth)

- `POST /api/client/orders` - Tạo đơn hàng
- `GET /api/client/orders` - Danh sách đơn hàng của tôi

### Admin Routes (Cần auth admin)

- `GET/POST /api/admin/products` - CRUD sản phẩm
- `GET/POST /api/admin/categories` - CRUD danh mục
- `GET /api/admin/orders` - Danh sách đơn hàng
- `PUT /api/admin/orders/:id/status` - Cập nhật trạng thái

## Công nghệ sử dụng

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

### Frontend (Client & Admin)

- React 18 + Vite
- Tailwind CSS
- Framer Motion (animations)
- React Icons
- Swiper.js (carousel)
- React Quill (rich text editor)
- Axios

## Design System

### Màu sắc (Xanh lá đậm)

- Primary: `#1B5E20`
- Primary Light: `#2E7D32`
- Primary Dark: `#0D3311`

### Typography

- Font: Inter, sans-serif
- Spacing: p-2, gap-2 (padding tối thiểu)

## Giấy phép

MIT License
