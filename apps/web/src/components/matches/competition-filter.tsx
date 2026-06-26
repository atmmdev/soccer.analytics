'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CompetitionOption {
  id: string;
  name: string;
  country: string | null;
  matchCount: number;
}

interface CompetitionFilterProps {
  competitions: CompetitionOption[];
  value: string | null;
  onChange: (competitionId: string | null) => void;
  isLoading?: boolean;
}

/** Ignora prefixo de divisão (ex.: "1. ", "2 ") só para ordenação/busca */
function normalizeForSort(name: string): string {
  return name.replace(/^\d+\.?\s*/, '').trim().toLowerCase();
}

function sortCompetitions(items: CompetitionOption[]): CompetitionOption[] {
  return [...items].sort((a, b) => {
    const byName = normalizeForSort(a.name).localeCompare(normalizeForSort(b.name), 'pt-BR');
    if (byName !== 0) return byName;
    const byCountry = (a.country ?? '').localeCompare(b.country ?? '', 'pt-BR');
    if (byCountry !== 0) return byCountry;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function CompetitionFilter({
  competitions,
  value,
  onChange,
  isLoading,
}: CompetitionFilterProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => competitions.find((c) => c.id === value) ?? null,
    [competitions, value],
  );

  const filtered = useMemo(() => {
    const sorted = sortCompetitions(competitions);
    const q = query.trim().toLowerCase();
    if (!q) return sorted;

    return sorted.filter((c) => {
      const haystack = [
        c.name,
        normalizeForSort(c.name),
        c.country ?? '',
        String(c.matchCount),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [competitions, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery('');
  }

  function handleClear() {
    onChange(null);
    setQuery('');
    setOpen(false);
  }

  const inputValue = open ? query : selected ? selected.name : query;

  return (
    <div ref={containerRef} className="relative mb-6 max-w-md">
      <label htmlFor="competition-filter" className="mb-2 block text-sm font-medium">
        Campeonato
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="competition-filter"
          placeholder={isLoading ? 'Carregando campeonatos...' : 'Buscar campeonato...'}
          className="h-10 bg-secondary/30 pl-9 pr-10"
          value={inputValue}
          disabled={isLoading}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
        />
        {(selected || query) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={handleClear}
            aria-label="Limpar filtro"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selected && !open && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {selected.matchCount} jogos
          {selected.country ? ` · ${selected.country}` : ''}
        </p>
      )}

      {open && !isLoading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg">
          <ul
            className="max-h-72 overflow-y-auto overscroll-contain p-1"
            role="listbox"
            aria-label="Campeonatos"
          >
            <li>
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary/60',
                  !value && 'bg-secondary/40 font-medium',
                )}
                onClick={() => handleSelect(null)}
              >
                <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                Todos os campeonatos
              </button>
            </li>
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhum campeonato encontrado
              </li>
            ) : (
              filtered.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={value === c.id}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary/60',
                      value === c.id && 'bg-primary/10 font-medium text-primary',
                    )}
                    onClick={() => handleSelect(c.id)}
                  >
                    <Trophy className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{c.name}</span>
                      {c.country && (
                        <span className="text-xs text-muted-foreground">{c.country}</span>
                      )}
                    </span>
                    <span
                      className="shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground"
                      title={`${c.matchCount} jogos`}
                    >
                      {c.matchCount}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
