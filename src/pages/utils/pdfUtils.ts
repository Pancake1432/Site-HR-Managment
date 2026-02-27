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
  dateFormat: DateFmt
) {
  const sym  = CURRENCY_SYMBOLS[currency];
  const dist = distanceUnit;
  const date = fmtDateStr(statement.savedAt, dateFormat);
  const hasAdj = parseFloat(statement.adjustmentAmount || '0') > 0;

  const paymentRows =
    statement.paymentType === 'miles'
      ? `
        <tr><td>Payment Type</td><td>Per ${dist}</td></tr>
        <tr><td>${dist.charAt(0).toUpperCase() + dist.slice(1)} Driven</td><td>${statement.miles} ${dist}</td></tr>
        <tr><td>Rate per ${dist}</td><td>${sym}${statement.ratePerMile}</td></tr>`
      : `
        <tr><td>Payment Type</td><td>Percentage</td></tr>
        <tr><td>Percentage</td><td>${statement.percent}%</td></tr>
        <tr><td>Gross Amount</td><td>${fmtMoney(statement.grossAmount, currency)}</td></tr>`;

  const adjSection = hasAdj
    ? `<div class="section">
        <h3>Adjustments</h3>
        <table>
          <tr><td>Type</td><td>${statement.adjustmentType === 'bonus' ? 'Bonus' : 'Deduction'}</td></tr>
          <tr><td>Amount</td><td>${statement.adjustmentType === 'bonus' ? '+' : '-'}${fmtMoney(statement.adjustmentAmount, currency)}</td></tr>
          ${statement.adjustmentReason ? `<tr><td>Reason</td><td>${statement.adjustmentReason}</td></tr>` : ''}
        </table>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payment Statement — ${statement.driverName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a202c; padding: 40px; }
    .doc { max-width: 680px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 18px; margin-bottom: 28px; }
    .header h1 { font-size: 26px; font-weight: 700; color: #667eea; margin-bottom: 4px; }
    .header p  { font-size: 12px; color: #718096; }
    .section { margin-bottom: 22px; }
    .section h3 { font-size: 14px; font-weight: 700; color: #4a5568; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 7px 10px; font-size: 13px; }
    td:first-child { color: #718096; font-weight: 500; width: 50%; }
    tr:nth-child(even) td { background: #f7fafc; }
    .total-box { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 10px; text-align: center; padding: 22px; margin-top: 8px; }
    .total-box h3 { font-size: 14px; font-weight: 600; opacity: 0.85; margin-bottom: 6px; }
    .total-amount { font-size: 32px; font-weight: 700; }
    .footer { text-align: center; margin-top: 36px; font-size: 11px; color: #a0aec0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="doc">
    <div class="header">
      <h1>Payment Statement</h1>
      <p>Date: ${date} &nbsp;|&nbsp; Statement ID: ${statement.id}</p>
    </div>

    <div class="section">
      <h3>Driver Information</h3>
      <table>
        <tr><td>Driver Name</td><td>${statement.driverName}</td></tr>
      </table>
    </div>

    <div class="section">
      <h3>Payment Details</h3>
      <table>
        ${paymentRows}
        <tr><td>Subtotal</td><td>${fmtMoney(statement.subtotal, currency)}</td></tr>
      </table>
    </div>

    ${adjSection}

    <div class="total-box">
      <h3>Total Payment</h3>
      <div class="total-amount">${fmtMoney(statement.total, currency)}</div>
    </div>

    <div class="footer">Paks Logistic LLC &mdash; Generated on ${date}</div>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
