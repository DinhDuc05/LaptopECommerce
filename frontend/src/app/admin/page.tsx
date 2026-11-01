'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getAdminStats,
  getAdminProducts,
  getAdminOrders,
  createAdminProduct,
  deleteAdminProduct,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminOrderStatus,
} from '../../lib/api';
import { IUser, IProduct, CreateProductInput } from '../../types/models';
import { Order } from '../../types';
import { formatVND } from '../../lib/cart';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Laptop, ShoppingBag, Plus, Trash2,
  DollarSign, Package, Clock, RefreshCw, Users,
  ShieldCheck, ShieldOff, Crown, Loader2, CheckCircle2,
  XCircle, Truck,
} from 'lucide-react';

// ── Định nghĩa các Tab trong trang Admin ──────────────────────────────────────
type AdminTab = 'stats' | 'products' | 'orders' | 'users';

// ── Sub-component: Badge hiển thị Role người dùng ─────────────────────────────
function UserRoleBadge({ role }: { role: string }) {
  const isAdmin = role?.toUpperCase() === 'ADMIN';
  return isAdmin ? (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
      <Crown className="w-3 h-3 text-purple-600" />
      <span>Admin</span>
    </span>
  ) : (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <span>Khách Hàng (User)</span>
    </span>
  );
}

// ── Sub-component: Tab "QUẢN LÝ NGƯỜI DÙNG" (Database Thật) ───────────────────
function UserManagementTab() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const currentUser = useAuthStore((s) => s.currentUser);

  // Gọi API GET /api/admin/users để lấy danh sách từ Database thật
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error('Lỗi khi tải danh sách người dùng: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const handleUpdate = () => fetchUsers();
    window.addEventListener('user-registered', handleUpdate);
    window.addEventListener('auth-changed', handleUpdate);
    return () => {
      window.removeEventListener('user-registered', handleUpdate);
      window.removeEventListener('auth-changed', handleUpdate);
    };
  }, []);

  // Gọi API PATCH /api/admin/users/[id]/role để cấp / hủy quyền Admin
  const handleToggleRole = async (user: IUser) => {
    // Không cho phép tự đổi quyền của chính tài khoản đang đăng nhập
    if (String(user.id) === String(currentUser?.id) || user.email === currentUser?.email) {
      toast.error('Bạn không thể tự thay đổi quyền của chính tài khoản mình.');
      return;
    }

    const currentIsAdmin = user.role?.toUpperCase() === 'ADMIN';
    const targetRole = currentIsAdmin ? 'CUSTOMER' : 'ADMIN';

    try {
      setUpdatingId(user.id);
      const res = await updateAdminUserRole(user.id, targetRole);

      if (!res.success) {
        toast.error(res.message || 'Không thể cập nhật quyền người dùng.');
        return;
      }

      // CẬP NHẬT NGAY STATE CỤC BỘ: UI thay đổi ngay lập tức mà không cần reload trang
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          String(u.id) === String(user.id) ? { ...u, role: targetRole as any } : u
        )
      );

      toast.success(
        targetRole === 'ADMIN'
          ? `Đã cấp quyền Admin cho ${user.fullName} thành công! 🛡️`
          : `Đã hủy quyền Admin của ${user.fullName}.`
      );
    } catch (err: any) {
      toast.error('Lỗi kết nối khi phân quyền: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header khu vực quản lý */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Danh Sách Người Dùng (Database)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu được truy vấn trực tiếp từ Database thông qua API Route <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-semibold">GET /api/admin/users</code>.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới ({users.length} người dùng)</span>
        </button>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role Hiện Tại</th>
                <th className="py-3 px-4">Ngày Tạo</th>
                <th className="py-3 px-4 text-right">Phân Quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>Đang tải danh sách người dùng từ Database...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Chưa có người dùng nào trong Database.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isSelf = String(user.id) === String(currentUser?.id) || user.email === currentUser?.email;
                  const isUpdating = updatingId === user.id;
                  const isAdmin = user.role?.toUpperCase() === 'ADMIN';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/50 transition ${isSelf ? 'bg-blue-50/20' : ''}`}
                    >
                      {/* Cột 1: STT */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono font-bold">
                        {index + 1}
                      </td>

                      {/* Cột 2: Họ và tên */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{user.fullName}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Cột 4: Role hiện tại */}
                      <td className="py-3.5 px-4">
                        <UserRoleBadge role={user.role} />
                      </td>

                      {/* Cột 5: Ngày tạo */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Mới tạo'}
                      </td>

                      {/* Cột 6: Nút phân quyền */}
                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-slate-300 text-[11px] font-semibold italic">Đang đăng nhập</span>
                        ) : (
                          <button
                            onClick={() => handleToggleRole(user)}
                            disabled={isUpdating}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm disabled:opacity-50 ${
                              isAdmin
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                          >
                            {isUpdating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Đang lưu...</span>
                              </>
                            ) : isAdmin ? (
                              <>
                                <ShieldOff className="w-3.5 h-3.5 text-rose-600" />
                                <span>Hủy quyền Admin</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                <span>Cấp quyền Admin</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Dashboard Page ─────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');
  const [stats, setStats]         = useState<any>(null);
  const [products, setProducts]   = useState<IProduct[]>([]);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | string | null>(null);

  // Form state thêm laptop mới
  const [showAddModal, setShowAddModal]   = useState(false);
  const [newName, setNewName]             = useState('');
  const [newSlug, setNewSlug]             = useState('');
  const [newCategoryId, setNewCategoryId] = useState('1');
  const [newBrandId, setNewBrandId]       = useState('1');
  const [newCpu, setNewCpu]               = useState('');
  const [newRamGb, setNewRamGb]           = useState('16');
  const [newStorage, setNewStorage]       = useState('512GB SSD');
  const [newColor, setNewColor]           = useState('Space Gray');
  const [newPrice, setNewPrice]           = useState('');
  const [newStock, setNewStock]           = useState('10');
  const [newThumb, setNewThumb]           = useState(
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
  );

  // Tải dữ liệu toàn bộ trang Admin từ Database
  const loadData = async () => {
    try {
      setLoading(true);
      const [sData, pData, oData] = await Promise.all([
        getAdminStats(),
        getAdminProducts(),
        getAdminOrders(),
      ]);
      setProducts(pData);
      setOrders(oData);
      setStats({
        ...sData,
        totalProducts: pData.length,
        totalOrders: oData.length,
      });
    } catch (e: any) {
      console.error('Lỗi tải dữ liệu dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý Thêm Sản Phẩm Mới (POST /api/admin/products -> Insert Database)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error('Vui lòng nhập tên laptop.');
      return;
    }
    const priceNum = parseFloat(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Vui lòng nhập giá bán hợp lệ (> 0 VNĐ).');
      return;
    }

    setSubmitting(true);
    try {
      const generatedSlug = (newSlug || newName)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const payload: CreateProductInput = {
        name: newName.trim(),
        slug: generatedSlug || `laptop-${Date.now()}`,
        categoryId: parseInt(newCategoryId, 10),
        brandId: parseInt(newBrandId, 10),
        thumbnailUrl: newThumb.trim() || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
        summary: `Laptop ${newName.trim()} cấu hình ${newCpu.trim() || 'Intel Core i5'}, RAM ${newRamGb}GB, ${newStorage.trim() || '512GB SSD'}.`,
        description: `Chi tiết sản phẩm ${newName.trim()}. Máy mới 100% chính hãng, bảo hành toàn diện.`,
        isFeatured: false,
        variants: [
          {
            sku: `${(generatedSlug.slice(0, 8) || 'LAPTOP').toUpperCase()}-${Date.now().toString().slice(-4)}`,
            cpu: newCpu.trim() || 'Intel Core i5-1335U',
            ramGb: parseInt(newRamGb, 10) || 16,
            storage: newStorage.trim() || '512GB SSD',
            screenSize: '14 inch FHD+',
            color: newColor.trim() || 'Space Gray',
            price: priceNum,
            stockQuantity: parseInt(newStock, 10) || 10,
          },
        ],
      };

      // GỌI BACKEND API ROUTE POST /api/admin/products
      const res = await createAdminProduct(payload);

      if (!res.success) {
        toast.error(res.message || 'Lỗi kết nối: Không thể thêm laptop vào Database.');
        return;
      }

      // LOGIC REAL-TIME UI: Thêm ngay object sản phẩm mới vào mảng state hiện tại
      // Sản phẩm mới lập tức xuất hiện ở đầu bảng mà không cần F5 tải lại trang!
      if (res.data) {
        setProducts((prev) => [res.data!, ...prev]);
        setStats((prevStats: any) => ({
          ...prevStats,
          totalProducts: (prevStats?.totalProducts || products.length) + 1,
        }));
      } else {
        await loadData();
      }

      toast.success('Đã thêm sản phẩm mới vào Database thành công! 🎉');
      setShowAddModal(false);

      // Reset form
      setNewName('');
      setNewSlug('');
      setNewCpu('');
      setNewPrice('');
    } catch (err: any) {
      toast.error('Lỗi kết nối khi gửi sản phẩm: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setSubmitting(false);
    }
  };

  // Cập nhật trạng thái đơn hàng (PENDING → PROCESSING → COMPLETED | CANCELLED)
  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updateAdminOrderStatus(orderId, newStatus);
      if (!res.success) {
        toast.error(res.message || 'Không thể cập nhật trạng thái đơn hàng.');
        return;
      }
      // Cập nhật real-time state cục bộ mà không cần reload
      setOrders((prev) =>
        prev.map((o) => String(o.id) === String(orderId) ? { ...o, status: newStatus as any } : o)
      );
      // Đồng bộ lại stats
      setStats((prev: any) => ({
        ...prev,
        pendingOrders: orders.filter((o) => String(o.id) !== String(orderId) && o.status === 'PENDING').length
          + (newStatus === 'PENDING' ? 1 : 0),
        completedOrders: orders.filter((o) => String(o.id) !== String(orderId) && o.status === 'COMPLETED').length
          + (newStatus === 'COMPLETED' ? 1 : 0),
      }));
      toast.success('Đã cập nhật trạng thái đơn hàng!');
    } catch (err: any) {
      toast.error('Lỗi kết nối: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Xóa sản phẩm khỏi Database
  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa laptop này khỏi Database?')) return;
    try {
      const res = await deleteAdminProduct(id);
      if (!res.success) {
        toast.error(res.message || 'Không thể xóa sản phẩm');
        return;
      }

      // Cập nhật real-time loại bỏ sản phẩm khỏi state
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      setStats((prevStats: any) => ({
        ...prevStats,
        totalProducts: Math.max(0, (prevStats?.totalProducts || products.length) - 1),
      }));

      toast.success('Đã xóa sản phẩm khỏi Database thành công.');
    } catch (err: any) {
      toast.error('Lỗi kết nối khi xóa sản phẩm: ' + err.message);
    }
  };

  // Cấu hình các Tabs
  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'stats',    label: 'Tổng Quan',           icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Quản Lý Laptop',      icon: <Laptop className="w-4 h-4" />,      count: products.length },
    { id: 'orders',   label: 'Quản Lý Đơn Hàng',   icon: <ShoppingBag className="w-4 h-4" />, count: orders.length },
    { id: 'users',    label: 'Quản lý Người Dùng',  icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hệ thống Quản trị Fullstack Next.js kết nối Database thật qua API Routes.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* ── Tabs Menu ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span>
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: TỔNG QUAN STATS ─────────────────────────────────────────── */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Tổng Doanh Thu"
              value={formatVND(stats.totalRevenue || 0)}
              sub="Từ đơn hàng thành công"
              icon={<DollarSign className="w-5 h-5" />}
              color="emerald"
            />
            <StatCard
              label="Tổng Đơn Hàng"
              value={`${stats.totalOrders || orders.length} đơn`}
              sub="Đang quản lý"
              icon={<Package className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              label="Đơn Chờ Xử Lý"
              value={`${stats.pendingOrders || 1} đơn`}
              sub="Cần gọi xác nhận khách COD"
              icon={<Clock className="w-5 h-5" />}
              color="amber"
              valueClassName="text-amber-600"
            />
            <StatCard
              label="Laptop Trong Kho"
              value={`${stats.totalProducts || products.length} dòng máy`}
              sub="Dữ liệu từ Database"
              icon={<Laptop className="w-5 h-5" />}
              color="purple"
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: QUẢN LÝ SẢN PHẨM LAPTOP (Form + Bảng) ──────────────────── */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Danh Mục Sản Phẩm (Database)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các dòng laptop được lưu trữ trong Database thật.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Laptop Mới</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Laptop</th>
                    <th className="py-3 px-4">Hãng</th>
                    <th className="py-3 px-4">Cấu Hình</th>
                    <th className="py-3 px-4">Giá Bán</th>
                    <th className="py-3 px-4">Kho</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Đang tải danh sách laptop từ Database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Chưa có sản phẩm nào. Hãy bấm "Thêm Laptop Mới" để tạo!
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const primary = p.variants?.[0];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.thumbnailUrl}
                                alt={p.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                              />
                              <div>
                                <div className="font-bold text-slate-900">{p.name}</div>
                                <div className="text-[11px] text-slate-400">{p.slug}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">
                            {p.brand?.name || 'Chính hãng'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {primary ? `${primary.cpu} • ${primary.ramGb}GB RAM` : 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-blue-600">
                            {primary ? formatVND(primary.price) : '0đ'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                              {primary?.stockQuantity || 0} máy
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL FORM THÊM SẢN PHẨM MỚI ───────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Thêm Laptop Mới Vào Database
              </h3>
              <button
                type="button"
                onClick={() => !submitting && setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 text-xs">
              {/* Tên Laptop */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Laptop *</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setNewSlug(e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-'));
                  }}
                  placeholder="VD: Asus Vivobook 15 OLED"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              {/* Hãng & Danh mục */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thương Hiệu</label>
                  <select
                    disabled={submitting}
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="1">Apple</option>
                    <option value="2">Dell</option>
                    <option value="3">Asus</option>
                    <option value="4">Lenovo</option>
                    <option value="5">HP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Danh Mục</label>
                  <select
                    disabled={submitting}
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="1">Laptop Mỏng Nhẹ</option>
                    <option value="2">Laptop Doanh Nhân</option>
                    <option value="3">Laptop Gaming</option>
                    <option value="4">Laptop Văn Phòng</option>
                    <option value="5">Laptop Đồ Họa</option>
                  </select>
                </div>
              </div>

              {/* CPU */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vi xử lý (CPU) *</label>
                <input
                  type="text"
                  required
                  disabled={submitting}
                  value={newCpu}
                  onChange={(e) => setNewCpu(e.target.value)}
                  placeholder="VD: Intel Core i5-13500H hoặc Apple M2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              {/* RAM, Ổ cứng, Màu sắc */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RAM</label>
                  <select
                    disabled={submitting}
                    value={newRamGb}
                    onChange={(e) => setNewRamGb(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="8">8 GB</option>
                    <option value="16">16 GB</option>
                    <option value="32">32 GB</option>
                    <option value="64">64 GB</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ổ Cứng</label>
                  <input
                    type="text"
                    disabled={submitting}
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    placeholder="512GB SSD"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Màu Sắc</label>
                  <input
                    type="text"
                    disabled={submitting}
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Space Gray"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Giá Bán & Số lượng kho */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giá Bán (VND) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    disabled={submitting}
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="VD: 18500000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số Lượng Kho</label>
                  <input
                    type="number"
                    min="0"
                    disabled={submitting}
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Ảnh URL & Preview */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ảnh URL (Hình ảnh sản phẩm)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    disabled={submitting}
                    value={newThumb}
                    onChange={(e) => setNewThumb(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                  {newThumb && (
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newThumb} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Nút hành động Form */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-md shadow-blue-500/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu vào DB...</span>
                    </>
                  ) : (
                    <span>Lưu Laptop</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: QUẢN LÝ ĐƠN HÀNG ────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Quản Lý Đơn Hàng COD</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu thời gian thực từ Database — bao gồm đơn hàng mới nhất.
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Mã Đơn</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Số ĐT</th>
                    <th className="py-3 px-4">Địa chỉ</th>
                    <th className="py-3 px-4">Tổng Tiền</th>
                    <th className="py-3 px-4">Ngày đặt</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Đang tải đơn hàng từ Database...</span>
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-400">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p>Chưa có đơn hàng nào. Đơn mới sẽ xuất hiện ở đây khi khách đặt hàng!</p>
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const isUpdating = String(updatingOrderId) === String(o.id);
                      const statusMap: Record<string, { label: string; cls: string }> = {
                        PENDING:    { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
                        PROCESSING: { label: 'Đang giao',    cls: 'bg-blue-100 text-blue-700 border-blue-200' },
                        COMPLETED:  { label: 'Hoàn thành',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                        CANCELLED:  { label: 'Đã hủy',       cls: 'bg-rose-100 text-rose-700 border-rose-200' },
                      };
                      const sInfo = statusMap[o.status] || { label: o.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-bold text-blue-600 whitespace-nowrap">{o.orderCode}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">{o.customerName}</td>
                          <td className="py-3.5 px-4 text-slate-600">{o.customerPhone}</td>
                          <td className="py-3.5 px-4 text-slate-500 max-w-[180px] truncate" title={o.shippingAddress}>
                            {o.shippingAddress}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                            {formatVND(o.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                            {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            }) : '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${sInfo.cls}`}>
                              {sInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {/* Dropdown đổi trạng thái */}
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {o.status === 'PENDING' && (
                                <>
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(o.id, 'PROCESSING')}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 disabled:opacity-50 transition"
                                    title="Xác nhận → Đang giao"
                                  >
                                    {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                                    <span>Xác nhận giao</span>
                                  </button>
                                  <button
                                    disabled={isUpdating}
                                    onClick={() => handleUpdateOrderStatus(o.id, 'CANCELLED')}
                                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 transition"
                                    title="Hủy đơn"
                                  >
                                    <XCircle className="w-3 h-3" />
                                    <span>Hủy</span>
                                  </button>
                                </>
                              )}
                              {o.status === 'PROCESSING' && (
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateOrderStatus(o.id, 'COMPLETED')}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 disabled:opacity-50 transition"
                                  title="Đánh dấu hoàn thành"
                                >
                                  {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                  <span>Hoàn thành</span>
                                </button>
                              )}
                              {(o.status === 'COMPLETED' || o.status === 'CANCELLED') && (
                                <span className="text-slate-300 text-[10px] italic">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {orders.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                <span>Tổng cộng: <span className="font-bold text-slate-700">{orders.length} đơn hàng</span></span>
                <span>
                  Chờ xác nhận: <span className="font-bold text-amber-600">{orders.filter(o => o.status === 'PENDING').length}</span>
                  {' · '}Đang giao: <span className="font-bold text-blue-600">{orders.filter(o => o.status === 'PROCESSING').length}</span>
                  {' · '}Hoàn thành: <span className="font-bold text-emerald-600">{orders.filter(o => o.status === 'COMPLETED').length}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: QUẢN LÝ NGƯỜI DÙNG (Database Thật) ──────────────────────── */}
      {activeTab === 'users' && <UserManagementTab />}
    </div>
  );
}

// ── Helper StatCard component ─────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, color, valueClassName,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  valueClassName?: string;
}) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue:    'bg-blue-50 text-blue-600',
    amber:   'bg-amber-50 text-amber-600',
    purple:  'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <div className={`text-2xl font-black text-slate-900 mt-3 ${valueClassName ?? ''}`}>
        {value}
      </div>
      <div className="text-[11px] text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
