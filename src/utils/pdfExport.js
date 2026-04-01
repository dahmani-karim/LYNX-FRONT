import { jsPDF } from 'jspdf';
import { CATEGORIES, SEVERITY_LEVELS } from '../config/categories';

const COLORS = {
  bg: [8, 12, 20],
  surface: [15, 23, 42],
  accent: [43, 123, 191],
  text: [241, 245, 249],
  muted: [148, 163, 184],
  success: [16, 185, 129],
  warning: [245, 158, 11],
  danger: [239, 68, 68],
};

function severityColor(severity) {
  const map = {
    critical: COLORS.danger,
    high: [249, 115, 22],
    medium: COLORS.warning,
    low: COLORS.success,
    info: COLORS.muted,
  };
  return map[severity] || COLORS.muted;
}

export function generateReport(events, riskScores) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  function checkPage(needed = 20) {
    if (y + needed > ph - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // ─── Header ──────────────────────────────────────────
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, pw, 40, 'F');

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text('LYNX', margin, 18);

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text('Rapport de situation', margin, 26);

  const now = new Date();
  doc.setFontSize(8);
  doc.text(
    `Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}`,
    margin,
    33
  );

  y = 50;

  // ─── Global Risk Score ───────────────────────────────
  const globalScore = riskScores.global || 0;
  doc.setFillColor(...COLORS.surface);
  doc.roundedRect(margin, y, pw - 2 * margin, 25, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  doc.text('Score de risque global', margin + 5, y + 8);

  const scoreColor = globalScore >= 70 ? COLORS.danger : globalScore >= 40 ? COLORS.warning : COLORS.success;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...scoreColor);
  doc.text(`${globalScore}/100`, margin + 5, y + 20);

  // Score bar
  const barX = margin + 50;
  const barW = pw - 2 * margin - 55;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(barX, y + 14, barW, 5, 2, 2, 'F');
  doc.setFillColor(...scoreColor);
  doc.roundedRect(barX, y + 14, barW * (globalScore / 100), 5, 2, 2, 'F');

  y += 32;

  // ─── Summary Stats ───────────────────────────────────
  const criticalCount = events.filter((e) => e.severity === 'critical').length;
  const highCount = events.filter((e) => e.severity === 'high').length;
  const categories = new Set(events.map((e) => e.type)).size;

  const stats = [
    { label: 'Total événements', value: events.length, color: COLORS.accent },
    { label: 'Critiques', value: criticalCount, color: COLORS.danger },
    { label: 'Élevés', value: highCount, color: COLORS.warning },
    { label: 'Catégories', value: categories, color: COLORS.muted },
  ];

  const statW = (pw - 2 * margin - 9) / 4;
  stats.forEach((stat, i) => {
    const sx = margin + i * (statW + 3);
    doc.setFillColor(...COLORS.surface);
    doc.roundedRect(sx, y, statW, 18, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...stat.color);
    doc.text(String(stat.value), sx + statW / 2, y + 10, { align: 'center' });
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(stat.label, sx + statW / 2, y + 15, { align: 'center' });
  });

  y += 25;

  // ─── Module Scores ───────────────────────────────────
  checkPage(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.text);
  doc.text('Scores par module', margin, y);
  y += 7;

  Object.entries(riskScores)
    .filter(([key]) => key !== 'global' && CATEGORIES[key])
    .sort(([, a], [, b]) => b - a)
    .forEach(([key, score]) => {
      checkPage(10);
      const cat = CATEGORIES[key];
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.muted);
      doc.text(cat.label, margin + 2, y + 4);

      const bx = margin + 40;
      const bw = pw - 2 * margin - 55;
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(bx, y, bw, 5, 1.5, 1.5, 'F');

      const sc = score >= 70 ? COLORS.danger : score >= 40 ? COLORS.warning : COLORS.success;
      doc.setFillColor(...sc);
      doc.roundedRect(bx, y, Math.max(bw * (score / 100), 1), 5, 1.5, 1.5, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...sc);
      doc.text(String(score), pw - margin - 3, y + 4, { align: 'right' });

      y += 8;
    });

  y += 5;

  // ─── Critical & High Events ──────────────────────────
  const importantEvents = events
    .filter((e) => e.severity === 'critical' || e.severity === 'high')
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 15);

  if (importantEvents.length > 0) {
    checkPage(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Événements critiques & élevés', margin, y);
    y += 7;

    importantEvents.forEach((event) => {
      checkPage(18);
      const cat = CATEGORIES[event.type] || CATEGORIES.other;

      doc.setFillColor(...COLORS.surface);
      doc.roundedRect(margin, y, pw - 2 * margin, 14, 2, 2, 'F');

      // Severity dot
      doc.setFillColor(...severityColor(event.severity));
      doc.circle(margin + 5, y + 7, 2, 'F');

      // Title (truncated)
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      const title = event.title.length > 60 ? event.title.slice(0, 57) + '...' : event.title;
      doc.text(title, margin + 10, y + 6);

      // Meta
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.muted);
      const d = new Date(event.eventDate);
      const dateStr = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      doc.text(`${cat.label} • ${event.sourceName} • ${dateStr}`, margin + 10, y + 11);

      y += 16;
    });
  }

  y += 5;

  // ─── Category Distribution ───────────────────────────
  const catCounts = {};
  events.forEach((e) => {
    catCounts[e.type] = (catCounts[e.type] || 0) + 1;
  });
  const catEntries = Object.entries(catCounts).sort(([, a], [, b]) => b - a);

  if (catEntries.length > 0) {
    checkPage(20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text('Répartition par catégorie', margin, y);
    y += 7;

    catEntries.forEach(([type, count]) => {
      checkPage(8);
      const cat = CATEGORIES[type] || CATEGORIES.other;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.muted);
      doc.text(`${cat.label}`, margin + 2, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.text);
      doc.text(String(count), pw - margin - 3, y + 4, { align: 'right' });

      y += 7;
    });
  }

  // ─── Footer ──────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(
      `LYNX – Rapport de situation – Page ${i}/${totalPages}`,
      pw / 2,
      ph - 7,
      { align: 'center' }
    );
  }

  doc.save(`LYNX_Rapport_${now.toISOString().slice(0, 10)}.pdf`);
}
