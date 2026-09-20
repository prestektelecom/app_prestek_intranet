const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

/**
 * Formato curto ("há 5min", "há 2h", "há 3d") para contextos de lista/card
 * com pouco espaço — Comunicados/AdminComunicados já usavam exatamente este
 * formato, copiado em 4 lugares (incluindo 2 divergências reais no Dashboard:
 * "agora" engolindo até 59min sem granularidade, e "Nd" sem o "há"). Extraído
 * aqui em vez de forçar tudo a usar `formatRelativeTime` (que escreve por
 * extenso, "há 5 minutos" — adequado para o sino de notificação, denso demais
 * para uma lista de cards).
 */
export function relativeTimeShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '';

  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'agora';
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)}min`;
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)}h`;
  if (diffSec < 604800) return `há ${Math.floor(diffSec / 86400)}d`;

  return date
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .replace(' de ', ' ');
}

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
