'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TeamLogoProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  /** Initials fallback uses rounded-full by default */
  rounded?: 'full' | 'md' | 'none';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

/**
 * Escudo/logo do time. Usa <img> com referrerPolicy="no-referrer"
 * porque o CDN da API-Football (media.api-sports.io) bloqueia hotlink
 * com referrer do app — sem isso a imagem falha e cai no fallback.
 */
export function TeamLogo({
  src,
  name,
  size = 32,
  className,
  rounded = 'full',
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const roundedClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'md'
        ? 'rounded-md'
        : 'rounded-none';

  if (!src || failed) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center bg-secondary text-xs font-semibold text-muted-foreground',
          roundedClass,
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
        title={name}
        aria-label={name}
      >
        {initialsFromName(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CDN externo exige referrerPolicy
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      className={cn('shrink-0 object-contain', roundedClass, className)}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
