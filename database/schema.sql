-- ============================================================================
-- LAPTOP E-COMMERCE DATABASE SCHEMA (OPTIMIZED FOR LOW-RESOURCE AWS T3.SMALL)
-- Target RDBMS: Microsoft SQL Server (SSMS Compatible)
-- Max Memory Target: <= 512MB RAM
-- Architecture: 3NF Normalized, 8 Core Tables, Minimal Index Overhead
-- ============================================================================

-- BƯỚC 1: CẤU HÌNH CỨNG GIỚI HẠN RAM CHO SQL SERVER (TỐI ƯU T3.SMALL)
-- Ngăn SQL Server chiếm dụng buffer pool vượt quá 512MB gây OOM trên host 2GB
USE master;
GO

EXEC sp_configure 'show advanced options', 1;
RECONFIGURE WITH OVERRIDE;
GO

-- Giới hạn cứng bộ nhớ tối đa của SQL Server là 512 Megabytes
EXEC sp_configure 'max server memory (MB)', 512;
RECONFIGURE WITH OVERRIDE;
GO

-- BƯỚC 2: KHỞI TẠO CƠ SỞ DỮ LIỆU
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'LaptopDB')
BEGIN
    CREATE DATABASE LaptopDB
    COLLATE Vietnamese_CI_AS;
END
GO

USE LaptopDB;
GO

-- XÓA BẢNG NẾU TỒN TẠI (THỨ TỰ PHỤ THUỘC KHÓA NGOẠI)
IF OBJECT_ID('Reviews', 'U') IS NOT NULL DROP TABLE Reviews;
IF OBJECT_ID('OrderItems', 'U') IS NOT NULL DROP TABLE OrderItems;
IF OBJECT_ID('Orders', 'U') IS NOT NULL DROP TABLE Orders;
IF OBJECT_ID('ProductVariants', 'U') IS NOT NULL DROP TABLE ProductVariants;
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
IF OBJECT_ID('Brands', 'U') IS NOT NULL DROP TABLE Brands;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO

-- ============================================================================
-- 1. BẢNG USERS: Người dùng hệ thống (Admin & Khách hàng đã đăng ký)
-- ============================================================================
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CONSTRAINT CK_Users_Role CHECK (Role IN ('CUSTOMER', 'ADMIN', 'STAFF')),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ============================================================================
-- 2. BẢNG CATEGORIES: Danh mục Laptop (Gaming, Doanh nhân, Văn phòng, Đồ họa)
-- ============================================================================
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug VARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ============================================================================
-- 3. BẢNG BRANDS: Thương hiệu Laptop (Apple, Dell, Asus, Lenovo, HP...)
-- ============================================================================
CREATE TABLE Brands (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug VARCHAR(100) NOT NULL UNIQUE,
    LogoUrl NVARCHAR(255) NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);
GO

-- ============================================================================
-- 4. BẢNG PRODUCTS: Thông tin sản phẩm cốt lõi (Không lưu variant tại đây để đạt 3NF)
-- ============================================================================
CREATE TABLE Products (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL,
    BrandId INT NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Slug VARCHAR(200) NOT NULL UNIQUE,
    ThumbnailUrl NVARCHAR(500) NOT NULL,
    Summary NVARCHAR(500) NULL,
    Description NVARCHAR(MAX) NULL,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Products_Brands FOREIGN KEY (BrandId) REFERENCES Brands(Id) ON DELETE NO ACTION
);
GO

-- ============================================================================
-- 5. BẢNG PRODUCTVARIANTS: Biến thể cấu hình phần cứng và giá
-- Tách cấu hình linh hoạt: CPU, RAM, Ổ cứng, Card đồ họa, Màn hình, Màu sắc
-- ============================================================================
CREATE TABLE ProductVariants (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    SKU VARCHAR(50) NOT NULL UNIQUE,
    Cpu NVARCHAR(100) NOT NULL,               -- VD: Apple M2, Core i7-1360P, Ryzen 7 7735HS
    RamGb INT NOT NULL,                       -- 8, 16, 32, 64 (Tiết kiệm bộ nhớ so với chuỗi)
    Storage NVARCHAR(100) NOT NULL,           -- VD: 512GB SSD NVMe
    Vga NVARCHAR(100) NULL,                   -- VD: RTX 4060 8GB, Intel Iris Xe
    ScreenSize NVARCHAR(50) NOT NULL,         -- VD: 13.6 inch Liquid Retina, 14 inch OLED 120Hz
    Color NVARCHAR(50) NOT NULL,              -- VD: Space Gray, Platinum Silver, Midnight
    Price DECIMAL(12, 0) NOT NULL,            -- Giá bán hiện tại (VND)
    OriginalPrice DECIMAL(12, 0) NULL,        -- Giá niêm yết (nếu có giảm giá)
    StockQuantity INT NOT NULL DEFAULT 0,     -- Tồn kho biến thể
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Variants_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- 6. BẢNG ORDERS: Đơn hàng (Hỗ trợ cả khách vãng lai COD lẫn khách có tài khoản)
-- ============================================================================
CREATE TABLE Orders (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderCode VARCHAR(30) NOT NULL UNIQUE,     -- Mã định danh hiển thị: ORD-20261027-XXXX
    UserId INT NULL,                           -- Có thể NULL nếu khách mua nhanh không cần đăng nhập
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone VARCHAR(20) NOT NULL,
    CustomerEmail NVARCHAR(100) NULL,
    ShippingAddress NVARCHAR(300) NOT NULL,
    Note NVARCHAR(500) NULL,
    TotalAmount DECIMAL(12, 0) NOT NULL,       -- Tổng tiền thanh toán
    PaymentMethod VARCHAR(20) NOT NULL DEFAULT 'COD' CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentMethod IN ('COD', 'BANKING')),
    Status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CONSTRAINT CK_Orders_Status CHECK (Status IN ('PENDING', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED')),
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
);
GO

-- ============================================================================
-- 7. BẢNG ORDERITEMS: Chi tiết các mặt hàng trong đơn
-- Lưu snapshot tên và cấu hình tại thời điểm mua phòng khi sản phẩm đổi giá
-- ============================================================================
CREATE TABLE OrderItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL,
    VariantId INT NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    VariantInfo NVARCHAR(300) NOT NULL,        -- VD: CPU M2 / 16GB / 512GB / Midnight
    Price DECIMAL(12, 0) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Subtotal DECIMAL(12, 0) NOT NULL,
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) REFERENCES Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Variants FOREIGN KEY (VariantId) REFERENCES ProductVariants(Id) ON DELETE NO ACTION
);
GO

-- ============================================================================
-- 8. BẢNG REVIEWS: Đánh giá và nhận xét sản phẩm từ khách hàng
-- ============================================================================
CREATE TABLE Reviews (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL,
    CustomerName NVARCHAR(100) NOT NULL,
    Rating TINYINT NOT NULL CONSTRAINT CK_Reviews_Rating CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Reviews_Products FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE
);
GO

-- ============================================================================
-- CHIẾN LƯỢC ĐẶT INDEX SIÊU GỌN - TIẾT KIỆM BỘ NHỚ RAM BUFFER POOL
-- Chỉ tạo index trên các cột có tần suất WHERE / JOIN / ORDER BY cao nhất
-- Tránh tạo index dư thừa gây phình dung lượng RAM và overhead khi INSERT/UPDATE
-- ============================================================================

-- 1. Index tìm kiếm sản phẩm theo Slug (Trang chi tiết sản phẩm)
CREATE NONCLUSTERED INDEX IX_Products_Slug
ON Products(Slug)
INCLUDE (Id, Name, CategoryId, BrandId, ThumbnailUrl);
GO

-- 2. Index lọc sản phẩm theo danh mục và thương hiệu
CREATE NONCLUSTERED INDEX IX_Products_Category_Brand
ON Products(CategoryId, BrandId)
WHERE IsActive = 1;
GO

-- 3. Index sắp xếp và lọc giá laptop theo variant
CREATE NONCLUSTERED INDEX IX_ProductVariants_Price
ON ProductVariants(Price, RamGb)
INCLUDE (ProductId, Cpu);
GO

-- 4. Index tra cứu đơn hàng theo OrderCode (Khách tra cứu đơn) và Phone
CREATE NONCLUSTERED INDEX IX_Orders_OrderCode
ON Orders(OrderCode);
GO

CREATE NONCLUSTERED INDEX IX_Orders_Phone
ON Orders(CustomerPhone);
GO

PRINT N'>>> HOÀN TẤT THIẾT LẬP CƠ SỞ DỮ LIỆU VÀ CẤU HÌNH MAX MEMORY 512MB CHO SQL SERVER!';
GO
