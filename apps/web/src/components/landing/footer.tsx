import Link from 'next/link';

const FOOTER_LINKS = ['Producto', 'Precios', 'API', 'Blog', 'Términos', 'Privacidad'];

export default function LandingFooter() {
  return (
    <footer className="py-12 px-8 lg:px-[60px] bg-bg border-t border-border/8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-coral flex items-center justify-center font-display font-black text-xs text-white">
            S
          </div>
          <span className="font-display font-black text-[16px] text-fg">
            Sellio<span className="text-coral">.</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {FOOTER_LINKS.map((label) => (
            <Link
              key={label}
              href="#"
              className="text-[12px] text-muted hover:text-fg transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-[12px] text-muted">
          © 2026 Sellio. Hecho en LATAM.
        </div>
      </div>
    </footer>
  );
}
