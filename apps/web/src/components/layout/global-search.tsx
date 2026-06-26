'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Target, Trophy, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/use-search';

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const debounced = useDebounced(query);
  const { data, isLoading, isFetching } = useSearch(debounced);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasResults =
    data &&
    (data.matches.length > 0 || data.teams.length > 0 || data.markets.length > 0);

  const showDropdown = open && debounced.length >= 2;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative hidden max-w-md flex-1 md:block">
      <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar jogos, times, mercados..."
        className="h-9 bg-secondary/50 pl-9"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
          {(isLoading || isFetching) && !data && (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          )}

          {!isLoading && !hasResults && (
            <p className="p-4 text-sm text-muted-foreground">Nenhum resultado para &quot;{debounced}&quot;</p>
          )}

          {data && data.matches.length > 0 && (
            <div className="border-b border-border/60 p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Jogos</p>
              {data.matches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/60"
                  onClick={() => navigate(`/matches/${m.id}`)}
                >
                  <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.competition} ·{' '}
                      {new Date(m.matchDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {data && data.teams.length > 0 && (
            <div className="border-b border-border/60 p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Times</p>
              {data.teams.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/60"
                  onClick={() => navigate(`/matches?q=${encodeURIComponent(t.name)}`)}
                >
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    {t.name}
                    {t.country && (
                      <span className="ml-1 text-xs text-muted-foreground">({t.country})</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          {data && data.markets.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Mercados analisados</p>
              {data.markets.map((m, i) => (
                <button
                  key={`${m.matchId}-${m.market}-${i}`}
                  type="button"
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary/60"
                  onClick={() => navigate(`/matches/${m.matchId}`)}
                >
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                  <div>
                    <p className="font-medium">
                      {m.market}{' '}
                      <span className="text-emerald-400">+{m.ev}% EV</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{m.matchLabel}</p>
                  </div>
                </button>
              ))}
              <Link
                href="/scanner"
                className="mt-1 block px-2 py-1 text-xs text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Ver todos no Scanner EV+
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
