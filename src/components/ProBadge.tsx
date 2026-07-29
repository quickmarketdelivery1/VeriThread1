import React from 'react';
import { ProfessionalBadge } from './ProfessionalBadge';
import { EnterpriseBadge } from './EnterpriseBadge';

export { ProfessionalBadge } from './ProfessionalBadge';
export { EnterpriseBadge } from './EnterpriseBadge';

interface ProBadgeProps {
  plan?: string;
  size?: number | 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function ProBadge({ plan, size = 24, className = '', showLabel }: ProBadgeProps) {
  if (!plan) return null;
  const normalizedPlan = String(plan).toLowerCase().trim();

  if (normalizedPlan === 'professional' || normalizedPlan === 'pro') {
    return <ProfessionalBadge className={className} size={size} />;
  }

  if (normalizedPlan === 'enterprise') {
    return <EnterpriseBadge className={className} size={size} />;
  }

  return null;
}

export default ProBadge;
