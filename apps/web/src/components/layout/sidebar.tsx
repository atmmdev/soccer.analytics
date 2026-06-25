'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Trophy,
  Target,
  Ticket,
  Zap,
  Wallet,
  BarChart3,
  Bot,
  Bell,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useTicketDraftStore } from '@/stores/ticket-draft.store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Jogos', href: '/matches', icon: Trophy },
  { name: 'Mercados', href: '/markets', icon: Target },
  { name: 'Bilhetes', href: '/tickets', icon: Ticket },
  { name: 'Scanner EV+', href: '/scanner', icon: Zap },
  { name: 'Banca', href: '/bankroll', icon: Wallet },
  { name: 'Estatísticas', href: '/analyzer', icon: BarChart3 },
  { name: 'IA Trader', href: '/research', icon: Bot },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const ticketDraftCount = useTicketDraftStore((s) => s.selections.length);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-[#0d0d0d]">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/dashboard">
          <Logo variant="horizontal" />
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.href === '/tickets' && ticketDraftCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {ticketDraftCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-3 p-4">
        <Separator />
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Plano Pro</span>
            <span className="text-muted-foreground">Admin</span>
          </div>
          <Progress value={100} className="mt-2 h-1.5" />
          <p className="mt-1.5 truncate text-[10px] text-muted-foreground">
            Acesso exclusivo · {user?.email}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-secondary text-foreground">
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-xs text-muted-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Central de Ajuda
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-xs text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
