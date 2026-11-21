import { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export function PINModal({ isOpen, onClose, onSuccess, title, description }: PINModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const digits = pin.split("").slice(0, 4);
  const isComplete = digits.length === 4;

  const handleDigit = (d: string) => {
    if (digits.length < 4 && !error) setPin(pin + d);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsVerifying(false);
    onSuccess();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) handleDigit(e.key);
    else if (e.key === "Backspace") handleBackspace();
    else if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto animate-in fade-in zoom-in duration-200 w-full max-w-md p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-warn-600" />
            <h2 className="text-lg font-semibold text-slate-900">{title ?? "Admin PIN Required"}</h2>
          </div>
          <p className="text-slate-600 text-sm mb-6">
            {description ?? "Enter your 4-digit admin PIN to perform this sensitive action."}
          </p>

          {error && (
            <div className="flex items-center gap-2 mb-4 p-2 rounded bg-danger-50 text-danger-700 text-sm border border-danger-100">
              <AlertCircle className="w-4 h-4" /> Incorrect PIN. Try again.
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-10 h-10 rounded-xl border flex items-center justify-center text-xl font-mono text-slate-700 transition-all",
                  i < digits.length
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]"
                    : "bg-slate-100 border-slate-200",
                )}
              >
                {i < digits.length ? (
                  <span className="opacity-70">•</span>
                ) : (
                  <span className="opacity-20">0</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2 mb-2">
            {[...Array(10).keys()].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleDigit(String(n))}
                disabled={isComplete || isVerifying}
                className="h-12 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 active:scale-95 transition"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl border border-slate-200 bg-white text-slate-500 disabled:opacity-50 disabled:pointer-events-none hover:bg-slate-50 active:scale-95 transition flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium disabled:opacity-50 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isComplete || isVerifying}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-emerald-700 active:scale-[0.98] transition"
            >
              {isVerifying ? "Verifying..." : "Unlock"}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500 text-center">
            Forgot PIN? Reset it in Settings {">"} Admin PIN.
          </p>
        </div>
      </div>
    </>
  );
}
