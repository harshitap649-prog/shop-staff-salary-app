export type UserRole = "owner";

export type AttendanceStatus = "present" | "absent" | "halfDay" | "holiday";

export interface ShopOwner {
  uid: string;
  email: string;
  ownerName: string;
  mobileNumber: string;
  shopName: string;
  shopDetails?: string; // optional extra shop details (address, gst, etc.)
  adminPin?: string; // 4-digit PIN
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  shopId: string; // owner uid
  name: string;
  mobileNumber: string;
  monthlySalary: number; // current salary (latest effective)
  joiningDate: string; // YYYY-MM-DD
  otherDetails?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryChange {
  id: string;
  staffId: string;
  amount: number;
  effectiveDate: string; // YYYY-MM-DD - applies to this date and future
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface AttendanceRecord {
  id: string;
  shopId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  shiftTiming?: string; // e.g., "10:00 AM - 6:00 PM"
  advanceAmount: number; // disbursed/advance for the day
  bonusAmount: number;
  overtimeAmount: number;
  deductionAmount: number; // auto-calculated for 3+ day rule
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  shopId: string;
  staffId: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  amountPaid: number;
  paymentDate: string; // YYYY-MM-DD
  periodKey: string; // staffId-fromDate-toDate (lock key)
  createdAt: string;
}

export interface MonthlySummary {
  staffId: string;
  staffName: string;
  month: string; // YYYY-MM
  year: number;
  monthIndex: number;
  totalPresent: number;
  totalAbsent: number;
  totalHalfDay: number;
  totalHoliday: number;
  totalDays: number;
  totalBonus: number;
  totalOvertime: number;
  totalAdvance: number;
  totalDeduction: number;
  salaryUsed: number; // salary effective for the month
  netPayable: number;
  isPaid: boolean;
  paymentRecord?: PaymentRecord;
}

export interface AuthFormData {
  ownerName: string;
  mobileNumber: string;
  shopName: string;
  email: string;
  password: string;
  shopDetails?: string;
}

export interface PincodeState {
  isEnabled: boolean;
  pin: string;
  isLocked: boolean; // true when PIN challenge is active for a sensitive action
}

export interface DateRange {
  from: string;
  to: string;
}

export type ReportFilter = "currentMonth" | "lastMonth" | "customRange" | "all";
