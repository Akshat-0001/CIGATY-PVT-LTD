import { Link } from "react-router-dom";
import { Search, Bell, ShoppingCart, User } from "lucide-react";

interface MobileTopBarProps {
  onSearch?: () => void;
}

export function MobileTopBar({ onSearch }: MobileTopBarProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 px-3 pt-[env(safe-area-inset-top)] bg-background/70 backdrop-blur-sm border-b">
      <div className="h-12 flex items-center justify-between">
        <Link to="/" className="font-display font-semibold text-lg">CIGATY</Link>
        <div className="flex items-center gap-3">
          <button aria-label="Search" onClick={onSearch} className="glass-nav-item p-2 rounded-lg">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/cart" className="glass-nav-item p-2 rounded-lg relative" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <Link to="/notifications" className="glass-nav-item p-2 rounded-lg relative" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
          <Link to="/profile" className="glass-nav-item p-2 rounded-lg" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}


