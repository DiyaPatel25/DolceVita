import { Link } from "react-router-dom";
import { MapPin, Phone, Clock } from "lucide-react";
import { STORE } from "../store";

export default function Footer() {
  return (
    <footer className="chalkboard text-cream/80 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-semibold tracking-[0.12em] text-cream">DOLCE VITA</p>
          <p className="text-copper-300 mt-1">{STORE.tagline}</p>
          <p className="mt-4 text-sm max-w-xs">Order online and pick up from our stall. Pay at the counter when you collect.</p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-semibold text-cream">Call us</p>
          {STORE.phones.map((p) => (
            <a key={p} href={`tel:+91${p}`} className="flex items-center gap-2 hover:text-copper-300">
              <Phone size={15} /> {p.replace(/(\d{5})(\d{5})/, "$1 $2")}
            </a>
          ))}
          {STORE.pickupPoint && (
            <a href={STORE.mapsUrl || undefined} target="_blank" rel="noreferrer" className="flex items-start gap-2 hover:text-copper-300">
              <MapPin size={15} className="mt-0.5 shrink-0" /> {STORE.pickupPoint}
            </a>
          )}
          {STORE.hours && (
            <p className="flex items-center gap-2"><Clock size={15} /> {STORE.hours}</p>
          )}
        </div>

        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <p className="font-semibold text-cream">Explore</p>
          <Link to="/menu" className="hover:text-copper-300">Menu</Link>
          <Link to="/special-orders" className="hover:text-copper-300">Special and party orders</Link>
          <Link to="/my-orders" className="hover:text-copper-300">My orders</Link>
        </nav>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-cream/50">© {new Date().getFullYear()} Dolce Vita</p>
    </footer>
  );
}
