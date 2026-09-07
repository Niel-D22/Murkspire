import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { XIcon, X_URL } from "../brand/XIcon";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Docs", href: "/docs" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-[14px] px-4 py-2.5 transition-all duration-300 sm:px-6 ${
          scrolled
            ? "glass shadow-glass"
            : "border border-white/[0.07] bg-white/[0.02] backdrop-blur-md"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5" aria-label="Murkspire home">
          <img src="/logo-512.png" alt="" aria-hidden="true" className="h-8 w-auto" />
          <span className="font-sans text-[15px] font-medium tracking-[0.28em] text-bone">
            MURKSPIRE
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-400 transition-colors hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="pill-ghost gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]"
            aria-label="Murkspire on X"
          >
            <XIcon className="h-3.5 w-3.5" />
            Follow
          </a>
          <Link
            to="/app"
            className="pill bg-bone px-5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-murk hover:bg-white"
          >
            Launch App
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-zinc-300 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="glass mx-auto mt-2 max-w-6xl space-y-1 p-4 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-zinc-300 hover:bg-white/5 hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/app"
            className="pill-primary mt-2 w-full px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]"
          >
            Launch App
          </Link>
        </div>
      )}
    </header>
  );
}
