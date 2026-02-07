import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

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
        
        <Button 
          size="icon"
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
      </div>
    </footer>
  );
};
