import type { ReactNode } from 'react';

export default function CommandMetricCard({
  title,
  value,
  footnote,
  icon,
  variant = 'neutral',
}: {
  title: string;
  value: string;
  footnote?: string;
  icon?: ReactNode;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'info';
}) {
  const accent = {
    neutral: 'background:#f7f9fc;color:#19253a;',
    primary: 'background:#eef4ff;color:#003087;',
    success: 'background:#e8f6ef;color:#0f6e55;',
    warning: 'background:#fff4e6;color:#a86b00;',
    info: 'background:#e7f5fc;color:#0d6d75;',
  }[variant];

  return (
    <div className="stat-card" style={{ borderColor: 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {icon ? <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: 11, background: '#f0f3fb' }}>{icon}</span> : null}
      </div>
      <strong style={{ marginTop: 12 }}>{value}</strong>
      {footnote ? <small style={{ display: 'block', marginTop: 8, color: '#657285' }}>{footnote}</small> : null}
    </div>
  );
}
