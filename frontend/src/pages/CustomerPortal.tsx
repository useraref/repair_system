import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { requestsApi } from '../services/api';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';

interface CustomerPortalProps {
  onBack: () => void;
  onTracking: (code: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onBack, onTracking }) => {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({ customer_name: '', customer_phone: '', customer_address: '', device_brand: '', device_model: '', device_issue: '', device_password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = formData.customer_phone;
    if (!/^09[0-9]{9}$/.test(phone)) { toast.error('شماره تلفن نامعتبر'); return; }
    setLoading(true);
    try {
      const res = await requestsApi.create(formData);
      if (res.data.success) {
        toast.success(`درخواست ثبت شد! کد: ${res.data.tracking_code}`);
        onTracking(res.data.tracking_code);
      }
    } catch { toast.error('خطا'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4"><Button variant="secondary" onClick={onBack}>← بازگشت</Button><div className="flex gap-2"><Button variant={showForm ? 'primary' : 'outline'} onClick={() => setShowForm(true)}>ثبت درخواست</Button><Button variant={!showForm ? 'primary' : 'outline'} onClick={() => setShowForm(false)}>پیگیری</Button></div></div>
        {showForm ? (
          <Card title="📝 ثبت درخواست تعمیر">
            <form onSubmit={handleSubmit}>
              <input type="text" name="customer_name" placeholder="نام و نام خانوادگی" className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange} />
              <input type="tel" name="customer_phone" placeholder="شماره تماس (09123456789)" className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange} />
              <textarea name="customer_address" placeholder="آدرس" rows={2} className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange} />
              <select name="device_brand" className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange}><option value="">برند</option><option>اپل</option><option>سامسونگ</option><option>شیائومی</option></select>
              <input type="text" name="device_model" placeholder="مدل" className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange} />
              <textarea name="device_issue" placeholder="شرح مشکل" rows={3} className="w-full p-3 border rounded-xl mb-3" required onChange={handleChange} />
              <input type="text" name="device_password" placeholder="رمز دستگاه (اختیاری)" className="w-full p-3 border rounded-xl mb-4" onChange={handleChange} />
              <Button type="submit" variant="success" loading={loading} className="w-full">ثبت درخواست</Button>
            </form>
          </Card>
        ) : (
          <Card title="🔍 پیگیری وضعیت">
            <form onSubmit={(e) => { e.preventDefault(); const code = (e.currentTarget.elements.namedItem('tracking_code') as HTMLInputElement).value; if (code) onTracking(code); }}>
              <input type="text" name="tracking_code" placeholder="کد پیگیری" className="w-full p-3 border rounded-xl mb-4 text-center font-mono" />
              <Button type="submit" variant="primary" className="w-full">جستجو</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}; 
