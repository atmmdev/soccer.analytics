import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'horizontal' | 'vertical';
  className?: string;
}

export function Logo({ variant = 'horizontal', className }: LogoProps) {
  if (variant === 'vertical') {
    return (
      <div className={cn('flex justify-center', className)}>
        <Image
          src="/brand/logo.png"
          alt="Soccer Analytics do ATM"
          width={628}
          height={217}
          className="h-auto w-[220px] max-w-full object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/brand/logo.png"
        alt="Soccer Analytics do ATM"
        width={628}
        height={200}
        priority
      />
    </div>
  );
}
