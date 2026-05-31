import React, { useEffect, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { requestsApi, statsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { RepairRequest } from '../types';
import { Header } from '../components/Layout/Header';
import { StatCard } from '../components/UI/StatCard';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { RevenueChart } from '../components/Charts/RevenueChart';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw, FiCalendar } from 'react-icons/fi';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, income: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RepairRequest | null>(null);
  const itemsPerPage = 10;
  const { user } = useAuthStore();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [requestsRes, statsRes] = await Promise.all([requestsApi.getAll(), statsApi.get()]);
      setRequests(requestsRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredRequests = useMemo(() => {
    let filtered = [...requests];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.tracking_code.toLowerCase().includes(term) ||
        r.customer_name.toLowerCase().includes(term) ||
        r.customer_phone.includes(term)
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);
    if (dateFrom) filtered = filtered.filter(r => new Date(r.created_at) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter(r => new Date(r.created_at) <= new Date(dateTo));
    return filtered;
  }, [requests, searchTerm, statusFilter, dateFrom, dateTo]);

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(start, start + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();
    return last7Days.map(date => ({
      name: new Date(date).toLocaleDateString('fa-IR', { month: 'numeric', day: 'numeric' }),
      revenue: requests.filter(r => r.created_at.split('T')[0] === date).reduce((sum, r) => sum + (r.final_price || 0), 0),
      count: requests.filter(r => r.created_at.split('T')[0] === date).length,
    }));
  }, [requests]);

  // تغییر سریع وضعیت
  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await requestsApi.update(id, { status: newStatus });
      toast.success('وضعیت به روز شد');
      fetchData();
    } catch {
      toast.error('خطا در بروزرسانی');
    }
  };

  // به‌روزرسانی کامل (وضعیت + قیمت + قطعات)
  const handleFullUpdate = async (id: number, data: { status: string; final_price: number; parts_used: string }) => {
    try {
      await requestsApi.update(id, data);
      toast.success('اطلاعات با موفقیت به‌روز شد');
      fetchData();
      setShowEditModal(false);
    } catch {
      toast.error('خطا در به‌روزرسانی');
    }
  };

  const exportToExcel = () => {
    const headers = ['کد', 'مشتری', 'تلفن', 'دستگاه', 'وضعیت', 'هزینه', 'تاریخ'];
    const rows = filteredRequests.map(r => [
      r.tracking_code,
      r.customer_name,
      r.customer_phone,
      `${r.device_brand} ${r.device_model}`,
      r.status === 'completed' ? 'تکمیل' : 'در انتظار',
      (r.final_price ?? 0).toLocaleString(),
      new Date(r.created_at).toLocaleDateString('fa-IR')
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `repair_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('گزارش دانلود شد');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header userName={user?.name} onLogout={onLogout} notificationCount={requests.filter(r => r.is_read === 0).length} />
      <main className="p-6">
        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="کل درخواست‌ها" value={stats.total} icon="📋" color="indigo" />
          <StatCard title="در انتظار" value={stats.pending} icon="⏳" color="orange" />
          <StatCard title="تکمیل شده" value={stats.completed} icon="✅" color="emerald" />
          <StatCard title="درآمد (تومان)" value={stats.income.toLocaleString()} icon="💰" color="indigo" />
        </div>

        {/* نمودار درآمد */}
        <Card title="📈 نمودار درآمد" className="mb-8">
          <RevenueChart data={chartData} />
        </Card>

        {/* بخش جستجو و فیلتر */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm mb-1"><FiSearch className="inline ml-1" /> جستجو</label>
              <input type="text" placeholder="جستجو در کد، نام، تلفن..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm mb-1"><FiFilter className="inline ml-1" /> وضعیت</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-xl">
                <option value="all">همه</option>
                <option value="pending">در انتظار</option>
                <option value="completed">تکمیل</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1"><FiCalendar /> از تاریخ</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="p-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm mb-1"><FiCalendar /> تا تاریخ</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="p-2 border rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); }} icon={<FiRefreshCw />}>ریست</Button>
              <Button variant="success" onClick={exportToExcel} icon={<FiDownload />}>خروجی اکسل</Button>
            </div>
          </div>
        </Card>

        {/* جدول درخواست‌ها */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-right">کد پیگیری</th>
                <th className="p-3 text-right">مشتری</th>
                <th className="p-3 text-right">تلفن</th>
                <th className="p-3 text-right">دستگاه</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">هزینه (تومان)</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.map(req => (
                <tr key={req.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }}>
                  <td className="p-3 font-mono">{req.tracking_code}</td>
                  <td className="p-3">{req.customer_name}</td>
                  <td dir="ltr">{req.customer_phone}</td>
                  <td>{req.device_brand} {req.device_model}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status === 'completed' ? 'تکمیل' : 'در انتظار'}
                    </span>
                  </td>
                  <td>{(req.final_price ?? 0).toLocaleString()} تومان</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, req.status); }}>
                        تغییر وضعیت
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setEditingRequest(req); setShowEditModal(true); }}>
                        ویرایش هزینه/قطعات
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-between p-4 border-t">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>قبلی</Button>
              <span>صفحه {currentPage} از {totalPages}</span>
              <Button variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>بعدی</Button>
            </div>
          )}
        </div>
      </main>

      {/* مودال جزئیات درخواست */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="جزئیات درخواست">
        {selectedRequest && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><strong>کد پیگیری:</strong> {selectedRequest.tracking_code}</div>
              <div><strong>تاریخ ثبت:</strong> {new Date(selectedRequest.created_at).toLocaleDateString('fa-IR')}</div>
              <div><strong>نام مشتری:</strong> {selectedRequest.customer_name}</div>
              <div><strong>تلفن:</strong> {selectedRequest.customer_phone}</div>
              <div className="col-span-2"><strong>آدرس:</strong> {selectedRequest.customer_address}</div>
              <div><strong>برند:</strong> {selectedRequest.device_brand}</div>
              <div><strong>مدل:</strong> {selectedRequest.device_model}</div>
              <div className="col-span-2"><strong>مشکل دستگاه:</strong> {selectedRequest.device_issue}</div>
              {selectedRequest.device_password && <div><strong>رمز دستگاه:</strong> {selectedRequest.device_password}</div>}
              {selectedRequest.parts_used && <div className="col-span-2"><strong>قطعات مصرفی:</strong> {selectedRequest.parts_used}</div>}
              <div><strong>هزینه نهایی:</strong> {(selectedRequest.final_price ?? 0).toLocaleString()} تومان</div>
              <div><strong>وضعیت:</strong> {selectedRequest.status === 'completed' ? 'تکمیل شده' : 'در انتظار'}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* مودال ویرایش هزینه و قطعات */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="ویرایش هزینه و قطعات">
        {editingRequest && (
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleFullUpdate(editingRequest.id, {
              status: editingRequest.status,  // وضعیت را تغییر نمی‌دهیم (فقط هزینه/قطعات)
              final_price: parseInt(formData.get('final_price') as string) || 0,
              parts_used: formData.get('parts_used') as string,
            });
          }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">هزینه نهایی (تومان)</label>
              <input
                type="number"
                name="final_price"
                defaultValue={editingRequest.final_price ?? 0}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">قطعات مصرفی</label>
              <textarea
                name="parts_used"
                rows={3}
                defaultValue={editingRequest.parts_used || ''}
                className="w-full p-2 border rounded-xl"
                placeholder="مثال: باتری - 500,000 تومان&#10;صفحه نمایش - 1,200,000 تومان"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="primary">💾 ذخیره تغییرات</Button>
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)}>انصراف</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};