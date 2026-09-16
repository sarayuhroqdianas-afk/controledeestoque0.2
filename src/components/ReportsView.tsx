import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  PieChart,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { Product } from '../types';
import { formatCurrency, formatDate, getStockStatus } from '../utils/formatters';
import { 
  openPrintTab, 
  safeBrowserPrint, 
  downloadPrintableHtml, 
  generateReportHtml, 
  copyToClipboard 
} from '../utils/printHelpers';

interface ReportsViewProps {
  products: Product[];
  onShowToast?: (text: string, type?: 'success' | 'info') => void;
}

interface CategoryStat {
  count: number;
  units: number;
  value: number;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ products, onShowToast }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCopiedSummary, setIsCopiedSummary] = useState(false);

  const totalProducts = products.length;
  const totalUnits = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  
  const criticalProducts = products.filter(p => p.quantity < (p.minStock || 5) || p.quantity < 5);
  const zeroStockProducts = products.filter(p => p.quantity === 0);

  // Group by category
  const categoryStats: Record<string, CategoryStat> = products.reduce((acc, p) => {
    if (!acc[p.category]) {
      acc[p.category] = { count: 0, units: 0, value: 0 };
    }
    acc[p.category].count += 1;
    acc[p.category].units += p.quantity;
    acc[p.category].value += p.quantity * p.unitPrice;
    return acc;
  }, {} as Record<string, CategoryStat>);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const handlePrintNewTab = () => {
    const html = generateReportHtml(products, totalValue, totalUnits, criticalProducts.length);
    const success = openPrintTab('Relatório de Posição de Estoque - Estoque Certo', html);
    if (success && onShowToast) {
      onShowToast('Janela de impressão aberta em nova guia!');
    }
  };

  const handleBrowserPrint = () => {
    const ok = safeBrowserPrint();
    if (!ok && onShowToast) {
      onShowToast('Aviso: Impressão direta bloqueada pelo navegador iframe. Use "Abrir em Nova Guia".', 'info');
    }
  };

  const handleDownloadHtml = () => {
    const html = generateReportHtml(products, totalValue, totalUnits, criticalProducts.length);
    downloadPrintableHtml(
      `relatorio_posicao_estoque_${new Date().toISOString().split('T')[0]}.html`,
      'Relatório de Posição de Estoque - Estoque Certo',
      html
    );
    if (onShowToast) {
      onShowToast('Arquivo de relatório pronto para impressão baixado!');
    }
  };

  const handleCopySummary = async () => {
    const text = `ESTOQUE CERTO - RELATÓRIO DE POSIÇÃO DE ESTOQUE
Data de Emissão: ${new Date().toLocaleString('pt-BR')}
Patrimônio em Estoque: ${formatCurrency(totalValue)}
Total de Itens: ${totalProducts} produtos (${totalUnits} unidades físicas)
Itens em Estoque Crítico (< 5 un): ${criticalProducts.length} itens

RESUMO POR CATEGORIA:
${(Object.entries(categoryStats) as [string, CategoryStat][]).map(([cat, stat]) => `- ${cat}: ${stat.count} produtos, ${stat.units} un, ${formatCurrency(stat.value)}`).join('\n')}

ITENS CRÍTICOS:
${criticalProducts.length === 0 ? 'Nenhum item com estoque crítico.' : criticalProducts.map(p => `- ${p.name}: ${p.quantity} un (Mín: ${p.minStock || 5})`).join('\n')}`;

    await copyToClipboard(text);
    setIsCopiedSummary(true);
    if (onShowToast) {
      onShowToast('Resumo textual copiado para a área de transferência!');
    }
    setTimeout(() => setIsCopiedSummary(false), 2500);
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    const headers = ['SKU', 'Produto', 'Categoria', 'Quantidade em Estoque', 'Estoque Minimo', 'Preco Unitario (R$)', 'Valor Total (R$)', 'Status'];
    const rows = products.map(p => {
      const status = getStockStatus(p.quantity, p.minStock);
      return [
        p.sku || '',
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        p.quantity,
        p.minStock || 5,
        p.unitPrice.toFixed(2),
        (p.quantity * p.unitPrice).toFixed(2),
        status.label
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_posicao_estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Relatório de Posição de Estoque</span>
          </h2>
          <p className="text-xs text-slate-500">
            Visão consolidada do patrimônio em mercadorias e diagnóstico de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-exportar-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            id="btn-imprimir-relatorio"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Printable Paper Canvas */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Estoque Certo</h1>
            <p className="text-xs text-slate-500">Relatório Executivo de Inventário & Posição Físico-Financeira</p>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500">
            <div>Data de Emissão: <strong className="text-slate-800">{formatDate(new Date().toISOString())}</strong></div>
            <div>Responsável: <span className="text-slate-800 font-medium">Administrador / Gerência</span></div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Patrimônio em Estoque</span>
            <div className="text-lg font-extrabold text-emerald-700">
              {formatCurrency(totalValue)}
            </div>
            <span className="text-[11px] text-slate-400">Total valorado</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Produtos Cadastrados</span>
            <div className="text-lg font-extrabold text-slate-900">
              {totalProducts} itens
            </div>
            <span className="text-[11px] text-slate-400">{Object.keys(categoryStats).length} categorias ativas</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-1">Unidades Físicas</span>
            <div className="text-lg font-extrabold text-slate-900">
              {totalUnits} un
            </div>
            <span className="text-[11px] text-slate-400">Em prateleira</span>
          </div>

          <div className={`p-4 rounded-xl border ${criticalProducts.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs block mb-1 ${criticalProducts.length > 0 ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
              Estoque Crítico (&lt; 5)
            </span>
            <div className={`text-lg font-extrabold ${criticalProducts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {criticalProducts.length} itens
            </div>
            <span className={`text-[11px] ${criticalProducts.length > 0 ? 'text-rose-600 font-medium' : 'text-slate-400'}`}>
              {criticalProducts.length > 0 ? 'Requer reposição urgente!' : 'Todos acima do limite'}
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Distribuição de Capital por Categoria</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.entries(categoryStats) as [string, CategoryStat][]).map(([category, stat]) => {
              const percent = totalValue > 0 ? Math.round((stat.value / totalValue) * 100) : 0;
              return (
                <div key={category} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <strong className="text-slate-800">{category}</strong>
                    <span className="font-bold text-slate-600">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{stat.count} produto(s) • {stat.units} un</span>
                    <span className="font-bold text-slate-900">{formatCurrency(stat.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed inventory position table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Detalhamento dos Itens do Inventário</span>
          </h3>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">Item / Descrição</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3 text-center">Qtd. Atual</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Preço Unit.</th>
                  <th className="py-2.5 px-3 text-right">Total (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const status = getStockStatus(p.quantity, p.minStock);
                  const isCrit = status.isCritical;
                  return (
                    <tr key={p.id} className={isCrit ? 'bg-rose-50/40' : ''}>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {p.name}
                        {p.sku && <span className="text-[10px] text-slate-400 font-mono ml-1.5">({p.sku})</span>}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2 px-3 text-center font-bold">
                        <span className={status.textClass}>{p.quantity} un</span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">{formatCurrency(p.unitPrice)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(p.quantity * p.unitPrice)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-3 px-3" colSpan={2}>TOTAIS GERAIS</td>
                  <td className="py-3 px-3 text-center text-sm">{totalUnits} un</td>
                  <td className="py-3 px-3 text-center text-rose-700">{criticalProducts.length} críticos</td>
                  <td className="py-3 px-3 text-right">-</td>
                  <td className="py-3 px-3 text-right text-emerald-700 text-sm">{formatCurrency(totalValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Signature Box for Print */}
        <div className="hidden print:grid grid-cols-2 gap-12 pt-12 border-t border-slate-200">
          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
            <span className="text-xs text-slate-600">Assinatura do Encarregado de Estoque</span>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-400 w-48 mx-auto mb-1"></div>
            <span className="text-xs text-slate-600">Assinatura da Gerência / Compras</span>
          </div>
        </div>
      </div>

      {/* Print & Export Options Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Imprimir Relatório de Estoque</h3>
                  <p className="text-[11px] text-slate-400">Escolha o formato ou método de impressão preferido</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Sandbox notice */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Modo de Pré-Visualização (Iframe)</strong>
                  <span>
                    Navegadores bloqueiam janelas de impressão nativas dentro de iframes. O botão <strong>"Abrir e Imprimir em Nova Guia"</strong> abre uma página limpa e ativa o diálogo nativo para <strong>imprimir na impressora física ou salvar em PDF</strong> sem bloqueios!
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  id="btn-imprimir-nova-guia"
                  onClick={handlePrintNewTab}
                  className="w-full flex items-center justify-between p-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>Abrir e Imprimir em Nova Guia (PDF / Papel)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-400/30 text-[10px] font-extrabold uppercase">
                          Recomendado
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100">
                        Abre o relatório formatado e aciona a impressora e o "Salvar como PDF"
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    id="btn-baixar-html-relatorio"
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-2.5 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-left transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Baixar Arquivo (.html)</div>
                      <div className="text-[10px] text-slate-500">Para arquivar ou abrir no Chrome</div>
                    </div>
                  </button>

                  <button
                    id="btn-copiar-resumo-relatorio"
                    onClick={handleCopySummary}
                    className="flex items-center gap-2.5 p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-left transition-colors"
                  >
                    {isCopiedSummary ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-bold">
                        {isCopiedSummary ? 'Resumo Copiado!' : 'Copiar Resumo em Texto'}
                      </div>
                      <div className="text-[10px] text-slate-500">Para colar no WhatsApp ou e-mail</div>
                    </div>
                  </button>
                </div>

                <button
                  id="btn-imprimir-nesta-aba"
                  onClick={handleBrowserPrint}
                  className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
                >
                  Tentar acionar janela de impressão na mesma aba (pode ser bloqueado pelo iframe)
                </button>
              </div>

              {/* Mini Preview Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                <span>Resumo: <strong>{totalProducts} produtos</strong> ({totalUnits} un)</span>
                <span className="font-bold text-emerald-700">Patrimônio: {formatCurrency(totalValue)}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
