/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, StockRequisition } from '../types';
import { formatCurrency, formatDate } from './formatters';

/**
 * Bulletproof clipboard copy with fallback for iframe sandboxes
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern navigator.clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText failed in iframe, falling back:', err);
    }
  }

  // 2. Fallback using temporary textarea and document.execCommand('copy')
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (fallbackErr) {
    console.error('Fallback execCommand failed:', fallbackErr);
    return false;
  }
}

/**
 * Executes window.print() safely inside try-catch to prevent iframe DOMExceptions
 */
export function safeBrowserPrint(): boolean {
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('window.print() prevented by sandbox or iframe permissions:', err);
    return false;
  }
}

/**
 * Generates formatted HTML for Stock Position Report
 */
export function generateReportHtml(
  products: Product[],
  totalValue: number,
  totalUnits: number,
  criticalCount: number
): string {
  const nowStr = new Date().toLocaleString('pt-BR');

  const rows = products.map((p, idx) => {
    const isCritical = p.quantity < (p.minStock || 5);
    const itemTotal = p.quantity * p.unitPrice;
    return `
      <tr style="${isCritical ? 'background-color: #fff1f2;' : idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
        <td style="font-family: monospace; font-size: 11px;">${p.sku || '-'}</td>
        <td style="font-weight: 600;">${p.name}</td>
        <td>${p.category}</td>
        <td style="text-align: center; font-weight: bold; ${isCritical ? 'color: #be123c;' : ''}">
          ${p.quantity} un ${isCritical ? '<span style="font-size: 10px; color: #be123c; font-weight: bold;">(CRÍTICO)</span>' : ''}
        </td>
        <td style="text-align: center;">${p.minStock || 5} un</td>
        <td style="text-align: right;">${formatCurrency(p.unitPrice)}</td>
        <td style="text-align: right; font-weight: bold;">${formatCurrency(itemTotal)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="header">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; margin: 0;">ESTOQUE CERTO</h1>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0; text-transform: uppercase; font-weight: 600;">
          Relatório de Posição Físico-Financeira de Estoque
        </p>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 12px; color: #334155; font-weight: 600;">Emissão: ${nowStr}</div>
        <div style="font-size: 11px; color: #64748b;">Sistema de Gestão de Estoque</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div>
        <span style="font-size: 11px; color: #64748b; display: block;">Valor Total em Estoque</span>
        <strong style="font-size: 16px; color: #047857; font-weight: 800;">${formatCurrency(totalValue)}</strong>
      </div>
      <div>
        <span style="font-size: 11px; color: #64748b; display: block;">Unidades Físicas em Estoque</span>
        <strong style="font-size: 16px; color: #0f172a; font-weight: 800;">${totalUnits} unidades</strong>
      </div>
      <div>
        <span style="font-size: 11px; color: #64748b; display: block;">Produtos em Situação Crítica</span>
        <strong style="font-size: 16px; color: ${criticalCount > 0 ? '#be123c' : '#047857'}; font-weight: 800;">
          ${criticalCount} produto(s)
        </strong>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 10%;">SKU</th>
          <th style="width: 32%;">Produto</th>
          <th style="width: 18%;">Categoria</th>
          <th style="width: 12%; text-align: center;">Saldo</th>
          <th style="width: 10%; text-align: center;">Mínimo</th>
          <th style="width: 10%; text-align: right;">Unitário</th>
          <th style="width: 12%; text-align: right;">Total (R$)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="signatures" style="margin-top: 40px; display: flex; justify-content: space-between;">
      <div class="sign-line" style="width: 45%; border-top: 1px solid #0f172a; text-align: center; padding-top: 6px; font-size: 11px; color: #334155;">
        Responsável pelo Inventário / Estoquista
      </div>
      <div class="sign-line" style="width: 45%; border-top: 1px solid #0f172a; text-align: center; padding-top: 6px; font-size: 11px; color: #334155;">
        Gerência / Visto Administrativo
      </div>
    </div>
  `;
}

/**
 * Generates formatted HTML for Requisition Slip
 */
export function generateRequisitionHtml(req: StockRequisition): string {
  const rows = req.items.map((item, idx) => {
    return `
      <tr style="${idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
        <td style="font-weight: 600;">${item.productName}</td>
        <td style="text-align: center; color: #64748b;">${item.currentStock} un</td>
        <td style="text-align: center; font-weight: bold; color: #047857;">${item.requestedQuantity} un</td>
        <td style="text-align: right;">${formatCurrency(item.estimatedUnitCost)}</td>
        <td style="text-align: right; font-weight: bold;">${formatCurrency(item.requestedQuantity * item.estimatedUnitCost)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="header">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; margin: 0;">ESTOQUE CERTO</h1>
        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0; text-transform: uppercase; font-weight: 600;">
          Comprovante de Requisição Interna de Materiais
        </p>
      </div>
      <div style="text-align: right;">
        <div style="font-family: monospace; font-size: 14px; font-weight: bold; color: #047857;">${req.code}</div>
        <div style="font-size: 11px; color: #64748b;">Emissão: ${formatDate(req.createdAt)}</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px;">
      <div>
        <span style="color: #64748b;">Setor Solicitante:</span>
        <strong style="color: #0f172a; display: block;">${req.department}</strong>
      </div>
      <div>
        <span style="color: #64748b;">Solicitante Responsável:</span>
        <strong style="color: #0f172a; display: block;">${req.requester}</strong>
      </div>
      <div>
        <span style="color: #64748b;">Prioridade da Solicitação:</span>
        <strong style="color: #0f172a; display: block;">${req.priority}</strong>
      </div>
      <div>
        <span style="color: #64748b;">Justificativa:</span>
        <span style="color: #334155; display: block;">${req.justification || 'Reposição rotineira de estoque'}</span>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40%;">Item Solicitado</th>
          <th style="width: 15%; text-align: center;">Estoque Atual</th>
          <th style="width: 15%; text-align: center;">Qtd Solicitada</th>
          <th style="width: 15%; text-align: right;">Custo Est.</th>
          <th style="width: 15%; text-align: right;">Subtotal (R$)</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background: #f1f5f9; font-weight: bold;">
          <td colspan="4" style="text-align: right; padding: 10px;">Total Estimado da Requisição:</td>
          <td style="text-align: right; color: #047857; font-size: 13px;">${formatCurrency(req.totalEstimated)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="signatures" style="margin-top: 48px; display: flex; justify-content: space-between;">
      <div class="sign-line" style="width: 45%; border-top: 1px solid #0f172a; text-align: center; padding-top: 6px; font-size: 11px; color: #334155;">
        Assinatura do Solicitante (${req.requester})
      </div>
      <div class="sign-line" style="width: 45%; border-top: 1px solid #0f172a; text-align: center; padding-top: 6px; font-size: 11px; color: #334155;">
        Visto e Liberação do Almoxarifado / Estoque
      </div>
    </div>
  `;
}

/**
 * Opens a clean printable document in a new tab with automatic print trigger.
 * This guarantees printing works even when the app is inside a sandboxed iframe.
 */
export function openPrintTab(title: string, bodyHtml: string): boolean {
  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 32px auto;
      max-width: 900px;
      color: #0f172a;
      line-height: 1.5;
    }
    h1, h2, h3 { margin: 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      margin-bottom: 14px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 12px;
      text-align: left;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #1e293b;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .top-actions {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: white;
      padding: 12px 20px;
      margin: -32px auto 24px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .btn-print {
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover { background: #059669; }
    @media print {
      .top-actions { display: none !important; }
      body { margin: 12px; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="top-actions">
    <div style="font-size: 13px; font-weight: bold;">
      📄 ${title}
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-print" onclick="window.print()">
        🖨️ Imprimir Agora / Salvar PDF
      </button>
    </div>
  </div>

  ${bodyHtml}

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.warn('Auto-print prevented:', e);
        }
      }, 500);
    });
  </script>
</body>
</html>`;

  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return true;
  } catch (err) {
    console.error('Failed to open print tab:', err);
    return false;
  }
}

/**
 * Downloads a standalone printable HTML file
 */
export function downloadPrintableHtml(filename: string, title: string, bodyHtml: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 24px; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 12px; text-align: left; }
    th { background-color: #f1f5f9; font-weight: bold; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body onload="window.print()">
  ${bodyHtml}
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
