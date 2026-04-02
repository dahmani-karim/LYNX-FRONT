/**
 * Generate a PDF dossier for a specific country.
 * Uses jsPDF (already bundled via pdfExport).
 */

export async function generateCountryDossierPDF(country, nearbyAlerts, alertsByCategory, riskLevel, categories) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  const riskLabels = { low: 'Faible', medium: 'Modéré', high: 'Élevé', critical: 'Critique' };
  const riskColors = { low: [16, 185, 129], medium: [245, 158, 11], high: [249, 115, 22], critical: [239, 68, 68] };

  // Header
  doc.setFillColor(8, 12, 20);
  doc.rect(0, 0, W, 30, 'F');
  doc.setTextColor(241, 245, 249);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('LYNX — Dossier Pays', 10, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 10, y);
  y = 38;

  // Country name + official
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const name = country.translations?.fra?.common || country.name?.common || '—';
  doc.text(name, 10, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(country.translations?.fra?.official || country.name?.official || '', 10, y);
  y += 10;

  // Risk level
  const [r, g, b] = riskColors[riskLevel] || [100, 100, 100];
  doc.setFillColor(r, g, b);
  doc.roundedRect(10, y, 60, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Risque : ${riskLabels[riskLevel]} (${nearbyAlerts.length} alerte${nearbyAlerts.length !== 1 ? 's' : ''})`, 14, y + 5.5);
  y += 15;

  // Info grid
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations générales', 10, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const info = [
    ['Capitale', country.capital?.[0] || '—'],
    ['Population', country.population ? (country.population / 1e6).toFixed(1) + ' M' : '—'],
    ['Superficie', country.area ? Math.round(country.area).toLocaleString('fr-FR') + ' km²' : '—'],
    ['Langues', country.languages ? Object.values(country.languages).slice(0, 4).join(', ') : '—'],
    ['Monnaie', country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : '—'],
    ['Fuseaux', country.timezones ? country.timezones.slice(0, 3).join(', ') : '—'],
    ['Région', `${country.region || ''}${country.subregion ? ' · ' + country.subregion : ''}`],
  ];

  for (const [label, value] of info) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(`${label} :`, 12, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, 45, y);
    y += 5.5;
  }
  y += 5;

  // Alert breakdown
  if (Object.keys(alertsByCategory).length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text('Répartition des alertes par catégorie', 10, y);
    y += 7;

    doc.setFontSize(9);
    const sorted = Object.entries(alertsByCategory).sort((a, b) => b[1] - a[1]);
    for (const [type, count] of sorted) {
      const cat = categories[type] || { label: type, color: '#9CA3AF' };
      const hex = cat.color || '#9CA3AF';
      const cr = parseInt(hex.slice(1, 3), 16);
      const cg = parseInt(hex.slice(3, 5), 16);
      const cb = parseInt(hex.slice(5, 7), 16);
      doc.setFillColor(cr, cg, cb);
      doc.circle(15, y - 1.2, 1.5, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 30);
      doc.text(`${cat.label} : ${count} alerte${count > 1 ? 's' : ''}`, 20, y);
      y += 5;
    }
    y += 5;
  }

  // Top alerts detail
  if (nearbyAlerts.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 30, 30);
    doc.text(`Dernières alertes (${Math.min(nearbyAlerts.length, 10)} / ${nearbyAlerts.length})`, 10, y);
    y += 7;

    const topAlerts = [...nearbyAlerts]
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
      .slice(0, 10);

    doc.setFontSize(8);
    for (const alert of topAlerts) {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      const sevColors = { critical: [239, 68, 68], high: [249, 115, 22], medium: [245, 158, 11], low: [16, 185, 129], info: [99, 102, 241] };
      const [sr, sg, sb] = sevColors[alert.severity] || [100, 100, 100];
      doc.setFillColor(sr, sg, sb);
      doc.circle(14, y - 1, 1.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(alert.title?.substring(0, 80) || '—', 18, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${alert.sourceName || '?'} · ${new Date(alert.eventDate).toLocaleDateString('fr-FR')}`, 18, y);
      y += 5.5;
    }
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LYNX Intelligence · Dossier ${name} · Page ${i}/${pageCount}`, W / 2, 290, { align: 'center' });
  }

  doc.save(`LYNX_Dossier_${name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
