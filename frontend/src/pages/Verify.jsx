import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api, errMsg } from "../lib/api";
import { ease } from "../components/motion";

export default function Verify() {
  const { user, loading, setUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && user?.email_verified) navigate("/settings");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (loading || !user) return null;

  const submit = async (e) => {
    e?.preventDefault();
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await api.post("/auth/verify-email", { code });
      setUser(r.data);
      toast.success("email verified — welcome in");
      navigate("/settings", { state: { welcome: true, username: r.data.username } });
    } catch (err) {
      setError(errMsg(err, "Could not verify that code"));
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    try {
      await api.post("/auth/resend-code");
      toast.success("fresh code sent — check your inbox");
      setCooldown(30);
    } catch (err) {
      toast.error(errMsg(err, "Could not resend right now"));
      setCooldown(30);
    }
  };

  return (
    <div data-testid="verify-page" data-theme="dusk" className="flex min-h-screen items-center justify-center bg-[#0d0714] px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#1a1123]/80 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/20 text-[#A78BFA]">
          <MailCheck size={24} />
        </div>
        <h1 className="text-center font-display text-xl font-bold sm:text-2xl">check your inbox</h1>
        <p className="mt-2 text-center text-sm text-white/50">
          we sent a 6-digit code to <span data-testid="verify-email-addr" className="text-white/80">{user.email}</span>
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            data-testid="verify-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center font-mono text-2xl tracking-[0.5em] outline-none transition-colors focus:border-[#8B5CF6]"
          />
          {error && <p data-testid="verify-error" className="text-center text-sm text-[#F87171]">{error}</p>}
          <button
            data-testid="verify-submit-btn"
            type="submit"
            disabled={busy || code.length !== 6}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white shadow-[0_0_24px_rgba(139,92,246,0.4)] transition-all hover:bg-[#7C4DEF] disabled:opacity-40"
          >
            {busy ? "verifying…" : "verify"} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-white/40">
          <button data-testid="verify-resend-btn" onClick={resend} disabled={cooldown > 0} className="transition-colors hover:text-white disabled:opacity-40">
            {cooldown > 0 ? `resend in ${cooldown}s` : "resend code"}
          </button>
          <Link to="/login" className="transition-colors hover:text-white">wrong email? start over</Link>
        </div>
      </motion.div>
    </div>
  );
}
