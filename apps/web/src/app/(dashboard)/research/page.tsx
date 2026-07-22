'use client';

import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FlaskConical, Loader2, Play, Trash2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useCreateStrategy,
  useDeleteStrategy,
  usePreviewSimulation,
  useResearchStrategies,
  useRunSimulation,
} from '@/hooks/use-research';
import {
  MARKET_LABELS,
  type ResearchMarket,
  type SimulationResult,
  type StrategyFilters,
} from '@/types/research';
import { toast } from 'sonner';

const DEFAULT_FILTERS: StrategyFilters = {
  market: 'OVER_2_5',
  team: '',
  competition: '',
  sampleSize: 100,
  flatStake: 10,
  allowSynthetic: false,
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function ResultsPanel({ result }: { result: SimulationResult }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge variant={result.dataSource === 'history' ? 'default' : 'secondary'}>
          {result.dataSource === 'history' ? 'Histórico real' : 'Fallback sintético'}
        </Badge>
        <Badge variant="outline">{result.totalBets} apostas simuladas</Badge>
        {result.dataSource === 'history' && result.totalBets < 10 && (
          <Badge variant="outline" className="text-amber-400">
            Amostra pequena — sincronize mais jogos ou ative sintético
          </Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ROI</p>
            <p className={`font-mono text-xl font-bold ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Win rate</p>
            <p className="font-mono text-xl font-bold">{result.winRate}%</p>
            <p className="text-xs text-muted-foreground">{result.wins}G · {result.losses}R</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lucro</p>
            <p className={`font-mono text-xl font-bold ${result.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(result.profit)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Max drawdown</p>
            <p className="font-mono text-xl font-bold text-amber-400">{result.maxDrawdown}%</p>
          </CardContent>
        </Card>
      </div>

      {result.bankrollCurve.length > 1 && (
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Curva da banca (simulação)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.bankrollCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="index" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(v: number) => [formatCurrency(v), 'Banca']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" fill="#10b98133" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {result.bets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogo</TableHead>
              <TableHead>Placar</TableHead>
              <TableHead className="text-right">Odd</TableHead>
              <TableHead className="text-right">P/L</TableHead>
              <TableHead className="text-right">Resultado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.bets.map((bet, i) => (
              <TableRow key={i}>
                <TableCell>{bet.matchLabel}</TableCell>
                <TableCell className="font-mono">{bet.score}</TableCell>
                <TableCell className="text-right font-mono">{bet.odd.toFixed(2)}</TableCell>
                <TableCell className={`text-right font-mono ${bet.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(bet.profit)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={bet.won ? 'success' : 'secondary'}>
                    {bet.won ? 'Green' : 'Red'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function ResearchPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState<StrategyFilters>(DEFAULT_FILTERS);
  const [preview, setPreview] = useState<SimulationResult | null>(null);

  const { data: strategies, isLoading } = useResearchStrategies();
  const previewSim = usePreviewSimulation();
  const createStrategy = useCreateStrategy();
  const runSimulation = useRunSimulation();
  const deleteStrategy = useDeleteStrategy();

  const handlePreview = () => {
    const payload = {
      ...filters,
      team: filters.team || undefined,
      competition: filters.competition || undefined,
    };
    previewSim.mutate(payload, {
      onSuccess: (data) => {
        setPreview(data);
        toast.success('Simulação concluída');
      },
      onError: () => toast.error('Falha na simulação'),
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Informe um nome para a hipótese');
      return;
    }
    createStrategy.mutate(
      {
        name,
        description: description || undefined,
        filters: {
          ...filters,
          team: filters.team || undefined,
          competition: filters.competition || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Hipótese salva');
          setName('');
          setDescription('');
        },
        onError: () => toast.error('Falha ao salvar'),
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        title="Research Lab"
        subtitle="Valide hipóteses com jogos finalizados do banco (sintético só se você permitir)"
      />

      <div className="flex-1 space-y-6 p-6">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-primary" />
              Nova hipótese
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Over 2.5 — Brasil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Mercado</label>
                <Select
                  value={filters.market}
                  onValueChange={(v) =>
                    setFilters((f) => ({ ...f, market: v as ResearchMarket }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MARKET_LABELS) as ResearchMarket[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {MARKET_LABELS[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Time (filtro opcional)</label>
                <Input
                  value={filters.team ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value }))}
                  placeholder="Ex: Brasil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Competição (opcional)</label>
                <Input
                  value={filters.competition ?? ''}
                  onChange={(e) => setFilters((f) => ({ ...f, competition: e.target.value }))}
                  placeholder="Ex: Brasileirão"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Amostra (jogos)</label>
                <Input
                  type="number"
                  min={20}
                  max={500}
                  value={filters.sampleSize}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sampleSize: Number(e.target.value) || 100 }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Stake fixa (R$)</label>
                <Input
                  type="number"
                  min={1}
                  value={filters.flatStake}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, flatStake: Number(e.target.value) || 10 }))
                  }
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={Boolean(filters.allowSynthetic)}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, allowSynthetic: e.target.checked }))
                }
              />
              Permitir fallback sintético se histórico &lt; 10 apostas
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional da hipótese"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePreview} disabled={previewSim.isPending}>
                {previewSim.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Simular
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={createStrategy.isPending}>
                Salvar hipótese
              </Button>
            </div>
          </CardContent>
        </Card>

        {preview && <ResultsPanel result={preview} />}

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Hipóteses salvas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !strategies?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhuma hipótese salva. Simule e salve para comparar estratégias.
              </p>
            ) : (
              <div className="space-y-3">
                {strategies.map((s) => {
                  const lastResult =
                    (s.results as SimulationResult | null) ??
                    (s.simulations?.[0]?.results as SimulationResult | undefined);
                  return (
                    <Card key={s.id} className="border-border/60 bg-card/50">
                      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {MARKET_LABELS[s.filters.market]}
                            {s.filters.team ? ` · ${s.filters.team}` : ''}
                            {lastResult
                              ? ` · ROI ${lastResult.roi >= 0 ? '+' : ''}${lastResult.roi}%`
                              : ' · não simulado'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={runSimulation.isPending}
                            onClick={() =>
                              runSimulation.mutate(s.id, {
                                onSuccess: (data) => {
                                  setPreview(data);
                                  toast.success('Simulação atualizada');
                                },
                              })
                            }
                          >
                            Executar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              deleteStrategy.mutate(s.id, {
                                onSuccess: () => toast.success('Removida'),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
