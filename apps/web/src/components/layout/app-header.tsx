'use client';

import Link from 'next/link';
import { Bell, LogOut, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useAlertsSummary } from '@/hooks/use-alerts';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const { data: alertSummary } = useAlertsSummary();
  const alertCount = alertSummary?.bet ?? 0;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar jogos, times, mercados..."
              className="h-9 bg-secondary/50 pl-9"
            />
          </div>

          <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0" asChild>
            <Link href="/alerts" aria-label="Alertas EV+">
              <Bell className="h-4 w-4" />
              {alertCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2 px-2">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium leading-none">Admin</p>
                  <p className="text-xs text-primary">Nível Pro</p>
                </div>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                    {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Administrador</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
