import { clsx, type ClassValue } from "clsx";
import { tailwindMerge } from "tailwind-merge";
import {
  parseISO,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
  differenceInCalendarDays,
  eachDayOfInterval,
  addMonths,
} from "date-fns";
import type { AttendanceRecord, StaffMember, SalaryChange, MonthlySummary } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return tailwindMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = "dd MMM yyyy"): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "dd MMM");
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = parseISO(dateStr);
  return d.toDateString() === today.toDateString();
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function getMonthLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export function getMonthRange(monthKey: string): { from: string; to: string } {
  const d = parseISO(`${monthKey}-01`);
  return {
    from: format(startOfMonth(d), "yyyy-MM-dd"),
    to: format(endOfMonth(d), "yyyy-MM-dd"),
  };
}

export function getCurrentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

export function getLastMonthKey(): string {
  return format(subMonths(new Date(), 1), "yyyy-MM");
}

/** Get the salary effective on a given date from the staff member's salary change history. */
export function getSalaryEffectiveOn(staff: StaffMember, salaryChanges: SalaryChange[], dateStr: string): number {
  const target = parseISO(dateStr);
  let effective = staff.monthlySalary;

  const applicable = salaryChanges
    .filter((sc) => sc.staffId === staff.id && parseISO(sc.effectiveDate) <= target)
    .sort((a, b) => parseISO(a.effectiveDate).getTime() - parseISO(b.effectiveDate).getTime());

  if (applicable.length > 0) {
    effective = applicable[applicable.length - 1].amount;
  }
  return effective;
}

/** Build a monthly summary for a staff member. */
export function buildMonthlySummary(
  staff: StaffMember,
  attendance: AttendanceRecord[],
  salaryChanges: SalaryChange[],
  payments: PaymentRecord[],
  monthKey: string,
): MonthlySummary {
  const { from, to } = getMonthRange(monthKey);
  const monthAttendance = attendance.filter(
    (a) => a.staffId === staff.id && a.date >= from && a.date <= to,
  );

  const totalPresent = monthAttendance.filter((a) => a.status === "present").length;
  const totalAbsent = monthAttendance.filter((a) => a.status === "absent").length;
  const totalHalfDay = monthAttendance.filter((a) => a.status === "halfDay").length;
  const totalHoliday = monthAttendance.filter((a) => a.status === "holiday").length;
  const totalDays = monthAttendance.length;

  const totalBonus = monthAttendance.reduce((sum, a) => sum + (a.bonusAmount || 0), 0);
  const totalOvertime = monthAttendance.reduce((sum, a) => sum + (a.overtimeAmount || 0), 0);
  const totalAdvance = monthAttendance.reduce((sum, a) => sum + (a.advanceAmount || 0), 0);
  const totalDeduction = monthAttendance.reduce((sum, a) => sum + (a.deductionAmount || 0), 0);

  const salaryUsed = getSalaryEffectiveOn(staff, salaryChanges, to);
  const dailyRate = salaryUsed / 30;
  const presentEquivalentDays = totalPresent + totalHalfDay * 0.5;
  const basePay = presentEquivalentDays * dailyRate;
  const netPayable = Math.round(basePay + totalBonus + totalOvertime - totalAdvance - totalDeduction);

  const staffPayments = payments.filter((p) => p.staffId === staff.id);
  const isPaid = staffPayments.some(
    (p) => p.fromDate <= from && p.toDate >= to,
  );

  return {
    staffId: staff.id,
    staffName: staff.name,
    month: monthKey,
    year: new Date(`${monthKey}-01`).getFullYear(),
    monthIndex: new Date(`${monthKey}-01`).getMonth(),
    totalPresent,
    totalAbsent,
    totalHalfDay,
    totalHoliday,
    totalDays,
    totalBonus,
    totalOvertime: Math.round(totalOvertime),
    totalAdvance: Math.round(totalAdvance),
    totalDeduction: Math.round(totalDeduction),
    salaryUsed,
    netPayable,
    isPaid,
    paymentRecord: undefined,
  };
}

/** Detect 3+ consecutive absent/holiday runs and return flagged date ranges. */
export function detectConsecutiveLeaveRuns(
  attendance: AttendanceRecord[],
  staffId: string,
  from: string,
  to: string,
): { start: string; end: string; days: number; records: AttendanceRecord[] }[] {
  const staffRecords = attendance
    .filter((a) => a.staffId === staffId && a.date >= from && a.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date));

  const leaveDays = staffRecords.filter((a) => a.status === "absent" || a.status === "holiday");
  const runs: AttendanceRecord[][] = [];
  let current: AttendanceRecord[] = [];

  for (const rec of leaveDays) {
    if (current.length === 0) {
      current = [rec];
    } else {
      const last = current[current.length - 1];
      const diff = differenceInCalendarDays(parseISO(rec.date), parseISO(last.date));
      if (diff === 1) {
        current.push(rec);
      } else {
        runs.push(current);
        current = [rec];
      }
    }
  }
  if (current.length > 0) runs.push(current);

  const flagged: { start: string; end: string; days: number; records: AttendanceRecord[] }[] = [];
  for (const records of runs) {
    if (records.length >= 3) {
      const sorted = records.slice().sort((a, b) => a.date.localeCompare(b.date));
      flagged.push({
        start: sorted[0].date,
        end: sorted[sorted.length - 1].date,
        days: sorted.length,
        records: sorted,
      });
    }
  }
  return flagged.sort((a, b) => a.start.localeCompare(b.start));
}

export type PaymentRecord = {
  id: string;
  staffId: string;
  fromDate: string;
  toDate: string;
  amountPaid: number;
  paymentDate: string;
  periodKey: string;
  createdAt: string;
};

export function isMonthPaid(payments: PaymentRecord[], staffId: string, from: string, to: string): boolean {
  return payments.some(
    (p) => p.staffId === staffId && p.fromDate <= from && p.toDate >= to,
  );
}

