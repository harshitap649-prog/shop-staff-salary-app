import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  StaffMember,
  SalaryChange,
  AttendanceRecord,
  PaymentRecord,
  ShopOwner,
} from "@/types";

const COLLECTIONS = {
  owners: "shopOwners",
  staff: "staff",
  salaryChanges: "salaryChanges",
  attendance: "attendance",
  payments: "payments",
} as const;

export async function createOwnerProfile(uid: string, data: Omit<ShopOwner, "uid" | "createdAt" | "updatedAt">) {
  const ref = doc(db, COLLECTIONS.owners, uid);
  await setDoc(ref, {
    ...data,
    uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export async function updateOwnerProfileInDb(uid: string, data: Partial<ShopOwner>) {
  const ref = doc(db, COLLECTIONS.owners, uid);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function getOwnerProfileById(uid: string): Promise<ShopOwner | null> {
  const ref = doc(db, COLLECTIONS.owners, uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as ShopOwner) : null;
}

export async function addStaffMember(data: Omit<StaffMember, "id" | "createdAt" | "updatedAt">) {
  const ref = doc(collection(db, COLLECTIONS.staff));
  const now = serverTimestamp();
  await updateDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function updateStaffMember(id: string, data: Partial<StaffMember>) {
  const ref = doc(db, COLLECTIONS.staff, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteStaffMember(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.staff, id));
}

export function subscribeStaffMembers(shopId: string, callback: (staff: StaffMember[]) => void) {
  const q = query(
    collection(db, COLLECTIONS.staff),
    where("shopId", "==", shopId),
    where("isActive", "==", true),
    orderBy("name"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as StaffMember));
  });
}

export async function addSalaryChange(data: Omit<SalaryChange, "id" | "changedAt">) {
  const ref = doc(collection(db, COLLECTIONS.salaryChanges));
  await updateDoc(ref, {
    ...data,
    id: ref.id,
    changedAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeSalaryChanges(callback: (changes: SalaryChange[]) => void) {
  const q = query(collection(db, COLLECTIONS.salaryChanges), orderBy("effectiveDate", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as SalaryChange));
  });
}

async function findAttendanceByDateAndStaff(shopId: string, staffId: string, date: string): Promise<AttendanceRecord | null> {
  const q = query(
    collection(db, COLLECTIONS.attendance),
    where("shopId", "==", shopId),
    where("staffId", "==", staffId),
    where("date", "==", date),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as AttendanceRecord;
}

export async function upsertAttendance(record: Omit<AttendanceRecord, "id" | "createdAt" | "updatedAt">) {
  const existing = await findAttendanceByDateAndStaff(record.shopId, record.staffId, record.date);
  const now = serverTimestamp();
  const base = { ...record, updatedAt: now };
  if (existing) {
    await updateDoc(doc(db, COLLECTIONS.attendance, existing.id), base);
    return existing.id;
  }
  const ref = doc(collection(db, COLLECTIONS.attendance));
  await updateDoc(ref, { ...base, id: ref.id, createdAt: now });
  return ref.id;
}

export function subscribeAttendance(shopId: string, callback: (records: AttendanceRecord[]) => void) {
  const q = query(collection(db, COLLECTIONS.attendance), where("shopId", "==", shopId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as AttendanceRecord));
  });
}

export async function addPayment(data: Omit<PaymentRecord, "id" | "createdAt">) {
  const ref = doc(collection(db, COLLECTIONS.payments));
  await updateDoc(ref, {
    ...data,
    id: ref.id,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribePayments(shopId: string, callback: (payments: PaymentRecord[]) => void) {
  const q = query(collection(db, COLLECTIONS.payments), where("shopId", "==", shopId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as PaymentRecord));
  });
}

export async function exportAllData(shopId: string) {
  const [staffSnap, salarySnap, attSnap, paySnap] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.staff), where("shopId", "==", shopId))),
    getDocs(query(collection(db, COLLECTIONS.salaryChanges))),
    getDocs(query(collection(db, COLLECTIONS.attendance), where("shopId", "==", shopId))),
    getDocs(query(collection(db, COLLECTIONS.payments), where("shopId", "==", shopId))),
  ]);
  return {
    staff: staffSnap.docs.map((d) => d.data()),
    salaryChanges: salarySnap.docs.map((d) => d.data()),
    attendance: attSnap.docs.map((d) => d.data()),
    payments: paySnap.docs.map((d) => d.data()),
    exportedAt: new Date().toISOString(),
  };
}
