import React, { useEffect, useState } from 'react';
import { trackingApi } from '../services/api';
import { RepairRequest } from '../types';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

interface TrackingProps {
  code: string;
  onBack: () => void;
}

export const Tracking: React.FC<TrackingProps> = ({ code, onBack }) => {
  const [request, setRequest] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await trackingApi.getByCode(code);
        setRequest(res.data);
      } catch { toast.error('کد نامعتبر'); } finally { setLoading(false); }
    };
    if (code) fetchData();
  }, [code]);

  if (loading) return <LoadingSpinner />;
  if (!request) return <div className="min-h-screen p-4 text-center"><Card><p className="text-red-500">❌ کد نامعتبر</p><Button onClick={onBack}>← بازگشت</Button></Card></div>;

  const steps = ['pending', 'checking', 'repaired', 'completed'];
  const currentIndex = steps.indexOf(request.status);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <Button variant="secondary" onClick={onBack} className="mb-4">← بازگشت</Button>
        <Card title="🔍 نتیجه پیگیری">
          <div className="mb-6 flex justify-between">
            {steps.map((step, idx) => (<div key={step} className="text-center flex-1"><div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${idx < currentIndex ? 'bg-green-500 text-white' : idx === currentIndex ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-300'}`}>{idx < currentIndex ? '✓' : idx === currentIndex ? '●' : '○'}</div><div className="text-xs mt-1">{step === 'pending' ? 'در انتظار' : step === 'checking' ? 'بررسی' : step === 'repaired' ? 'تعمیر' : 'تحویل'}</div></div>))}
          </div>
          <div className="space-y-3"><div className="flex justify-between"><span className="font-bold">کد:</span><span>{request.tracking_code}</span></div><div className="flex justify-between"><span className="font-bold">نام:</span><span>{request.customer_name}</span></div><div className="flex justify-between"><span className="font-bold">دستگاه:</span><span>{request.device_brand} {request.device_model}</span></div><div className="flex justify-between"><span className="font-bold">مشکل:</span><span>{request.device_issue}</span></div>{request.final_price > 0 && <div className="flex justify-between"><span className="font-bold">هزینه:</span><span>{request.final_price.toLocaleString()} تومان</span></div>}{request.parts_used && <div><span className="font-bold">قطعات:</span><p>{request.parts_used}</p></div>}</div>
        </Card>
      </div>
    </div>
  );
}; 
