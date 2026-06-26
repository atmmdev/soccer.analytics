'use client';

import { Bot, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  RECOMMENDATION_LABELS,
  RECOMMENDATION_VARIANT,
} from '@/types/analysis';
import type { AiExplanation } from '@/types/ai';
import type { Recommendation } from '@/types/analysis';

interface AiExplanationPanelProps {
  explanation: AiExplanation | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function AiExplanationPanel({
  explanation,
  isLoading,
  isError,
}: AiExplanationPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-border/60 bg-card/50">
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Execute uma análise antes de pedir explicação.
        </CardContent>
      </Card>
    );
  }

  if (!explanation) return null;

  return (
    <Card className="border-primary/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-primary" />
          IA Trader — Explicação
        </CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {explanation.provider === 'openai' ? 'OpenAI + dados reais' : 'Template + dados reais'}
          </Badge>
          {explanation.topPick && (
            <Badge variant="success">Destaque: {explanation.topPick}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{explanation.summary}</p>

        <div className="space-y-3">
          {explanation.marketInsights
            .filter((m) => m.recommendation !== 'SKIP')
            .slice(0, 4)
            .map((m) => (
              <div
                key={m.selection}
                className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-medium">{m.selection}</span>
                  <Badge
                    variant={
                      RECOMMENDATION_VARIANT[m.recommendation as Recommendation]
                    }
                  >
                    {RECOMMENDATION_LABELS[m.recommendation as Recommendation]}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {m.explanation}
                </p>
              </div>
            ))}
        </div>

        {explanation.risks.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <p className="mb-1 text-xs font-medium text-amber-200">Riscos e limitações</p>
            <ul className="list-inside list-disc space-y-1 text-xs text-amber-200/90">
              {explanation.risks.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground">
          Fontes: {explanation.dataSources.join(' · ')}
        </p>
      </CardContent>
    </Card>
  );
}
