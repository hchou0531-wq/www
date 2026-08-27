import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ease } from "./motion";

export function MobileMenu({ links, dark = false, testid = "mobile-menu" }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [loc.pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden" data-testid={testid}>
      <button
        data-testid={`${testid}-toggle`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "close menu" : "open menu"}
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-foreground/70 hover:bg-secondary hover:text-foreground"}`}
      >
        {open ? <X size={17} /> : <Menu size={17} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid={`${testid}-panel`}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.25, ease }}
            className={`absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border p-1.5 shadow-xl backdrop-blur-xl ${dark ? "border-white/10 bg-[#1a1123]/95" : "border-border bg-white/95"}`}
          >
            {links.map((l) => (
              <Link
                key={l.to + l.label}
                to={l.to}
                data-testid={l.testid}
                className={`block rounded-xl px-3.5 py-2.5 text-sm transition-colors ${
                  l.primary
                    ? dark
                      ? "bg-white font-medium text-black hover:bg-white/90"
                      : "bg-ink font-medium text-paper hover:bg-ink/85"
                    : dark
                      ? "text-white/60 hover:bg-white/5 hover:text-white"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
