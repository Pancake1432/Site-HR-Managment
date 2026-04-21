import { jsPDF } from 'jspdf';
import { SavedStatement } from '../types/dashboard';

type Currency = 'USD' | 'EUR';
type DistUnit = 'miles' | 'km';
type DateFmt  = 'MM/DD/YY' | 'DD/MM/YY';

const CURRENCY_SYMBOLS: Record<Currency, string> = { USD: '$', EUR: '€' };

function fmtMoney(val: string, currency: Currency) {
  return `${CURRENCY_SYMBOLS[currency]}${parseFloat(val || '0').toFixed(2)}`;
}

function fmtDateStr(iso: string, fmt: DateFmt) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return fmt === 'MM/DD/YY' ? `${mm}/${dd}/${yy}` : `${dd}/${mm}/${yy}`;
}

export function downloadStatementPDF(
  statement: SavedStatement,
  currency: Currency,
  distanceUnit: DistUnit,
  dateFormat: DateFmt,
  companyName: string = 'Paks Logistic LLC'
) {
  const sym  = CURRENCY_SYMBOLS[currency];
  const dist = distanceUnit;
  const date = fmtDateStr(statement.savedAt, dateFormat);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W   = 210;
  const pad = 20;
  let   y   = 25;

  const accent: [number, number, number] = [102, 126, 234];

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accent);
  doc.text('Payment Statement', W / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`${companyName}  |  Date: ${date}  |  ID: ${statement.id}`, W / 2, y, { align: 'center' });
  y += 5;

  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(pad, y, W - pad, y);
  y += 10;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const section = (title: string) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text(title, pad, y);
    y += 2;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(pad, y, W - pad, y);
    y += 7;
  };

  const row = (label: string, value: string, shaded = false) => {
    if (shaded) {
      doc.setFillColor(245, 247, 255);
      doc.rect(pad, y - 5, W - pad * 2, 8, 'F');
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(110, 110, 110);
    doc.text(label, pad + 2, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(value, W - pad - 2, y, { align: 'right' });
    y += 8;
  };

  // ── Driver Info ───────────────────────────────────────────────────────────
  section('Driver Information');
  row('Driver Name', statement.driverName, true);
  y += 3;

  // ── Payment Details ───────────────────────────────────────────────────────
  section('Payment Details');
  if (statement.paymentType === 'miles') {
    row('Payment Type', `Per ${dist}`, true);
    row(`${dist.charAt(0).toUpperCase() + dist.slice(1)} Driven`, `${statement.miles} ${dist}`);
    row(`Rate per ${dist}`, `${sym}${statement.ratePerMile}`, true);
  } else {
    row('Payment Type', 'Percentage', true);
    row('Percentage', `${statement.percent}%`);
    row('Gross Amount', fmtMoney(statement.grossAmount, currency), true);
  }
  row('Subtotal', fmtMoney(statement.subtotal, currency));
  y += 3;

  // ── Adjustments ───────────────────────────────────────────────────────────
  if (parseFloat(statement.adjustmentAmount || '0') > 0) {
    section('Adjustments');
    row('Type', statement.adjustmentType === 'bonus' ? 'Bonus' : 'Deduction', true);
    row('Amount', `${statement.adjustmentType === 'bonus' ? '+' : '-'}${fmtMoney(statement.adjustmentAmount, currency)}`);
    if (statement.adjustmentReason)
      row('Reason', statement.adjustmentReason, true);
    y += 3;
  }

  // ── Total Box ─────────────────────────────────────────────────────────────
  doc.setFillColor(...accent);
  doc.roundedRect(pad, y, W - pad * 2, 24, 4, 4, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Total Payment', W / 2, y + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(fmtMoney(statement.total, currency), W / 2, y + 18, { align: 'center' });
  y += 32;

  // ── Footer ────────────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(pad, y, W - pad, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 160, 160);
  doc.text(`${companyName} — Generated on ${date}`, W / 2, y, { align: 'center' });

  // ── Download ──────────────────────────────────────────────────────────────
  doc.save(`Statement-${statement.driverName.replace(/\s+/g, '-')}-${date}.pdf`);
}
