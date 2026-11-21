import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeStaffMembers,
  subscribeAttendance,
  upsertAttendance,
} from "@/lib/firestore";
import { formatDateShort, getMonthKey } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import type { AttendanceRecord, StaffMember } from "@/types";

type Status = "present" | "absent" | "halfDay" | "holiday";

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent", label: "Absent" },
  { value: "halfDay", label: "Half-Day" },
  { value: "holiday", label: "Holiday" },
];

export function AttendancePage() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const unsub1 = subscribeStaffMembers(user.uid, setStaff);
    const unsub2 = subscribeAttendance(user.uid, (recs) => {
      setRecords(recs);
      setLoading(false);
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [user]);

  const todayRecords = records.filter((r) => r.date === date);

  const handleChange = useCallback(
    async (staffId: string, field: keyof AttendanceRecord, value: any) => {
      if (!user) return;
      const existing = todayRecords.find((r) => r.staffId === staffId);
      const base: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt"> = {
        shopId: user.uid,
        staffId,
        date,
        status: "present",
        shiftTiming: "",
        advanceAmount: 0,
        bonusAmount: 0,
        overtimeAmount: 0,
        deductionAmount: 0,
        ...(existing || {}),
        [field]: value,
      };
      setSaving((prev) => new Set([...prev, staffId]));
      try {
        await upsertAttendance(base);
        setRecords((prev) => {
          const idx = prev.findIndex((r) => r.staffId === staffId && r.date === date);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...base, id: next[idx].id };
            return next;
          }
          return [...prev, { ...base, id: "temp" }];
        });
      } finally {
        setSaving((prev) => {
          const next = new Set(prev);
          next.delete(staffId);
          return next;
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, date]);
