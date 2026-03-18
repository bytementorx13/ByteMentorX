import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { PremiumButton } from "./ui/PremiumButton";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
<header
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled
      ? "bg-background/80 backdrop-blur-xl border-b border-white/5 py-3"
      : "bg-transparent py-4"
  }`}
>
  <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
    
    {/* Logo + Text + Tagline */}
    <div
      className="flex items-center gap-3 cursor-pointer"
      onClick={() => scrollTo("#home")}
    >
      {/* Logo Image */}
      <img
        src="/b-logo.png"
        alt="ByteMentorX Logo"
        className="h-10 md:h-12 w-auto object-contain"
      />

      {/* Text + Tagline */}
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-lg md:text-xl tracking-tight">
          ByteMentor<span className="text-primary">X</span>
        </span>

        {/* Tagline */}
        <span className="text-xs md:text-sm text-foreground/60 hidden sm:block">
          Build Faster. Learn Smarter.
        </span>
      </div>
    </div>

    {/* Desktop Nav */}
    <nav className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => (
        <button
          key={link.name}
          onClick={() => scrollTo(link.href)}
          className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
        >
          {link.name}
        </button>
      ))}

      <PremiumButton
        variant="primary"
        size="sm"
        onClick={() => scrollTo("#services")}
      >
        Book Session
      </PremiumButton>
    </nav>

    {/* Mobile Nav Toggle */}
    <button
      className="md:hidden p-2 text-foreground"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      {mobileMenuOpen ? <X /> : <Menu />}
    </button>
  </div>

  {/* Mobile Menu */}
  <AnimatePresence>
    {mobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
      >
        <div className="px-4 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                scrollTo(link.href);
                setMobileMenuOpen(false);
              }}
              className="text-lg font-medium text-left text-foreground/80 hover:text-primary py-2"
            >
              {link.name}
            </button>
          ))}

          <PremiumButton
            variant="primary"
            size="sm"
            onClick={() => {
              scrollTo("#services");
              setMobileMenuOpen(false);
            }}
          >
            Book Session
          </PremiumButton>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</header>
  );
}
