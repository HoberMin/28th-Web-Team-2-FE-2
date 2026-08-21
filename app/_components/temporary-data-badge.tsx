interface TemporaryDataBadgeProps {
  className?: string;
}

export function TemporaryDataBadge({ className = "" }: TemporaryDataBadgeProps) {
  return (
    <span
      role="status"
      data-data-source="temporary"
      className={`shrink-0 rounded-full bg-surface-accent-orange-subtle px-2 py-0.5 text-caption-12-medium text-content-accent-badge ${className}`}
    >
      예시 데이터
    </span>
  );
}
