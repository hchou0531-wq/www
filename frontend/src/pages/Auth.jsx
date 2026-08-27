import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, errMsg } from "../lib/api";
import { ease } from "../components/motion";

const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || "";

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, register } = useAuth();

  const [username, setUsername] = useState(params.get("u") || "");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [tsToken, setTsToken] = useState("");
  const tsRef = useRef(null);
  const tsWidget = useRef(null);

  useEffect(() => {
    if (!isRegister || !TURNSTILE_SITE_KEY) return;
    const render = () => {
      if (!tsRef.current || !window.turnstile || tsWidget.current !== null) return;
      tsWidget.current = window.turnstile.render(tsRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action: "signup",
        theme: "dark",
        callback: (t) => setTsToken(t),
        "expired-callback": () => setTsToken(""),
        "error-callback": () => setTsToken(""),
      });
    };
    const existing = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (existing) {
      if (window.turnstile) render();
      else existing.addEventListener("load", render);
    } else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.addEventListener("load", render);
      document.head.appendChild(s);
    }
    return () => {
      if (tsWidget.current !== null && window.turnstile) {
        window.turnstile.remove(tsWidget.current);
        tsWidget.current = null;
      }
    };
  }, [isRegister]);

  useEffect(() => {
    if (!isRegister || username.length < 3) {
      setAvailability(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await api.get(`/username-check/${username}`);
        setAvailability(r.data.available);
      } catch {
        setAvailability(null);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [username, isRegister]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) {
        const user = await register(username, email, password, website, tsToken);
        navigate("/verify");
      } else {
        const user = await login(identifier, password);
        if (!user.email_verified) {
          navigate("/verify");
          return;
        }
        navigate(`/${user.username}`);
      }
    } catch (err) {
      setError(errMsg(err, "Could not sign you in"));
      if (isRegister && tsWidget.current !== null && window.turnstile) {
        window.turnstile.reset(tsWidget.current);
        setTsToken("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid={isRegister ? "register-page" : "login-page"} className="flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-10 block text-center font-serif text-2xl font-semibold italic">dontblink</Link>
        <div className="rounded-3xl border border-border bg-card p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h1 className="font-display text-2xl font-bold">
            {isRegister ? "Claim your corner" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isRegister ? "One quiet page for everything you are." : "Your page missed you."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {isRegister && (
              <>
                <div>
                  <div className="flex items-center gap-2 rounded-xl border border-input bg-secondary px-4 py-3 focus-within:border-sage">
                    <span className="font-mono text-sm text-muted-foreground">dontblink.site/</span>
                    <input
                      data-testid="register-username-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                      placeholder="username"
                      maxLength={20}
                      required
                      className="w-full bg-transparent font-mono text-sm outline-none"
                    />
                    {availability === true && <Check size={15} className="shrink-0 text-sage" />}
                    {availability === false && <X size={15} className="shrink-0 text-destructive" />}
                  </div>
                  {availability === false && (
                    <p data-testid="username-taken-msg" className="mt-1.5 pl-1 text-xs text-destructive">that one's taken</p>
                  )}
                </div>
                <input
                  data-testid="register-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email"
                  required
                  className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-[#8B5CF6]"
                />
              </>
            )}
            {!isRegister && (
              <input
                data-testid="login-identifier-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="email or username"
                required
                className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-[#8B5CF6]"
              />
            )}
            <input
              data-testid={isRegister ? "register-password-input" : "login-password-input"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? "password (6+ chars)" : "password"}
              required
              minLength={isRegister ? 6 : 1}
              className="w-full rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-[#8B5CF6]"
            />
            {isRegister && (
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                data-testid="hp-website"
                className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            )}

            {isRegister && TURNSTILE_SITE_KEY && (
              <div ref={tsRef} data-testid="turnstile-widget" aria-label="bot verification" className="flex justify-center" />
            )}

            {error && <p data-testid="auth-error" className="text-sm text-destructive">{error}</p>}

            <button
              data-testid={isRegister ? "register-submit-btn" : "login-submit-btn"}
              type="submit"
              disabled={busy || (isRegister && availability === false) || (isRegister && !!TURNSTILE_SITE_KEY && !tsToken)}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5CF6] py-3 text-sm font-medium text-white transition-colors hover:bg-[#7C4DEF] disabled:opacity-40"
            >
              {busy ? "one moment…" : isRegister ? "create my page" : "log in"}
              {!busy && <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? (
            <>already have a page? <Link data-testid="goto-login" to="/login" className="text-foreground underline-offset-4 hover:underline">log in</Link></>
          ) : (
            <>new here? <Link data-testid="goto-register" to="/register" className="text-foreground underline-offset-4 hover:underline">claim your username</Link></>
          )}
        </p>
      </motion.div>
    </div>
  );
}
