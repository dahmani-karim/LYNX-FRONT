import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });
  } catch {
    return '';
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return `Aujourd'hui à ${format(d, 'HH:mm', { locale: fr })}`;
    if (isYesterday(d)) return `Hier à ${format(d, 'HH:mm', { locale: fr })}`;
    return format(d, 'dd MMM yyyy à HH:mm', { locale: fr });
  } catch {
    return '';
  }
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'dd/MM HH:mm', { locale: fr });
  } catch {
    return '';
  }
}
