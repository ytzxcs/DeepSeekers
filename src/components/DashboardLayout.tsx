
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Clock, 
  Settings, 
  LogOut, 
  Menu, 
  User,
  Users
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      icon: Package,
      label: 'Products',
      path: '/products',
    },
    {
      icon: Clock,
      label: 'Price Audit Log',
      path: '/price-audit-log',
    },
    {
      icon: Users,
      label: 'User Management',
      path: '/user-management',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-sidebar fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out border-r",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isMobile ? "shadow-lg" : ""
        )}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-semibold">
              Product <span className="text-sidebar-primary">Manager</span>
            </h1>
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-auto py-4">
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    window.location.pathname === item.path && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                <User className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-sidebar-foreground">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-200 ease-in-out",
        isSidebarOpen && !isMobile ? "ml-64" : "ml-0"
      )}>
        {/* Top navigation */}
        <header className="h-16 border-b flex items-center px-4 sticky top-0 bg-background z-10">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-4"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">
            {menuItems.find((item) => item.path === window.location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        
        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
