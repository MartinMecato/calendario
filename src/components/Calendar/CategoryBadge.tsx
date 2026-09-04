import React from 'react';
import { CATEGORIES } from '@/lib/constants';
import { CategoryType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  category: CategoryType;
  className?: string;
  showDot?: boolean;
}

export function CategoryBadge({ category, className, showDot = true }: Props) {
  const cat = CATEGORIES[category] || CATEGORIES.otro;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        cat.bgLight,
        cat.textLight,
        cat.border,
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', cat.dotColor)} />
      )}
      {cat.label}
    </span>
  );
}
