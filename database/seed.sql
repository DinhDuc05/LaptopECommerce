-- ============================================================================
-- LAPTOP E-COMMERCE SEED DATA
-- Target: 5 Realistic Laptops with Real Hardware Specs, Categories, Brands,
-- Users, ProductVariants, Orders, and Reviews
-- ============================================================================

USE LaptopDB;
GO

SET NOCOUNT ON;

-- 1. SEED USERS
-- Mật khẩu mặc định băm sẵn (bcrypt): "Admin@123" và "Customer@123"
INSERT INTO Users (Email, PasswordHash, FullName, Phone, Role)
VALUES 
(N'admin@laptopstore.vn', N'$2a$12$K8/g.d43Y398gM84dK0hyeqX7z8d2A4Z6yO7aMvUf6H1gS9u2W0jK', N'Quản Trị Viên', '0901234567', 'ADMIN'),
(N'nguyenvana@gmail.com', N'$2a$12$K8/g.d43Y398gM84dK0hyeqX7z8d2A4Z6yO7aMvUf6H1gS9u2W0jK', N'Nguyễn Văn A', '0987654321', 'CUSTOMER');

-- 2. SEED CATEGORIES
INSERT INTO Categories (Name, Slug, Description, DisplayOrder)
VALUES
(N'Laptop Mỏng Nhẹ', 'laptop-mong-nhe', N'Laptop Ultrabook siêu mỏng nhẹ, pin trâu, tiện di chuyển', 1),
(N'Laptop Doanh Nhân', 'laptop-doanh-nhan', N'Thiết kế sang trọng, bảo mật vân tay/nhận diện gương mặt cao cấp', 2),
(N'Laptop Gaming', 'laptop-gaming', N'Cấu hình khủng, card đồ họa rời chuyên chiến game và đồ họa 3D', 3),
(N'Laptop Sinh Viên - Văn Phòng', 'laptop-sinh-vien-van-phong', N'Giá cả hợp lý, đáp ứng mượt mà Word, Excel, học tập online', 4),
(N'Laptop Đồ Họa - Kỹ Thuật', 'laptop-do-hoa-ky-thuat', N'Màn hình chuẩn màu, hiệu năng CPU và GPU đa nhân mạnh mẽ', 5);

-- 3. SEED BRANDS
INSERT INTO Brands (Name, Slug, LogoUrl)
VALUES
(N'Apple', 'apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'),
(N'Dell', 'dell', 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg'),
(N'Asus', 'asus', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg'),
(N'Lenovo', 'lenovo', 'https://upload.wikimedia.org/wikipedia/commons/2/28/Lenovo_logo_2015.svg'),
(N'HP', 'hp', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg');

-- 4. SEED PRODUCTS
-- 1. Apple MacBook Air M2 13.6 inch
INSERT INTO Products (CategoryId, BrandId, Name, Slug, ThumbnailUrl, Summary, Description, IsFeatured, IsActive)
VALUES (
    1, -- Laptop Mỏng Nhẹ
    1, -- Apple
    N'Apple MacBook Air M2 13.6 inch',
    'apple-macbook-air-m2-13-6-inch',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
    N'MacBook Air M2 thiết kế hoàn toàn mới, siêu mỏng 11.3mm, chip Apple M2 tiết kiệm điện, pin tới 18 giờ.',
    N'MacBook Air M2 mang ngôn ngữ thiết kế phẳng hiện đại của dòng Pro, trang bị màn hình Liquid Retina 13.6 inch sắc nét với độ sáng 500 nits. Chip Apple M2 cung cấp hiệu năng vượt trội cho công việc văn phòng, lập trình và chỉnh sửa hình ảnh mượt mà, cổng sạc MagSafe 3 tiện lợi.',
    1,
    1
);

-- 2. Dell XPS 13 Plus 9320
INSERT INTO Products (CategoryId, BrandId, Name, Slug, ThumbnailUrl, Summary, Description, IsFeatured, IsActive)
VALUES (
    2, -- Laptop Doanh Nhân
    2, -- Dell
    N'Dell XPS 13 Plus 9320',
    'dell-xps-13-plus-9320',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60',
    N'Đỉnh cao thiết kế tương lai với bàn phím tràn viền, touch bar điện dung và trackpad ẩn kính cảm ứng haptic.',
    N'Dell XPS 13 Plus 9320 định nghĩa lại phong cách laptop doanh nhân cao cấp. Vỏ nhôm nguyên khối cắt CNC tinh xảo, màn hình OLED độ phân giải cao chuẩn màu DCI-P3 100%, vi xử lý Intel Core i7 Gen 13 mạnh mẽ đáp ứng mọi tác vụ chuyên nghiệp.',
    1,
    1
);

-- 3. Asus ROG Zephyrus G14
INSERT INTO Products (CategoryId, BrandId, Name, Slug, ThumbnailUrl, Summary, Description, IsFeatured, IsActive)
VALUES (
    3, -- Laptop Gaming
    3, -- Asus
    N'Asus ROG Zephyrus G14 GA402',
    'asus-rog-zephyrus-g14-ga402',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
    N'Laptop gaming 14 inch mỏng nhẹ đỉnh cao nhất thế giới với chip AMD Ryzen 7000 series và card đồ họa NVIDIA RTX 40 series.',
    N'Asus ROG Zephyrus G14 kết hợp sự di động tuyệt đối và sức mạnh đồ họa bùng nổ. Trọng lượng chỉ 1.65kg, màn hình ROG Nebula Display 165Hz QHD+ cực kỳ rực rỡ, hệ thống tản nhiệt buồng hơi kim loại lỏng Liquid Metal giữ máy luôn mát mẻ.',
    1,
    1
);

-- 4. Lenovo ThinkPad T14s Gen 4
INSERT INTO Products (CategoryId, BrandId, Name, Slug, ThumbnailUrl, Summary, Description, IsFeatured, IsActive)
VALUES (
    2, -- Laptop Doanh Nhân
    4, -- Lenovo
    N'Lenovo ThinkPad T14s Gen 4',
    'lenovo-thinkpad-t14s-gen-4',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=60',
    N'Chiến binh doanh nghiệp bền bỉ chuẩn quân đội Mỹ MIL-STD-810H, bàn phím gõ êm số 1 thế giới.',
    N'Lenovo ThinkPad T14s Gen 4 là sự lựa chọn số 1 cho các chuyên gia công nghệ, lập trình viên và nhà quản lý. Khung vỏ sợi carbon siêu nhẹ, bàn phím ThinkPad trứ danh có hành trình phím sâu, bảo mật vân tay tích hợp nút nguồn và gạt che camera vật lý ThinkShutter.',
    0,
    1
);

-- 5. HP Pavilion 15 eg3000
INSERT INTO Products (CategoryId, BrandId, Name, Slug, ThumbnailUrl, Summary, Description, IsFeatured, IsActive)
VALUES (
    4, -- Sinh Viên - Văn Phòng
    5, -- HP
    N'HP Pavilion 15 eg3000',
    'hp-pavilion-15-eg3000',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=60',
    N'Laptop học tập - văn phòng màn hình lớn 15.6 inch viền mỏng, thiết kế thanh lịch, âm thanh B&O chất lượng.',
    N'HP Pavilion 15 là mẫu laptop toàn diện cho sinh viên và nhân viên văn phòng. Màn hình IPS Full HD chống chói, bàn phím số phụ NumPad tiện lợi nhập liệu kế toán, vi xử lý Intel Core thế hệ 13 đảm bảo chạy tốt mọi ứng dụng văn phòng, lướt web, học online.',
    0,
    1
);

-- 5. SEED PRODUCT VARIANTS
-- Product 1: Apple MacBook Air M2 (Id: 1)
INSERT INTO ProductVariants (ProductId, SKU, Cpu, RamGb, Storage, Vga, ScreenSize, Color, Price, OriginalPrice, StockQuantity)
VALUES
(1, 'MBA-M2-8-256-GRY', N'Apple M2 (8 CPU / 8 GPU)', 8, N'256GB SSD', N'Apple M2 8-core GPU', N'13.6 inch Liquid Retina', N'Space Gray', 24990000, 27990000, 15),
(1, 'MBA-M2-16-512-MID', N'Apple M2 (8 CPU / 10 GPU)', 16, N'512GB SSD', N'Apple M2 10-core GPU', N'13.6 inch Liquid Retina', N'Midnight', 31990000, 34990000, 8);

-- Product 2: Dell XPS 13 Plus 9320 (Id: 2)
INSERT INTO ProductVariants (ProductId, SKU, Cpu, RamGb, Storage, Vga, ScreenSize, Color, Price, OriginalPrice, StockQuantity)
VALUES
(2, 'XPS-9320-16-512-SLV', N'Intel Core i7-1360P (12 nhân 16 luồng)', 16, N'512GB PCIe 4.0 SSD', N'Intel Iris Xe Graphics', N'13.4 inch FHD+ InfinityEdge', N'Platinum Silver', 36500000, 39500000, 10),
(2, 'XPS-9320-32-1TB-GRP', N'Intel Core i7-1360P (12 nhân 16 luồng)', 32, N'1TB PCIe 4.0 SSD', N'Intel Iris Xe Graphics', N'13.4 inch 3.5K OLED Touch', N'Graphite', 43900000, 48000000, 5);

-- Product 3: Asus ROG Zephyrus G14 (Id: 3)
INSERT INTO ProductVariants (ProductId, SKU, Cpu, RamGb, Storage, Vga, ScreenSize, Color, Price, OriginalPrice, StockQuantity)
VALUES
(3, 'ROG-G14-R7-16-4050-GRY', N'AMD Ryzen 7 7735HS', 16, N'512GB NVMe Gen4', N'NVIDIA GeForce RTX 4050 6GB', N'14 inch QHD+ 165Hz IPS', N'Eclipse Gray', 29990000, 33500000, 12),
(3, 'ROG-G14-R9-32-4060-WHT', N'AMD Ryzen 9 7940HS', 32, N'1TB NVMe Gen4', N'NVIDIA GeForce RTX 4060 8GB', N'14 inch QHD+ 165Hz Nebula', N'Moonlight White', 39990000, 44000000, 6);

-- Product 4: Lenovo ThinkPad T14s Gen 4 (Id: 4)
INSERT INTO ProductVariants (ProductId, SKU, Cpu, RamGb, Storage, Vga, ScreenSize, Color, Price, OriginalPrice, StockQuantity)
VALUES
(4, 'TP-T14S-I5-16-512-BLK', N'Intel Core i5-1335U', 16, N'512GB SSD NVMe Opal', N'Intel Iris Xe Graphics', N'14 inch WUXGA IPS Low Power', N'Thunder Black', 26490000, 28900000, 14),
(4, 'TP-T14S-R7-32-1TB-BLK', N'AMD Ryzen 7 PRO 7840U', 32, N'1TB SSD NVMe Opal', N'AMD Radeon 780M', N'14 inch 2.8K OLED 90Hz', N'Deep Black', 33800000, 37500000, 7);

-- Product 5: HP Pavilion 15 eg3000 (Id: 5)
INSERT INTO ProductVariants (ProductId, SKU, Cpu, RamGb, Storage, Vga, ScreenSize, Color, Price, OriginalPrice, StockQuantity)
VALUES
(5, 'HP-PAV15-I5-8-512-SLV', N'Intel Core i5-1335U', 8, N'512GB SSD PCIe NVMe', N'Intel Iris Xe Graphics', N'15.6 inch FHD IPS BrightView', N'Natural Silver', 14890000, 16990000, 20),
(5, 'HP-PAV15-I7-16-512-GLD', N'Intel Core i7-1355U', 16, N'512GB SSD PCIe NVMe', N'Intel Iris Xe Graphics', N'15.6 inch FHD IPS', N'Warm Gold', 18990000, 21500000, 15);

-- 6. SEED ORDERS VÀ ORDERITEMS (Mẫu đơn hàng COD và trực tuyến)
INSERT INTO Orders (OrderCode, UserId, CustomerName, CustomerPhone, CustomerEmail, ShippingAddress, Note, TotalAmount, PaymentMethod, Status)
VALUES
('ORD-20261027-001', 2, N'Nguyễn Văn A', '0987654321', N'nguyenvana@gmail.com', N'Số 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', N'Giao giờ hành chính, gọi trước khi đến', 24990000, 'COD', 'COMPLETED'),
('ORD-20261027-002', NULL, N'Trần Thị B', '0912345678', N'tranthib@hotmail.com', N'Số 45 Cầu Giấy, Quận Cầu Giấy, Hà Nội', N'Kiểm tra hàng trước khi nhận', 29990000, 'COD', 'PROCESSING');

-- OrderItems cho Order 1
INSERT INTO OrderItems (OrderId, VariantId, ProductName, VariantInfo, Price, Quantity, Subtotal)
VALUES
(1, 1, N'Apple MacBook Air M2 13.6 inch', N'M2 8-Core / 8GB RAM / 256GB SSD / Space Gray', 24990000, 1, 24990000);

-- OrderItems cho Order 2
INSERT INTO OrderItems (OrderId, VariantId, ProductName, VariantInfo, Price, Quantity, Subtotal)
VALUES
(2, 5, N'Asus ROG Zephyrus G14 GA402', N'Ryzen 7 7735HS / 16GB RAM / 512GB SSD / RTX 4050 / Eclipse Gray', 29990000, 1, 29990000);

-- 7. SEED REVIEWS
INSERT INTO Reviews (ProductId, CustomerName, Rating, Comment)
VALUES
(1, N'Lê Minh Tuấn', 5, N'Máy cực kỳ mượt mà, pin dùng cả ngày từ sáng đến tối vẫn còn 30%. Rất đáng đồng tiền bát gạo!'),
(1, N'Đặng Phương Thảo', 5, N'Thiết kế mỏng nhẹ mang đi cà phê làm việc rất tiện, màn hình đẹp sắc nét, loa nghe rất hay.'),
(2, N'Hoàng Nam', 5, N'Bàn phím và trackpad ẩn của XPS 13 Plus nhìn như đến từ tương lai, build cực chắc chắn.'),
(3, N'Vũ Quốc Huy', 5, N'Vừa chiến mượt Cyberpunk 2077 vừa mang đi làm việc văn phòng không bị hầm hố quá mức. Rất thích!'),
(4, N'Nguyễn Hoàng Bách', 5, N'Bàn phím ThinkPad vẫn là tượng đài gõ code, hành trình phím sâu, máy nhẹ và rất bền.'),
(5, N'Phạm Thu Trang', 4, N'Máy đẹp, phím số gõ nhập liệu kế toán tiện. Tầm giá 14 triệu quá ổn cho sinh viên và văn phòng.');
GO

PRINT N'>>> HOÀN TẤT NẠP DỮ LIỆU SEED CHO 5 DÒNG LAPTOP THỰC TẾ!';
GO
