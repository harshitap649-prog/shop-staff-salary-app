import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createOwnerProfile,
  getOwnerProfileById,
  updateOwnerProfileInDb,
  type ShopOwner,
} from "@/lib/firestore";

type AuthContextType = {
  user: User | null;
  owner: ShopOwner | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (data: {
    ownerName: string;
    mobileNumber: string;
    shopName: string;
    email: string;
    password: string;
    shopDetails?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateOwnerProfile: (data: Partial<ShopOwner>) => Promise<void>;
  refetchOwner: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [owner, setOwner] = useState<ShopOwner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const prof = await getOwnerProfileById(u.uid);
          setOwner(prof ?? null);
        } catch {
          setOwner(null);
        }
      } else {
        setOwner(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signUp = useCallback(async (data) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.ownerName });
    const ownerData: Omit<ShopOwner, "uid" | "createdAt" | "updatedAt"> = {
      ownerName: data.ownerName,
      mobileNumber: data.mobileNumber,
      shopName: data.shopName,
      shopDetails: data.shopDetails,
      email: data.email,
      adminPin: undefined,
    };
    await createOwnerProfile(cred.user.uid, ownerData);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  const updateOwnerProfile = useCallback(async (data: Partial<ShopOwner>) => {
    if (!user) return;
    await updateOwnerProfileInDb(user.uid, data);
    await refetchOwner();
  }, [user, refetchOwner]);

  const refetchOwner = useCallback(async () => {
    if (!user) return;
    const prof = await getOwnerProfileById(user.uid);
    setOwner(prof ?? null);
  }, [user]);

  const value = {
    user,
    owner,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut: handleSignOut,
    updateOwnerProfile,
    refetchOwner,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
