import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Wrench,
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  UserCircle,
  AlertCircle,
  Crown
} from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { useRoleAccess } from '../hooks/use-role-access';
import { useTheme } from '../lib/theme-context';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  show?: boolean;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const { canManageUsers } = useRoleAccess();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', show: true },
    { label: 'Urgentes', icon: AlertCircle, href: '/urgents', show: true },
    { label: 'Clientes', icon: Users, href: '/clients', show: true },
    { label: 'Orçamentos', icon: FileText, href: '/budgets', show: true },
    { label: 'Ordens de Serviço', icon: Wrench, href: '/service-orders', show: true },
    { label: 'Plano', icon: Crown, href: '/settings/billing', show: true },
    { label: 'Configurações', icon: Settings, href: '/settings', show: canManageUsers },
    { label: 'Usuários', icon: UserCircle, href: '/users', show: canManageUsers },
  ];

  const filteredNavItems = navItems.filter(item => item.show !== false);

  const handleLogout = () => {
    logout();
  };

  return (
    <aside 
      className={cn(
        "hidden lg:flex fixed top-0 left-0 h-screen bg-card border-r flex-col z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center justify-between p-3 border-b h-14">
        <Link to="/dashboard" className={cn("flex items-center gap-2", collapsed && "mx-auto")}>
          <div className="w-8 h-8 rounded-lg bg-[#1e40af] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-foreground text-sm">TechFlow</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '?');
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-[#1e40af] text-white" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t space-y-0.5">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Tema" : undefined}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 flex-shrink-0" />
          ) : (
            <Moon className="w-5 h-5 flex-shrink-0" />
          )}
          {!collapsed && <span className="text-sm font-medium">Tema</span>}
        </button>

        {user && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg",
            collapsed ? "justify-center" : "bg-muted/50"
          )}>
            <div className="w-8 h-8 rounded-full bg-[#1e40af] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.role}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border rounded-full flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
