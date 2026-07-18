const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return String(dateStr);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) {
    return 'agora';
  }
  if (diffHour < 1) {
    return rtf.format(-diffMin, 'minute');
  }
  if (diffDay < 1) {
    return rtf.format(-diffHour, 'hour');
  }
  if (diffDay === 1) {
    return 'ontem';
  }
  if (diffDay < 30) {
    return rtf.format(-diffDay, 'day');
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch (_) {
    return String(dateStr);
  }
}
