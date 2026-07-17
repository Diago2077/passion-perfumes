import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
      <p className="text-xs tracking-[0.4em] uppercase text-muted-foreground mb-4">✦ Error 404</p>
      <h1 className="font-serif text-6xl sm:text-8xl mb-4">404</h1>
      <p className="text-muted-foreground text-base mb-8 max-w-xs">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center bg-foreground text-background text-xs tracking-wider uppercase px-7 py-3.5 rounded-sm hover:opacity-80 transition-opacity"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
