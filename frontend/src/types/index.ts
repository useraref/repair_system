export interface RepairRequest {
  id: number;
  tracking_code: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  device_brand: string;
  device_model: string;
  device_issue: string;
  device_password?: string;
  status: string;
  final_price: number;
  parts_used: string;
  created_at: string;
  is_read: number;
} 
