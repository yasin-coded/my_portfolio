import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderGit2,
  Wrench,
  GraduationCap,
  Tags,
  MessageSquare,
  Mail,
  User,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStats } from '../../hooks/useDashboardData';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/posts', label: 'Posts', icon: FileText },
    { to: '/dashboard/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
    { to: '/dashboard/experience', label: 'Experience', icon: GraduationCap },
    { to: '/dashboard/taxonomy', label: 'Taxonomy', icon: Tags },
    {
      to: '/dashboard/comments',
      label: 'Comments',
      icon: MessageSquare,
      badge: stats?.pending_comments > 0 ? stats.pending_comments : null,
      badgeColor: 'bg-warning text-bg',
    },
    {
      to: '/dashboard/messages',
      label: 'Messages',
      icon: Mail,
      badge: stats?.unread_messages > 0 ? stats.unread_messages : null,
      badgeColor: 'bg-accent text-on-accent',
    },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface border-r border-border flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-sm font-bold text-text">root@devfolio</span>
          </div>
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              className="p-1.5 rounded hover:bg-surface-2 text-text-muted hover:text-text transition-colors"
              title="View Live Site"
            >
              <Home className="w-4 h-4" />
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-danger/10 text-danger transition-colors md:hidden"
              title="Exit Terminal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User bar */}
        <div className="px-4 py-3 bg-surface-2/60 border-b border-border/60 font-mono text-xs text-text-muted flex items-center justify-between">
          <span>// superuser</span>
          <span className="text-accent font-semibold">{user?.username || 'admin'}</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2 rounded-md font-mono text-xs transition-colors whitespace-nowrap min-h-[38px] gap-2',
                    isActive
                      ? 'bg-accent text-on-accent font-semibold'
                      : 'text-text-muted hover:bg-surface-2 hover:text-text'
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold leading-none shrink-0',
                      item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout CTA Desktop */}
        <div className="p-3 border-t border-border mt-auto hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full justify-start text-danger hover:text-danger hover:bg-danger/10"
          >
            Exit Terminal
          </Button>
        </div>
      </aside>

      {/* Main Dashboard Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
