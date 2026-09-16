import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { StockMovement, MovementType, MovementReason } from '../types';
import { formatDate } from '../utils/formatters';

interface MovementsViewProps {
  movements: StockMovement[];
  onOpenNewMovement?: () => void;
}

export const MovementsView: React.FC<MovementsViewProps> = ({
  movements,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MovementType>('ALL');
  const [reasonFilter, setReasonFilter] = useState<'ALL' | MovementReason>('ALL');

  const filteredMovements = movements.filter((m) => {
    const matchesSearch = 
      m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
    const matchesReason = reasonFilter === 'ALL' || m.reason === reasonFilter;

    return matchesSearch && matchesType && matchesReason;
  });

  const getReasonBadge = (reason: MovementReason) => {
    switch (reason) {
      case 'COMPRA':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">Compra / Fornecedor</span>;
      case 'VENDA':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">Venda Balcão</span>;
      case 'AVARIA':
        return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">Avaria / Descarte</span>;
      case 'DEVOLUCAO':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">Devolução</span>;
      case 'REQUISICAO':
        return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">Requisição Interna</span>;
      case 'AJUSTE':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">Ajuste de Inventário</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">Outro</span>;
    }
  };

  const handleExportCSV = () => {
    if (movements.length === 0) return;
    const headers = ['Data/Hora', 'Produto', 'Tipo', 'Quantidade', 'Estoque Anterior', 'Novo Estoque', 'Motivo', 'Observações'];
    const rows = filteredMovements.map(m => [
      formatDate(m.createdAt),
      `"${m.productName.replace(/"/g, '""')}"`,
      m.type,
      m.quantity,
      m.previousStock,
      m.newStock,
      m.reason,
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimentacoes_estoque_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Filters header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="input-busca-movimentacoes"
              type="text"
              placeholder="Buscar por produto ou notas da movimentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="filtro-tipo-movimentacao"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | MovementType)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="ENTRADA">Apenas Entradas (+)</option>
              <option value="SAIDA">Apenas Saídas (-)</option>
            </select>

            <button
              onClick={handleExportCSV}
              title="Exportar registros para CSV"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Histórico de Movimentações</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {filteredMovements.length} registro(s) encontrado(s)
          </span>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma movimentação encontrada para os critérios selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Data & Hora</th>
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4 text-center">Operação</th>
                  <th className="py-3 px-4">Motivo</th>
                  <th className="py-3 px-4 text-center">Variação de Saldo</th>
                  <th className="py-3 px-4">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMovements.map((mov) => {
                  const isEntrada = mov.type === 'ENTRADA';

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {formatDate(mov.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-xs">
                          {mov.productName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          isEntrada 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isEntrada ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {isEntrada ? `+${mov.quantity}` : `-${mov.quantity}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getReasonBadge(mov.reason)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono">
                        <span className="text-slate-400">{mov.previousStock}</span>
                        <span className="text-slate-400 mx-1.5">➔</span>
                        <span className="font-bold text-slate-900">{mov.newStock} un</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                        {mov.notes || <span className="text-slate-300 italic">Sem observações</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
