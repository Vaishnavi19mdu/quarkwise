import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress, Typography } from '@mui/material';
import { Download, FileText, Table, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEnergy } from '../../context/EnergyContext';
import { ENERGY_DATA } from '../../lib/dataset';

// ─── Helper: build the A4 HTML report string ───────────────────────────────
function buildReportHTML(data: any, simulation: any) {
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const {
    predictedScore,
    efficiency,
    predictedUsage,
    baseUsage,
    usageChangePct,
    savings,
    predictedBill,
    scoreDelta,
  } = simulation;

  const savingsSign = savings >= 0 ? '−' : '+';
  const savingsLabel = savings >= 0 ? 'Monthly Savings' : 'Extra Cost';

  // Monthly usage rows (last 6 months)
  const monthlyRows = (ENERGY_DATA.monthlyUsage as any[])
    .slice(-6)
    .map(
      (m: any) =>
        `<tr>
          <td>${m.name}</td>
          <td>${m.usage} kWh</td>
          <td>${m.cost ? '₹' + m.cost : '—'}</td>
        </tr>`
    )
    .join('');

  // Appliance data as text rows instead of donut
  const applianceRows = (ENERGY_DATA.breakdown as any[])
    .map(
      (a: any) =>
        `<tr>
          <td>${a.name}</td>
          <td>${a.value} kWh</td>
          <td>${Math.round((a.value / predictedUsage) * 100)}%</td>
        </tr>`
    )
    .join('');

  // Seasonal tips
  const seasonalTips = [
    'Higher AC runtimes expected between 2 PM – 6 PM',
    'Monsoon humidity may increase dryer usage',
    'Projected cost increase: ₹850 vs last season',
    'Tip: Service your AC now to improve efficiency by ~15%',
  ]
    .map(t => `<li>${t}</li>`)
    .join('');

  // Simulator highlights
  const simRows = [
    ['Base Usage', `${baseUsage} kWh`],
    ['Predicted Usage', `${predictedUsage} kWh (${usageChangePct > 0 ? '+' : ''}${usageChangePct}%)`],
    ['Energy Score', `${predictedScore} / 100 (${efficiency})`],
    [savingsLabel, `₹${Math.abs(savings)}`],
    ['Predicted Bill', `₹${predictedBill}`],
  ]
    .map(([k, v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Quarkwise Energy Report – ${date}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 15mm 18mm 15mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    color: #1e293b;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Header ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-bottom: 10px;
    border-bottom: 2px solid #2F6F73;
    margin-bottom: 18px;
  }
  .header-left h1 { font-size: 20pt; color: #2F6F73; font-weight: 800; letter-spacing: -0.5px; }
  .header-left p  { font-size: 9pt; color: #64748b; margin-top: 2px; }
  .header-right   { text-align: right; font-size: 9pt; color: #64748b; }

  /* ── Section titles ── */
  h2 {
    font-size: 11pt;
    font-weight: 700;
    color: #2F6F73;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
  }

  /* ── Stat cards row ── */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .stat-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    background: #f8fafc;
  }
  .stat-card .label { font-size: 8pt; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-card .value { font-size: 18pt; font-weight: 800; color: #1e293b; margin: 4px 0 2px; }
  .stat-card .sub   { font-size: 8.5pt; color: #64748b; }
  .stat-card .delta { font-size: 8pt; font-weight: 700; margin-top: 2px; }
  .green { color: #16a34a; }
  .red   { color: #dc2626; }
  .teal  { color: #2F6F73; }

  /* ── Tables ── */
  section { margin-bottom: 18px; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
  }
  thead tr { background: #f1f5f9; }
  th {
    text-align: left;
    font-size: 8.5pt;
    font-weight: 700;
    color: #475569;
    padding: 6px 10px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:last-child td { border-bottom: none; }

  /* ── Two-column layout ── */
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 18px;
  }

  /* ── Forecast tips ── */
  .tips-list { padding-left: 16px; }
  .tips-list li { margin-bottom: 5px; font-size: 10pt; color: #334155; line-height: 1.5; }

  /* ── Footer ── */
  .footer {
    margin-top: 22px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #94a3b8;
  }

  /* ── Page break hint ── */
  .page-break { page-break-before: always; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="header-left">
    <h1>Quarkwise</h1>
    <p>Monthly Energy Report</p>
  </div>
  <div class="header-right">
    <div>Generated: ${date}</div>
    <div>Account: Household</div>
  </div>
</div>

<!-- TOP STATS -->
<div class="stats-row">
  <div class="stat-card">
    <div class="label">Energy Score</div>
    <div class="value teal">${predictedScore}<span style="font-size:11pt;font-weight:400;color:#94a3b8"> / 100</span></div>
    <div class="sub">${efficiency}</div>
    <div class="delta ${scoreDelta >= 0 ? 'green' : 'red'}">${scoreDelta >= 0 ? '▲' : '▼'} ${Math.abs(scoreDelta)} pts vs baseline</div>
  </div>
  <div class="stat-card">
    <div class="label">Predicted Usage</div>
    <div class="value">${predictedUsage}<span style="font-size:11pt;font-weight:400;color:#94a3b8"> kWh</span></div>
    <div class="sub">Baseline: ${baseUsage} kWh</div>
    <div class="delta ${usageChangePct <= 0 ? 'green' : 'red'}">${usageChangePct > 0 ? '▲ +' : '▼ '}${usageChangePct}% change</div>
  </div>
  <div class="stat-card">
    <div class="label">${savingsLabel}</div>
    <div class="value ${savings >= 0 ? 'green' : 'red'}">₹${Math.abs(savings)}</div>
    <div class="sub">${savings >= 0 ? 'Bill drops to' : 'Bill rises to'} ₹${predictedBill}</div>
    <div class="delta" style="color:#94a3b8">This month's projection</div>
  </div>
</div>

<!-- TWO COLUMN: Monthly Usage + Appliance Breakdown -->
<div class="two-col">
  <section>
    <h2>Monthly Usage (Last 6 Months)</h2>
    <table>
      <thead>
        <tr><th>Month</th><th>Usage (kWh)</th><th>Cost</th></tr>
      </thead>
      <tbody>${monthlyRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Appliance Breakdown</h2>
    <table>
      <thead>
        <tr><th>Appliance</th><th>Usage (kWh)</th><th>Share</th></tr>
      </thead>
      <tbody>${applianceRows}</tbody>
    </table>
  </section>
</div>

<!-- TWO COLUMN: Simulator + Seasonal -->
<div class="two-col">
  <section>
    <h2>Simulator Results</h2>
    <table>
      <tbody>${simRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Seasonal Forecast</h2>
    <ul class="tips-list">${seasonalTips}</ul>
  </section>
</div>

<!-- FOOTER -->
<div class="footer">
  <span>Quarkwise Energy Intelligence · quarkwise.app</span>
  <span>This report is auto-generated. Data is indicative.</span>
</div>

</body>
</html>`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export const ExportButton = ({ simulation }: { simulation?: any }) => {
  const { data } = useEnergy();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null);
  const [done, setDone] = useState(false);

  const open = Boolean(anchorEl);

  const triggerSuccess = () => {
    setDone(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2F6F73', '#B3E0DC', '#22C55E'],
    });
    setTimeout(() => setDone(false), 3000);
  };

  // ── CSV (unchanged) ──
  const handleExportCSV = () => {
    setAnchorEl(null);
    setExporting('csv');
    setTimeout(() => {
      const headers = ['Month', 'Usage (kWh)'];
      const rows = (ENERGY_DATA.monthlyUsage as any[]).map((m: any) => [m.name, m.usage]);
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        headers.join(',') +
        '\n' +
        rows.map((e: any[]) => e.join(',')).join('\n');

      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `quarkwise_usage_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(null);
      triggerSuccess();
    }, 600);
  };

  // ── PDF: open a print window with the clean A4 template ──
  const handleExportPDF = () => {
  setAnchorEl(null);
  setExporting('pdf');

  const sim = simulation ?? {
    predictedScore: 72,
    efficiency: 'Moderate',
    predictedUsage: data.usage ?? 318,
    baseUsage: data.usage ?? 318,
    usageChangePct: 0,
    savings: 0,
    predictedBill: data.bill ?? 2800,
    scoreDelta: 0,
  };

  const html = buildReportHTML(data, sim);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `quarkwise_report_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setExporting(null);
  triggerSuccess();
};
  return (
    <div>
      <Button
        variant="outlined"
        color={done ? 'success' : 'secondary'}
        startIcon={
          exporting ? (
            <CircularProgress size={16} color="inherit" />
          ) : done ? (
            <Check size={18} />
          ) : (
            <Download size={18} />
          )
        }
        onClick={e => setAnchorEl(e.currentTarget)}
        disabled={!!exporting}
        className="min-w-[140px]"
      >
        {exporting === 'pdf'
          ? 'Preparing…'
          : exporting === 'csv'
          ? 'Exporting…'
          : done
          ? 'Exported!'
          : 'Export Report'}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleExportPDF} className="py-3 px-4 hover:bg-slate-50 min-w-[180px]">
          <ListItemIcon>
            <FileText size={18} className="text-secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography className="font-bold text-slate-700">Download HTML</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportCSV} className="py-3 px-4 hover:bg-slate-50 min-w-[180px]">
          <ListItemIcon>
            <Table size={18} className="text-secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography className="font-bold text-slate-700">Download CSV</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};