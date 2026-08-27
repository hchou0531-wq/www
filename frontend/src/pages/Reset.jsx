import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, errMsg } from "../lib/api";
import { ease } from "../components/motion";

export default function Reset() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { identifier });
      setStep(2);
      toast.success("if that account exists, a code is on its way");
    } catch (err) {
      setError(errMsg(err, "Could not send the code"));
    } finally {
      setBusy(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (code.length !== 6 || password.length < 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await api.post("/auth/reset-password", { identifier, code, new_password: password });
      localStorage.setItem("sanctuary_token", r.data.token);
      setUser(r.data.user);
      toast.success("password reset — you're back in");
      navigate("/settings");
    } catch (err) {
      setError(errMsg(err, "Could not reset the password"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-colors focus:border-[#8B5CF6]";

  return (
    <div data-testid="reset-page" data-theme="dusk" className="flex min-h-screen items-center justify-center bg-[#0d0714] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1123]/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/20 text-[#A78BFA]">
          <KeyRound size={24} />
        </div>
        <h1 className="text-center font-display text-xl font-bold sm:text-2xl">reset your password</h1>

        {step === 1 ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            <p className="text-center text-sm text-white/50">enter your email or username — we'll email you a 6-digit code</p>
            <input
              data-testid="reset-identifier-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="email or username"
              autoFocus
              className={field}
            />
            {error && <p data-testid="reset-error" className="text-center text-sm text-[#F87171]">{error}</p>}
            <button data-testid="reset-send-btn" type="submit" disabled={busy || !identifier.trim()} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white transition-all hover:bg-[#7C4DEF] disabled:opacity-40">
              {busy ? "sending…" : "email me a code"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={doReset} className="mt-6 space-y-4">
            <p className="text-center text-sm text-white/50">code sent for <span className="text-white/80">{identifier}</span></p>
            <input
              data-testid="reset-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              autoFocus
              className={`${field} text-center font-mono text-2xl tracking-[0.5em]`}
            />
            <input
              data-testid="reset-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="new password (6+ chars)"
              className={field}
            />
            {error && <p data-testid="reset-error" className="text-center text-sm text-[#F87171]">{error}</p>}
            <button data-testid="reset-submit-btn" type="submit" disabled={busy || code.length !== 6 || password.length < 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white transition-all hover:bg-[#7C4DEF] disabled:opacity-40">
              {busy ? "resetting…" : "set new password"}
            </button>
            <button type="button" data-testid="reset-back-btn" onClick={() => { setStep(1); setError(""); setCode(""); }} className="mx-auto flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white">
              <ArrowLeft size={12} /> use a different account
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-white/40">
          remembered it? <Link to="/login" className="text-[#A78BFA] transition-colors hover:text-white">log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
