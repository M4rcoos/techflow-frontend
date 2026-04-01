import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, FileText, Wrench, Settings, UserCircle, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useRoleAccess } from '../hooks/use-role-access';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';

export function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const { canManageUsers } = useRoleAccess();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Clientes', icon: Users, href: '/clients' },
    { label: 'Orçamentos', icon: FileText, href: '/budgets' },
    { label: 'Ordens de Serviço', icon: Wrench, href: '/service-orders' },
    ...(canManageUsers ? [
      { label: 'Configurações', icon: Settings, href: '/settings' },
      { label: 'Usuários', icon: UserCircle, href: '/users' },
    ] : []),
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 bg-card border-b z-50 px-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-[#1e40af] flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="font-semibold text-sm">TechFlow</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 top-14"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed top-14 left-0 right-0 bg-card border-b z-50 transition-all duration-300",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-[#1e40af] text-white" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="border-t pt-4 mt-4 space-y-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="font-medium">Tema</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
