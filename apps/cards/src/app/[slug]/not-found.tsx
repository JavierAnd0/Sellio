export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <div className="mb-6 text-6xl">🎴</div>
      <h1 className="font-display text-2xl font-extrabold text-fg">
        Tarjeta no encontrada
      </h1>
      <p className="mt-3 max-w-xs text-sm text-muted">
        Esta tarjeta de lealtad no existe o ya no está disponible.
        Pide al negocio que te comparta el enlace correcto.
      </p>
    </div>
  );
}
