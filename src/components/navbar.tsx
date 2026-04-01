import { Link } from 'react-router-dom';
import { Zap, Users, FileText, LogOut, Menu, X, Moon, Sun, Shield, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks';
import { useRoleAccess } from '../hooks/use-role-access';
import { useState } from 'react';
import { useTheme } from '../lib/theme-context';

interface NavbarProps {
  showNavigation?: boolean;
}

export function Navbar({ showNavigation = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const { canManageUsers } = useRoleAccess();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
            <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg md:text-xl text-foreground">
                TechFlow
              </span>
              {user && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {user.company_name}
                </p>
              )}
            </div>
          </Link>

          {showNavigation && user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <Link to="/clients">
                  <Button variant="ghost">
                    <Users className="w-4 h-4 mr-2" />
                    Clientes
                  </Button>
                </Link>
                <Link to="/budgets">
                  <Button variant="ghost">
                    <FileText className="w-4 h-4 mr-2" />
                    Orçamentos
                  </Button>
                </Link>
                {canManageUsers && (
                  <Link to="/users">
                    <Button variant="ghost">
                      <Shield className="w-4 h-4 mr-2" />
                      Usuários
                    </Button>
                  </Link>
                )}
                {canManageUsers && (
                  <Link to="/settings">
                    <Button variant="ghost">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </>
          ) : !showNavigation ? (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary hover:bg-primary/90">Criar Conta Grátis</Button>
              </Link>
            </div>
          ) : null}
        </div>

        {showNavigation && user && mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <Button variant="ghost" className="w-full justify-start" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            </Button>
            <Link to="/clients" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Clientes
              </Button>
            </Link>
            <Link to="/budgets" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Orçamentos
              </Button>
            </Link>
            {canManageUsers && (
              <Link to="/users" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Usuários
                </Button>
              </Link>
            )}
            {canManageUsers && (
              <Link to="/settings" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </Link>
            )}
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
