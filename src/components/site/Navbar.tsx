import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import { navLinks } from "./navLinks";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img
            src="https://hercules-cdn.com/file_C16P4Sgny9lWcaa1ibK4GgJr"
            alt="Passion Perfumes y Cosméticos"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 bg-foreground text-background text-xs tracking-wider uppercase px-4 py-2 rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          <button className="lg:hidden p-2 text-foreground cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-background border-t border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="text-sm tracking-widest uppercase text-muted-foreground" onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              ))}
              <a
                href={whatsappLink("Hola! Quisiera consultar sobre sus productos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-foreground text-background text-xs tracking-wider uppercase px-4 py-2.5 rounded-sm w-fit cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Consultar por WhatsApp
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
