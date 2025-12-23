import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Delegation OS</h1>
                <p className="text-sm text-muted-foreground">Impact Filter Framework</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button 
                  variant={location.pathname === '/' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin">
                <Button 
                  variant={location.pathname === '/admin' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Team Admin
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
