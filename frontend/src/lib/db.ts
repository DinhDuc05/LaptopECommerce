/**
 * ============================================================================
 * DATABASE ADAPTER LAYER (Server-only fallback store)
 * ============================================================================
 *
 * Express/Prisma/SQL Server là database path chính của ứng dụng.
 * Các route Next.js còn lại chỉ dùng server store này như fallback tương thích;
 * không đọc DATABASE_URL và không khởi tạo kết nối MongoDB.
 */

import { IUser, IProduct, CreateProductInput, ICategory, IBrand } from '../types/models';
import { Order } from '../types';

// ================= DỮ LIỆU SEED MẪU BAN ĐẦU =================
const INITIAL_CATEGORIES: ICategory[] = [
  { id: 1, name: 'Laptop Mỏng Nhẹ', slug: 'laptop-mong-nhe', description: 'Ultrabook siêu nhẹ, pin lâu', displayOrder: 1 },
  { id: 2, name: 'Laptop Doanh Nhân', slug: 'laptop-doanh-nhan', description: 'Thiết kế sang trọng, bảo mật cao cấp', displayOrder: 2 },
  { id: 3, name: 'Laptop Gaming', slug: 'laptop-gaming', description: 'Cấu hình khủng, card đồ họa rời', displayOrder: 3 },
  { id: 4, name: 'Laptop Sinh Viên - Văn Phòng', slug: 'laptop-sinh-vien-van-phong', description: 'Giá hợp lý cho học tập', displayOrder: 4 },
  { id: 5, name: 'Laptop Đồ Họa - Kỹ Thuật', slug: 'laptop-do-hoa-ky-thuat', description: 'Màn hình chuẩn màu, đa nhiệm', displayOrder: 5 },
];

const INITIAL_BRANDS: IBrand[] = [
  { id: 1, name: 'Apple', slug: 'apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 2, name: 'Dell', slug: 'dell', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' },
  { id: 3, name: 'Asus', slug: 'asus', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
  { id: 4, name: 'Lenovo', slug: 'lenovo', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Lenovo_logo_2015.svg' },
  { id: 5, name: 'HP', slug: 'hp', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg' },
];

const INITIAL_USERS: IUser[] = [
  {
    id: 1,
    email: 'thaidinhduc05@gmail.com',
    fullName: 'Thái Đình Đức',
    phone: '0901234567',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-01T08:00:00.000Z',
  },
  {
    id: 2,
    email: 'nguyenvana@gmail.com',
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    role: 'CUSTOMER',
    isActive: true,
    createdAt: '2026-10-15T09:30:00.000Z',
    updatedAt: '2026-10-15T09:30:00.000Z',
  },
  {
    id: 3,
    email: 'tranthib@hotmail.com',
    fullName: 'Trần Thị B',
    phone: '0912345678',
    role: 'CUSTOMER',
    isActive: true,
    createdAt: '2026-10-20T14:15:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z',
  },
];

const INITIAL_PRODUCTS: IProduct[] = [
  {
    id: 1,
    categoryId: 1,
    brandId: 1,
    name: 'Apple MacBook Air M2 13.6 inch',
    slug: 'apple-macbook-air-m2-13-6-inch',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60',
    summary: 'MacBook Air M2 thiết kế hoàn toàn mới, siêu mỏng 11.3mm, chip Apple M2 tiết kiệm điện, pin tới 18 giờ.',
    description: 'MacBook Air M2 mang ngôn ngữ thiết kế phẳng hiện đại của dòng Pro, trang bị màn hình Liquid Retina 13.6 inch sắc nét với độ sáng 500 nits. Chip Apple M2 cung cấp hiệu năng vượt trội cho công việc văn phòng, lập trình và chỉnh sửa hình ảnh mượt mà.',
    isFeatured: true,
    isActive: true,
    createdAt: '2026-10-10T08:00:00.000Z',
    category: INITIAL_CATEGORIES[0],
    brand: INITIAL_BRANDS[0],
    variants: [
      {
        id: 1,
        productId: 1,
        sku: 'MBA-M2-8-256-GRY',
        cpu: 'Apple M2 (8 CPU / 8 GPU)',
        ramGb: 8,
        storage: '256GB SSD',
        vga: 'Apple M2 8-core GPU',
        screenSize: '13.6 inch Liquid Retina',
        color: 'Space Gray',
        price: 24990000,
        originalPrice: 27990000,
        stockQuantity: 15,
        isActive: true,
      },
    ],
  },
  {
    id: 2,
    categoryId: 2,
    brandId: 2,
    name: 'Dell XPS 13 Plus 9320',
    slug: 'dell-xps-13-plus-9320',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60',
    summary: 'Đỉnh cao thiết kế tương lai với bàn phím tràn viền, touch bar điện dung và trackpad ẩn kính cảm ứng haptic.',
    description: 'Dell XPS 13 Plus 9320 định nghĩa lại phong cách laptop doanh nhân cao cấp. Vỏ nhôm nguyên khối cắt CNC tinh xảo, màn hình OLED độ phân giải cao chuẩn màu DCI-P3 100%.',
    isFeatured: true,
    isActive: true,
    createdAt: '2026-10-12T10:00:00.000Z',
    category: INITIAL_CATEGORIES[1],
    brand: INITIAL_BRANDS[1],
    variants: [
      {
        id: 2,
        productId: 2,
        sku: 'XPS-9320-16-512-SLV',
        cpu: 'Intel Core i7-1360P',
        ramGb: 16,
        storage: '512GB PCIe 4.0 SSD',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '13.4 inch FHD+ InfinityEdge',
        color: 'Platinum Silver',
        price: 36500000,
        originalPrice: 39500000,
        stockQuantity: 10,
        isActive: true,
      },
    ],
  },
  {
    id: 3,
    categoryId: 3,
    brandId: 3,
    name: 'Asus ROG Zephyrus G14 GA402',
    slug: 'asus-rog-zephyrus-g14-ga402',
    thumbnailUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=60',
    summary: 'Laptop gaming 14 inch mỏng nhẹ đỉnh cao nhất thế giới với chip AMD Ryzen 7000 series và RTX 40 series.',
    description: 'Asus ROG Zephyrus G14 kết hợp sự di động tuyệt đối và sức mạnh đồ họa bùng nổ. Trọng lượng chỉ 1.65kg, màn hình ROG Nebula Display 165Hz QHD+.',
    isFeatured: true,
    isActive: true,
    createdAt: '2026-10-15T11:00:00.000Z',
    category: INITIAL_CATEGORIES[2],
    brand: INITIAL_BRANDS[2],
    variants: [
      {
        id: 3,
        productId: 3,
        sku: 'ROG-G14-R7-16-4050-GRY',
        cpu: 'AMD Ryzen 7 7735HS',
        ramGb: 16,
        storage: '512GB NVMe Gen4',
        vga: 'NVIDIA GeForce RTX 4050 6GB',
        screenSize: '14 inch QHD+ 165Hz IPS',
        color: 'Eclipse Gray',
        price: 29990000,
        originalPrice: 33500000,
        stockQuantity: 12,
        isActive: true,
      },
    ],
  },
  {
    id: 4,
    categoryId: 2,
    brandId: 4,
    name: 'Lenovo ThinkPad T14s Gen 4',
    slug: 'lenovo-thinkpad-t14s-gen-4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=60',
    summary: 'Chiến binh doanh nghiệp bền bỉ chuẩn quân đội Mỹ MIL-STD-810H, bàn phím gõ êm số 1 thế giới.',
    description: 'Lenovo ThinkPad T14s Gen 4 là sự lựa chọn số 1 cho các chuyên gia công nghệ, lập trình viên và nhà quản lý.',
    isFeatured: false,
    isActive: true,
    createdAt: '2026-10-18T12:00:00.000Z',
    category: INITIAL_CATEGORIES[1],
    brand: INITIAL_BRANDS[3],
    variants: [
      {
        id: 4,
        productId: 4,
        sku: 'TP-T14S-I5-16-512-BLK',
        cpu: 'Intel Core i5-1335U',
        ramGb: 16,
        storage: '512GB SSD NVMe Opal',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '14 inch WUXGA IPS Low Power',
        color: 'Thunder Black',
        price: 26490000,
        originalPrice: 28900000,
        stockQuantity: 14,
        isActive: true,
      },
    ],
  },
  {
    id: 5,
    categoryId: 4,
    brandId: 5,
    name: 'HP Pavilion 15 eg3000',
    slug: 'hp-pavilion-15-eg3000',
    thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=60',
    summary: 'Laptop học tập - văn phòng màn hình lớn 15.6 inch viền mỏng, thiết kế thanh lịch, âm thanh B&O chất lượng.',
    description: 'HP Pavilion 15 là mẫu laptop toàn diện cho sinh viên và nhân viên văn phòng. Màn hình IPS Full HD chống chói, bàn phím số phụ NumPad tiện lợi nhập liệu kế toán.',
    isFeatured: false,
    isActive: true,
    createdAt: '2026-10-20T14:00:00.000Z',
    category: INITIAL_CATEGORIES[3],
    brand: INITIAL_BRANDS[4],
    variants: [
      {
        id: 5,
        productId: 5,
        sku: 'HP-PAV15-I5-8-512-SLV',
        cpu: 'Intel Core i5-1335U',
        ramGb: 8,
        storage: '512GB SSD PCIe NVMe',
        vga: 'Intel Iris Xe Graphics',
        screenSize: '15.6 inch FHD IPS BrightView',
        color: 'Natural Silver',
        price: 14890000,
        originalPrice: 16990000,
        stockQuantity: 20,
        isActive: true,
      },
    ],
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    orderCode: 'ORD-20261027-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    customerEmail: 'nguyenvana@gmail.com',
    shippingAddress: 'Số 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    note: 'Giao giờ hành chính, gọi trước khi đến',
    totalAmount: 24990000,
    paymentMethod: 'COD',
    status: 'COMPLETED',
    createdAt: '2026-10-27T10:00:00.000Z',
  },
  {
    id: 2,
    orderCode: 'ORD-20261027-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    customerEmail: 'tranthib@hotmail.com',
    shippingAddress: 'Số 45 Cầu Giấy, Quận Cầu Giấy, Hà Nội',
    note: 'Kiểm tra hàng trước khi nhận',
    totalAmount: 29990000,
    paymentMethod: 'COD',
    status: 'PROCESSING',
    createdAt: '2026-10-28T14:30:00.000Z',
  },
];

// ================= GLOBAL SINGLETON PATTERN =================
// Lưu trữ trên globalThis để không bị mất khi Hot-Reload trong môi trường development Next.js
interface GlobalDbStore {
  users: IUser[];
  products: IProduct[];
  orders: Order[];
}

declare global {
  // eslint-disable-next-line no-var
  var __globalDbStore: GlobalDbStore | undefined;
}

if (!globalThis.__globalDbStore) {
  globalThis.__globalDbStore = {
    users: [...INITIAL_USERS],
    products: [...INITIAL_PRODUCTS],
    orders: [...INITIAL_ORDERS],
  };
}

const store = globalThis.__globalDbStore;

// ================= CÁC HÀM TRUY VẤN USER =================
export async function getUsersFromDb(): Promise<IUser[]> {
  // Trả về từ Server Store
  return [...store.users];
}

export async function createUserInDb(input: {
  email: string;
  fullName: string;
  password?: string;
  phone?: string | null;
  role?: string;
}): Promise<IUser> {
  const normalizedEmail = input.email.trim().toLowerCase();

  // Kiểm tra trùng email
  const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('Email này đã được sử dụng. Vui lòng chọn email khác.');
  }

  const newId = store.users.length > 0 ? Math.max(...store.users.map((u) => Number(u.id) || 0)) + 1 : 1;
  const role = (input.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER') as any;

  const newUser: IUser = {
    id: newId,
    email: normalizedEmail,
    fullName: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Thêm vào đầu danh sách Server Store
  store.users = [newUser, ...store.users];
  return newUser;
}

export async function updateUserRoleInDb(id: number | string, newRole: string): Promise<IUser | null> {
  const normalizedRole = newRole.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

  // Cập nhật bộ nhớ server store
  const targetId = String(id);
  const user = store.users.find((u) => String(u.id) === targetId || u.email === targetId);
  if (!user) return null;

  user.role = normalizedRole as any;
  user.updatedAt = new Date().toISOString();

  return { ...user };
}

// ================= CÁC HÀM TRUY VẤN PRODUCT =================
export async function getProductsFromDb(): Promise<IProduct[]> {
  return [...store.products];
}

export async function createProductInDb(input: CreateProductInput): Promise<IProduct> {
  const newId = Date.now();
  const slug = (input.slug || input.name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || `laptop-${newId}`;

  const category = INITIAL_CATEGORIES.find((c) => c.id === Number(input.categoryId)) || {
    id: Number(input.categoryId) || 1,
    name: 'Laptop Mỏng Nhẹ',
    slug: 'laptop-mong-nhe',
    displayOrder: 1,
  };

  const brand = INITIAL_BRANDS.find((b) => b.id === Number(input.brandId)) || {
    id: Number(input.brandId) || 1,
    name: 'Apple',
    slug: 'apple',
  };

  const firstVar = input.variants?.[0] || {
    cpu: 'Intel Core i5',
    ramGb: 16,
    storage: '512GB SSD',
    price: 0,
  };

  const newVariant = {
    id: Date.now() + 1,
    productId: newId,
    sku: firstVar.sku || `${(slug.slice(0, 8) || 'LAPTOP').toUpperCase()}-${Date.now().toString().slice(-4)}`,
    cpu: firstVar.cpu || 'Intel Core i5-1335U',
    ramGb: Number(firstVar.ramGb) || 16,
    storage: firstVar.storage || '512GB SSD',
    vga: firstVar.vga || 'Integrated Graphics',
    screenSize: firstVar.screenSize || '14 inch FHD+',
    color: firstVar.color || 'Space Gray',
    price: Number(firstVar.price) || 0,
    originalPrice: firstVar.originalPrice ? Number(firstVar.originalPrice) : undefined,
    stockQuantity: Number(firstVar.stockQuantity) || 10,
    isActive: true,
  };

  const newProduct: IProduct = {
    id: newId,
    categoryId: category.id,
    brandId: brand.id,
    name: input.name.trim(),
    slug,
    thumbnailUrl: input.thumbnailUrl?.trim() || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    summary: input.summary?.trim() || `Laptop ${input.name.trim()} cấu hình ${newVariant.cpu}, ${newVariant.ramGb}GB RAM, ${newVariant.storage}.`,
    description: input.description?.trim() || `Chi tiết sản phẩm ${input.name.trim()}. Máy mới 100% chính hãng, bảo hành toàn diện.`,
    isFeatured: !!input.isFeatured,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category,
    brand,
    variants: [newVariant],
  };

  // Thêm vào đầu danh sách Server Store
  store.products = [newProduct, ...store.products];
  return newProduct;
}

export async function deleteProductInDb(id: number | string): Promise<boolean> {
  const targetId = String(id);
  const index = store.products.findIndex((p) => String(p.id) === targetId);
  if (index !== -1) {
    store.products.splice(index, 1);
    return true;
  }
  return false;
}

// ================= CÁC HÀM TRUY VẤN ORDER (ĐƠN HÀNG) =================
export async function getOrdersFromDb(query?: string): Promise<Order[]> {
  let list = [...store.orders];
  if (query) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (o) => o.orderCode.toLowerCase().includes(q) || o.customerPhone.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function createOrderInDb(payload: any): Promise<Order> {
  const newId = store.orders.length > 0 ? Math.max(...store.orders.map((o) => Number(o.id) || 0)) + 1 : 1;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `ORD-${dateStr}-${randomSuffix}`;

  let totalAmount = payload.totalAmount || 0;
  if (!totalAmount && Array.isArray(payload.items)) {
    totalAmount = payload.items.reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0);
  }

  const newOrder: Order = {
    id: newId,
    orderCode,
    customerName: payload.customerName.trim(),
    customerPhone: payload.customerPhone.trim(),
    customerEmail: payload.customerEmail?.trim() || undefined,
    shippingAddress: payload.shippingAddress.trim(),
    note: payload.note?.trim() || undefined,
    totalAmount,
    paymentMethod: payload.paymentMethod || 'COD',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    items: payload.items || [],
  };

  // Thêm đơn hàng mới vào đầu danh sách Server Store
  store.orders = [newOrder, ...store.orders];
  return newOrder;
}

export async function updateOrderStatusInDb(id: number | string, status: string): Promise<Order | null> {
  const targetId = String(id);
  const order = store.orders.find((o) => String(o.id) === targetId || o.orderCode === targetId);
  if (!order) return null;

  order.status = status as any;

  return { ...order };
}

// ================= CÁC HÀM THỐNG KÊ (STATS) =================
export async function getStatsFromDb() {
  const users = await getUsersFromDb();
  const products = await getProductsFromDb();
  const orders = await getOrdersFromDb();

  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;

  return {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    pendingOrders,
    completedOrders,
    totalRevenue,
  };
}
