import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type PromptName =
  | 'analyzer'
  | 'ticket-builder'
  | 'odds-evaluator'
  | 'predictor';

/**
 * Carrega markdown de docs/prompts/ (SSOT dos agentes).
 * Resolve a partir de apps/api (cwd típico) ou raiz do monorepo.
 */
export function loadPromptMarkdown(name: PromptName): string | null {
  const file = `${name}.md`;
  const candidates = [
    resolve(process.cwd(), '../../docs/prompts', file),
    resolve(process.cwd(), '../docs/prompts', file),
    resolve(process.cwd(), 'docs/prompts', file),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      return readFileSync(path, 'utf8');
    }
  }
  return null;
}
