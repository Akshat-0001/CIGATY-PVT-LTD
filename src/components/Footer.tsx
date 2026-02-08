import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 text-sm text-foreground">
          <span>© CIGATY {new Date().getFullYear()}</span>
          <Link to="/how-it-works" className="hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link to="/security" className="hover:text-primary transition-colors">
            Security
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/about" className="text-sm text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/privacy" className="text-sm text-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/cookies" className="text-sm text-foreground hover:text-primary transition-colors">
            Cookies Policy
          </Link>
          <Link to="/terms" className="text-sm text-foreground hover:text-primary transition-colors">
            T&Cs
          </Link>
          <Link to="/contact" className="text-sm text-foreground hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};
