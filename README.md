# LAPTOP E-COMMERCE - ULTRA LIGHTWEIGHT CLOUD ARCHITECTURE
### Hệ Thống Bán Laptop Thương Mại Điện Tử Siêu Nhẹ Tối Ưu Cho AWS EC2 t3.small

Dự án được thiết kế chuyên biệt cho các môi trường điện toán đám mây giới hạn tài nguyên (Low-Resource Environment) như **AWS EC2 t3.small** (2 vCPU burstable, 2GB RAM vật lý). Toàn bộ kiến trúc được tối ưu hóa để tổng lượng RAM tiêu thụ của toàn bộ hệ thống (kể cả Database, Backend, Frontend và Nginx) **không vượt quá 1GB RAM**, triệt tiêu hoàn toàn rủi ro bị Linux OOM Killer dừng tiến trình.

---

## 📊 1. BẢNG PHÂN BỔ BỘ NHỚ RAM (BUDGET MEMORY BREAKDOWN)

| Thành phần | Công nghệ | Cấu hình giới hạn cứng | RAM thực tế hoạt động |
| :--- | :--- | :--- | :--- |
| **Database** | Microsoft SQL Server (SSMS) | `max server memory = 512MB` | ~400MB - 512MB |
| **Backend API** | Node.js + Express + TypeScript + Prisma | `--max-old-space-size=256` | ~80MB - 120MB |
| **Frontend** | Next.js (App Router, Standalone mode) | `--max-old-space-size=256` | ~60MB - 110MB |
| **Reverse Proxy**| Nginx Alpine (1 worker, gzip level 6) | `memory limit = 64MB` | ~15MB - 25MB |
| **Hệ điều hành** | Linux OS / Kernel buffer / cache | Dành sẵn ~500MB | ~350MB - 500MB |
| **TỔNG CỘNG** | **Toàn bộ hệ thống** | **An toàn trong 2GB RAM** | **~900MB - 1.2GB** |

---

## 📁 2. CẤU TRÚC THƯ MỤC DỰ ÁN TẠI `D:\LaptopECommerce`

```text
D:\LaptopECommerce
├── database/
│   ├── schema.sql           # Script cấu hình max server memory 512MB & tạo 8 bảng 3NF
│   └── seed.sql             # Dữ liệu mẫu 5 dòng laptop thực tế, variants, reviews, orders
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình env & Prisma connection pooling (limit=5)
│   │   ├── controllers/     # Controller: Product, Category, Order, Admin
│   │   ├── middlewares/     # Helmet, Compression gzip, RateLimiter chống spam
│   │   ├── routes/          # API Routes & Healthcheck giám sát RAM
│   │   ├── services/        # Store Service (Hỗ trợ SQL Server & In-memory Fallback)
│   │   ├── types/           # Định nghĩa TypeScript interfaces siêu nhẹ
│   │   ├── app.ts           # Cấu hình Express App
│   │   └── server.ts        # Entrypoint máy chủ & Graceful shutdown
│   ├── prisma/
│   │   └── schema.prisma    # Prisma schema chuẩn hóa cho SQL Server
│   ├── Dockerfile           # Multi-stage build node-alpine, max-old-space-size=256
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (Trang chủ, Chi tiết, Giỏ hàng, Tra cứu, Admin)
│   │   ├── components/      # Navbar, Footer, ProductCard, FilterSidebar
│   │   ├── lib/             # API client & LocalStorage Cart store (0 byte RAM server)
│   │   └── types/           # Kiểu dữ liệu UI
│   ├── next.config.mjs      # Cấu hình Standalone build giảm kích thước
│   ├── tailwind.config.js   # Tailwind CSS
│   └── package.json
└── deploy/
    ├── Dockerfile.backend   # Dockerfile Backend cho môi trường production
    ├── Dockerfile.frontend  # Dockerfile Next.js Standalone
    ├── nginx.conf           # Cấu hình Nginx reverse proxy nén gzip & buffer thấp
    └── docker-compose.yml   # Compose file với cờ limits tài nguyên CPU/RAM
```

---

## 🗄️ 3. CƠ SỞ DỮ LIỆU & SQL SERVER (SSMS)

### Câu lệnh giới hạn cứng RAM 512MB:
Mở **SQL Server Management Studio (SSMS)**, kết nối vào server và chạy:
```sql
USE master;
GO
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE WITH OVERRIDE;
GO
EXEC sp_configure 'max server memory (MB)', 512;
RECONFIGURE WITH OVERRIDE;
GO
```

### Chuẩn hóa 3NF gồm 8 bảng:
1. `Users`: Admin & Khách hàng.
2. `Categories`: Phân loại laptop (Mỏng nhẹ, Gaming, Doanh nhân, Văn phòng, Đồ họa).
3. `Brands`: Thương hiệu (Apple, Dell, Asus, Lenovo, HP).
4. `Products`: Thông tin chung của máy (không lưu cấu hình tại đây để đạt 3NF).
5. `ProductVariants`: Cấu hình chi tiết (CPU, RAM, Ổ cứng, VGA, Màn hình, Màu sắc, Giá, Tồn kho).
6. `Orders`: Đơn hàng (Hỗ trợ COD, mã đơn duy nhất `ORD-...`).
7. `OrderItems`: Chi tiết mặt hàng đã mua (Lưu snapshot giá & thông số tại thời điểm mua).
8. `Reviews`: Đánh giá 1-5 sao và nhận xét từ người dùng.

### Nạp schema và dữ liệu:
1. Thực thi toàn bộ file [database/schema.sql](file:///D:/LaptopECommerce/database/schema.sql).
2. Thực thi toàn bộ file [database/seed.sql](file:///D:/LaptopECommerce/database/seed.sql).

---

## 💻 4. HƯỚNG DẪN CHẠY THỬ CỤC BỘ (LOCAL DEVELOPMENT)

### Chạy Backend API (Port 5000):
```bash
cd D:\LaptopECommerce\backend
npm install
npm run dev
```
> **Lưu ý**: Endpoint kiểm tra sức khỏe và RAM usage trực quan:  
> `http://localhost:5000/api/health`

### Chạy Frontend Next.js (Port 3000):
```bash
cd D:\LaptopECommerce\frontend
npm install
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🐳 5. TRIỂN KHAI VỚI DOCKER COMPOSE TRÊN AWS T3.SMALL

Trên máy chủ AWS EC2 (Ubuntu / Amazon Linux), cài đặt Docker và Docker Compose rồi thực hiện:

```bash
cd /opt/LaptopECommerce/deploy
docker compose up -d --build
```

Kiểm tra giới hạn RAM của các container đang chạy:
```bash
docker stats
```
Bạn sẽ thấy `laptop_backend`, `laptop_frontend`, `laptop_nginx` hoạt động cực kỳ nhẹ nhàng với giới hạn cứng CPU và RAM được bảo vệ tuyệt đối trong file `deploy/docker-compose.yml`.

### CI/CD với GitHub Actions và Docker Hub

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) build hai image từ build context thư mục gốc, đẩy lên Docker Hub rồi SSH vào EC2 để chạy:

```bash
docker compose -f deploy/docker-compose.yml pull
docker compose -f deploy/docker-compose.yml up -d --remove-orphans
```

Khai báo các GitHub Actions Secrets sau:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `EC2_HOST`
- `EC2_USERNAME`
- `EC2_SSH_KEY`
- `EC2_APP_DIR`
- `MSSQL_SA_PASSWORD`
- `DATABASE_URL`
- `FRONTEND_URL` (thường là `http://localhost`)

Trên EC2, clone project vào `EC2_APP_DIR`, bảo đảm Docker Compose và `curl` đã cài đặt. `DATABASE_URL` production phải trỏ tới service SQL Server bằng hostname `db`, ví dụ:

```text
sqlserver://db:1433;database=LaptopDB;user=sa;password=<secret>;encrypt=true;trustServerCertificate=true;connection_limit=5
```

Không commit secret vào `docker-compose.yml` hoặc repository. Volume `mssql_data` giữ dữ liệu SQL Server qua các lần recreate container.

---

## 🌟 6. CÁC TÍNH NĂNG CHÍNH CỦA ỨNG DỤNG

1. **Khách hàng**:
   - Bộ lọc cấu hình đa năng: CPU (i5, i7, Ryzen, M2), RAM (8GB, 16GB, 32GB), Khoảng giá, Thương hiệu.
   - Chi tiết laptop: Đổi biến thể cập nhật giá và tồn kho tức thì, thông số kỹ thuật chi tiết, đánh giá của người mua.
   - Giỏ hàng LocalStorage: Lưu trữ hoàn toàn tại client, không tiêu tốn 1 byte RAM nào trên server.
   - Thanh toán COD: Đặt hàng nhanh gọn, sinh mã đơn định danh.
   - Tra cứu đơn hàng: Nhập mã đơn hoặc số điện thoại để xem trạng thái đơn (Chờ xác nhận, Đang chuẩn bị, Đang giao, Đã giao).

2. **Quản trị viên (Admin)**:
   - Dashboard: Thống kê tổng doanh thu, số lượng đơn hàng, số máy trong kho.
   - Quản lý laptop: Thêm mới laptop kèm cấu hình biến thể, xem danh sách, xóa máy.
   - Quản lý đơn hàng: Xem danh sách đơn, cập nhật tiến trình đơn hàng theo thời gian thực.
