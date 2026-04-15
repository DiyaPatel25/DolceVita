import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="py-10 bg-black">
      <footer className="container mx-auto px-4 sm:px-6 lg:px-24 text-gray-400">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#a77854' }}>Dolce Vita</h2>
            <p className="text-sm max-w-xs">
              Serving the best handcrafted dishes made with the finest ingredients.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/" className="hover:text-yellow-500 transition-colors">Home</Link>
            <Link to="/menu" className="hover:text-yellow-500 transition-colors">Menu</Link>
            <Link to="/contact" className="hover:text-yellow-500 transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs">
          <p>© {new Date().getFullYear()} Dolce Vita. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
