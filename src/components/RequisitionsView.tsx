import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  AlertCircle, 
  X,
  FileCheck,
  Building2,
  Calendar,
  ExternalLink,
  Download,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { Product, StockRequisition, RequisitionItem, RequisitionPriority } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  openPrintTab, 
  safeBrowserPrint, 
  downloadPrintableHtml, 
  generateRequisitionHtml, 
  copyToClipboard 
} from '../utils/printHelpers';

interface RequisitionsViewProps {
  products: Product[];
  requisitions: StockRequisition[];
  onSaveRequisition: (requisition: StockRequisition) => void;
  onDeleteRequisition: (id: string) => void;
  onShowToast?: (text: string, type?: 'success' | 'info') => void;
}

export const RequisitionsView: React.FC<RequisitionsViewProps> = ({
  products,
  requisitions,
  onSaveRequisition,
  onDeleteRequisition,
  onShowToast,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedReqForPrint, setSelectedReqForPrint] = useState<StockRequisition | null>(null);
  const [isCopiedReq, setIsCopiedReq] = useState(false);

  // Form states
  const [department, setDepartment] = useState('Vendas / Balcão');
  const [requester, setRequester] = useState('');
  const [priority, setPriority] = useState<RequisitionPriority>('ALTA');
  const [justification, setJustification] = useState('');
  const [reqItems, setReqItems] = useState<RequisitionItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQty, setSelectedQty] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate with critical items (< 5)
  const handleAutoPopulateCritical = () => {
    const critical = products.filter(p => p.quantity < (p.minStock || 5) || p.quantity < 5);
    if (critical.length === 0) {
      alert('Não há nenhum produto em nível crítico (< 5 un) no momento.');
      return;
    }

    const itemsToAdd: RequisitionItem[] = critical.map(p => ({
      productId: p.id,
      productName: p.name,
      currentStock: p.quantity,
      requestedQuantity: Math.max(10, (p.minStock || 5) * 2 - p.quantity),
      estimatedUnitCost: p.unitPrice,
    }));

    setReqItems(itemsToAdd);
    setJustification('Reposição emergencial de produtos que atingiram o limite crítico de segurança (< 5 un).');
    setPriority('URGENTE');
  };

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    if (reqItems.some(item => item.productId === prod.id)) {
      setError('Este produto já foi adicionado à requisição.');
      return;
    }

    if (selectedQty <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    setReqItems([
      ...reqItems,
      {
        productId: prod.id,
        productName: prod.name,
        currentStock: prod.quantity,
        requestedQuantity: selectedQty,
        estimatedUnitCost: prod.unitPrice,
      }
    ]);

    setSelectedProductId('');
    setSelectedQty(5);
    setError(null);
  };

  const handleRemoveItem = (prodId: string) => {
    setReqItems(reqItems.filter(item => item.productId !== prodId));
  };

  const handleUpdateItemQty = (prodId: string, qty: number) => {
    if (qty <= 0) return;
    setReqItems(reqItems.map(item => item.productId === prodId ? { ...item, requestedQuantity: qty } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requester.trim()) {
      setError('Informe o nome da pessoa solicitante.');
      return;
    }

    if (reqItems.length === 0) {
      setError('Adicione pelo menos um item à requisição.');
      return;
    }

    const totalEst = reqItems.reduce((acc, item) => acc + (item.requestedQuantity * item.estimatedUnitCost), 0);

    const newRequisition: StockRequisition = {
      id: 'req-' + Date.now(),
      code: `REQ-${new Date().getFullYear()}-${String(requisitions.length + 1).padStart(3, '0')}`,
      department: department.trim(),
      requester: requester.trim(),
      priority,
      status: 'PENDENTE',
      justification: justification.trim() || 'Reposição rotineira de estoque.',
      items: reqItems,
      createdAt: new Date().toISOString(),
      totalEstimated: totalEst,
    };

    onSaveRequisition(newRequisition);
    setIsCreating(false);
    setReqItems([]);
    setRequester('');
    setJustification('');
    setError(null);
    setSelectedReqForPrint(newRequisition);
  };

  const getPriorityBadge = (p: RequisitionPriority) => {
    switch (p) {
      case 'URGENTE':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-extrabold">URGENTE</span>;
      case 'ALTA':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">ALTA</span>;
      case 'MEDIA':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">MÉDIA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium">BAIXA</span>;
    }
  };

  const handlePrintRequisitionNewTab = (req: StockRequisition) => {
    const html = generateRequisitionHtml(req);
    const success = openPrintTab(`Comprovante ${req.code} - Estoque Certo`, html);
    if (success && onShowToast) {
      onShowToast(`Comprovante ${req.code} aberto em nova guia para impressão!`);
    }
  };

  const handlePrintRequisitionBrowser = () => {
    const ok = safeBrowserPrint();
    if (!ok && onShowToast) {
      onShowToast('Aviso: Impressão direta bloqueada pelo navegador iframe. Use "Abrir em Nova Guia".', 'info');
    }
  };

  const handleDownloadRequisitionHtml = (req: StockRequisition) => {
    const html = generateRequisitionHtml(req);
    downloadPrintableHtml(
      `comprovante_${req.code.toLowerCase()}_${new Date().toISOString().split('T')[0]}.html`,
      `Comprovante de Requisição ${req.code} - Estoque Certo`,
      html
    );
    if (onShowToast) {
      onShowToast(`Comprovante ${req.code} baixado como HTML!`);
    }
  };

  const handleCopyRequisitionText = async (req: StockRequisition) => {
    const text = `ESTOQUE CERTO - REQUISIÇÃO INTERNA DE MATERIAIS
Código: ${req.code}
Data: ${formatDate(req.createdAt)}
Setor: ${req.department}
Solicitante: ${req.requester}
Prioridade: ${req.priority}
Justificativa: ${req.justification}
Status: ${req.status}

ITENS REQUISITADOS:
${req.items.map(it => `- ${it.productName}: ${it.requestedQuantity} un (Custo Unit.: ${formatCurrency(it.estimatedUnitCost)} | Subtotal: ${formatCurrency(it.requestedQuantity * it.estimatedUnitCost)})`).join('\n')}

TOTAL ESTIMADO: ${formatCurrency(req.totalEstimated)}`;

    await copyToClipboard(text);
    setIsCopiedReq(true);
    if (onShowToast) {
      onShowToast('Dados da requisição copiados para a área de transferência!');
    }
    setTimeout(() => setIsCopiedReq(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            <span>Requisições Internas de Reposição</span>
          </h2>
          <p className="text-xs text-slate-500">
            Gere pedidos formais de compra e reposição para setores e gerência.
          </p>
        </div>

        {!isCreating && (
          <button
            id="btn-nova-requisicao"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Requisição Interna</span>
          </button>
        )}
      </div>

      {/* Requisition creation form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 ring-2 ring-emerald-500/10 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Criar Nova Requisição Interna</h3>
              <p className="text-xs text-slate-500">Preencha os dados e adicione os itens a serem adquiridos ou repostos</p>
            </div>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Setor Solicitante <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Ex: Loja Principal, Cozinha, Atendimento"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Solicitante <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder="Ex: Maria Santos (Supervisora)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prioridade do Pedido
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequisitionPriority)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="BAIXA">Baixa (Reposição planejada)</option>
                  <option value="MEDIA">Média (Rotina de reposição)</option>
                  <option value="ALTA">Alta (Estoque diminuindo)</option>
                  <option value="URGENTE">Urgente (Estoque Crítico / Em Falta)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Justificativa / Motivo da Solicitação
              </label>
              <input
                type="text"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Ex: Reposição para alta demanda do fim de semana."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Smart Auto-fill button */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs text-amber-900 font-medium">
                  Deseja acelerar o preenchimento com os itens que estão em falta?
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoPopulateCritical}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
              >
                Puxar Itens Críticos (&lt; 5 un)
              </button>
            </div>

            {/* Item selector bar */}
            <div className="border border-slate-200 p-3 rounded-xl bg-slate-50/50 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Adicionar Produtos à Requisição:</span>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="flex-1 w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Selecione um produto do estoque...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Atual: {p.quantity} un) - {formatCurrency(p.unitPrice)}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qtd."
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                  >
                    + Adicionar Item
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Added items list */}
            {reqItems.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Produto</th>
                      <th className="py-2.5 px-3 text-center">Estoque Atual</th>
                      <th className="py-2.5 px-3 text-center">Qtd. Solicitada</th>
                      <th className="py-2.5 px-3 text-right">Custo Est. Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal Est.</th>
                      <th className="py-2.5 px-3 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reqItems.map(item => (
                      <tr key={item.productId}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.productName}</td>
                        <td className="py-2 px-3 text-center text-slate-500">{item.currentStock} un</td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.requestedQuantity}
                            onChange={(e) => handleUpdateItemQty(item.productId, Number(e.target.value))}
                            className="w-16 px-2 py-1 text-center font-bold text-xs border border-slate-200 rounded-lg"
                          />
                        </td>
                        <td className="py-2 px-3 text-right text-slate-600">{formatCurrency(item.estimatedUnitCost)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">
                          {formatCurrency(item.requestedQuantity * item.estimatedUnitCost)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <td colSpan={4} className="py-2.5 px-3 text-right">Total Estimado do Pedido:</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-extrabold text-sm">
                        {formatCurrency(reqItems.reduce((acc, i) => acc + (i.requestedQuantity * i.estimatedUnitCost), 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar & Emitir Requisição</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Saved Requisitions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Requisições Emitidas</h3>
          <span className="text-xs text-slate-500 font-medium">
            {requisitions.length} requisição(ões) registrada(s)
          </span>
        </div>

        {requisitions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma requisição interna emitida até o momento. Clique em "Nova Requisição Interna" para iniciar.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requisitions.map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {req.code}
                    </span>
                    {getPriorityBadge(req.priority)}
                    <span className="text-xs text-slate-500">• {formatDate(req.createdAt)}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    {req.department} — <span className="font-normal text-slate-600">{req.requester}</span>
                  </h4>
                  <p className="text-xs text-slate-500 italic">
                    "{req.justification}"
                  </p>
                  <div className="text-xs text-slate-600 font-medium pt-0.5">
                    Itens: {req.items.map(i => `${i.productName} (${i.requestedQuantity} un)`).join(', ')}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Previsto:</span>
                    <strong className="text-sm font-extrabold text-slate-900">
                      {formatCurrency(req.totalEstimated)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-ver-imprimir-${req.id}`}
                      onClick={() => setSelectedReqForPrint(req)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Visualizar / Imprimir</span>
                    </button>

                    <button
                      id={`btn-imprimir-rapido-${req.id}`}
                      onClick={() => handlePrintRequisitionNewTab(req)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                      title="Imprimir Comprovante Direto em Nova Guia"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRequisition(req.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir requisição"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print modal for individual requisition */}
      {selectedReqForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50 gap-2 print:hidden">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Espelho da Requisição {selectedReqForPrint.code}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-baixar-html-comprovante"
                  onClick={() => handleDownloadRequisitionHtml(selectedReqForPrint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  title="Baixar comprovante como arquivo HTML"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Baixar HTML</span>
                </button>

                <button
                  id="btn-copiar-dados-comprovante"
                  onClick={() => handleCopyRequisitionText(selectedReqForPrint)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  title="Copiar texto da requisição"
                >
                  {isCopiedReq ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{isCopiedReq ? 'Copiado!' : 'Copiar'}</span>
                </button>

                <button
                  id="btn-imprimir-comprovante"
                  onClick={() => handlePrintRequisitionNewTab(selectedReqForPrint)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-all active:scale-98"
                  title="Abrir página otimizada para impressão física ou PDF"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Comprovante</span>
                </button>

                <button
                  onClick={() => setSelectedReqForPrint(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sandbox Notice Banner inside Modal */}
            <div className="px-6 py-2 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900 print:hidden">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Clique em <strong>"Imprimir Comprovante"</strong> para abrir em nova guia limpa e acionar a impressora/PDF sem bloqueios de iframe.</span>
              </span>
              <button
                onClick={handlePrintRequisitionBrowser}
                className="text-amber-800 underline hover:text-amber-950 ml-2 whitespace-nowrap"
                title="Tentar acionar janela nesta aba"
              >
                Tentar nesta aba
              </button>
            </div>

            {/* Timbrada Paper Document */}
            <div className="p-8 space-y-6 print:p-0">
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-900">ESTOQUE CERTO</h2>
                  <p className="text-xs text-slate-500 uppercase font-semibold">Formulário de Requisição Interna de Materiais</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-slate-900">{selectedReqForPrint.code}</div>
                  <div className="text-xs text-slate-500">{formatDate(selectedReqForPrint.createdAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Setor Solicitante:</span>
                  <strong className="text-slate-900">{selectedReqForPrint.department}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Solicitante Responsável:</span>
                  <strong className="text-slate-900">{selectedReqForPrint.requester}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Prioridade:</span>
                  <strong className="text-slate-900">{selectedReqForPrint.priority}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Justificativa:</span>
                  <span className="text-slate-700">{selectedReqForPrint.justification}</span>
                </div>
              </div>

              {/* Items table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                      <th className="py-2.5 px-3">Item Solicitado</th>
                      <th className="py-2.5 px-3 text-center">Estoque Atual</th>
                      <th className="py-2.5 px-3 text-center">Qtd. Solicitada</th>
                      <th className="py-2.5 px-3 text-right">Custo Estimado</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedReqForPrint.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{item.productName}</td>
                        <td className="py-2.5 px-3 text-center text-slate-500">{item.currentStock} un</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.requestedQuantity} un</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{formatCurrency(item.estimatedUnitCost)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurrency(item.requestedQuantity * item.estimatedUnitCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-300">
                      <td colSpan={4} className="py-3 px-3 text-right uppercase text-xs">Total Estimado:</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-extrabold text-sm">
                        {formatCurrency(selectedReqForPrint.totalEstimated)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="border-t border-slate-400 w-44 mx-auto mb-1"></div>
                  <span className="text-slate-600">Assinatura do Solicitante</span>
                </div>
                <div>
                  <div className="border-t border-slate-400 w-44 mx-auto mb-1"></div>
                  <span className="text-slate-600">Aprovação da Gerência</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
