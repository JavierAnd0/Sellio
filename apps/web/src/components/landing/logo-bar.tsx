const BUSINESSES = [
  'Café Central', 'Panadería Artesanal', 'Salón Nova', 'Tech Store',
  'Ropa Bonita', 'Clínica Vita', 'Gym Force', 'Librería Sur',
];

export default function LandingLogoBar() {
  return (
    <div className="border-t border-b border-border/8 bg-bg py-5 overflow-hidden">
      <div className="flex items-center gap-16 px-8 lg:px-[60px] whitespace-nowrap">
        <span className="text-[10px] tracking-[0.15em] uppercase text-muted shrink-0">
          Usado por
        </span>
        {[...BUSINESSES, ...BUSINESSES].map((b, i) => (
          <span
            key={`${b}-${i}`}
            className="font-display font-bold text-[13px] tracking-[-0.01em] shrink-0 text-fg/20"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
