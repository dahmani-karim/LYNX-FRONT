/**
 * Export LYNX alerts to a CSV file (UTF-8 with BOM for Excel compatibility).
 * @param {Array} events - Alert objects from alertStore
 */
export function downloadCsv(events) {
  const headers = ['Date', 'Titre', 'Catégorie', 'Sévérité', 'Pays', 'Source', 'Score', 'URL'];

  const rows = events.map((e) => [
    e.eventDate ? new Date(e.eventDate).toLocaleString('fr-FR') : '',
    e.title || '',
    e.type || '',
    e.severity || '',
    e.country || '',
    e.sourceName || e.source || '',
    e.score != null ? String(e.score) : '',
    e.sourceUrl || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\r\n');

  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `lynx-alertes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
