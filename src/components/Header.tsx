import React from 'react';
import { 
  Package, 
  ArrowLeftRight, 
  FileText, 
  ClipboardList, 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  DollarSign, 
  RotateCcw,
  Boxes
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  activeTab: 'products' | 'movements' | 'reports' | 'requisitions' | 'prompts';
  setActiveTab: (tab: 'products' | 'movements' | 'reports' | 'requisitions' | 'prompts') => void;
  onOpenNewProduct: () => void;
  totalProducts: number;
  criticalCount: number;
  totalInventoryValue: number;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewProduct,
  totalProducts,
  criticalCount,
  totalInventoryValue,
  onResetData,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3.5 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('products')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20">
                <Boxes className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Estoque Certo</h1>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">Gestão de estoque ágil e intuitiva para comércio</p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="sm:hidden flex items-center gap-1.5">
              <button
                id="btn-prompts-mobile"
                onClick={() => setActiveTab('prompts')}
                className={`flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                  activeTab === 'prompts'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }`}
                title="Prompts para o Google AI Studio"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompts</span>
              </button>

              <button
                id="btn-novo-produto-mobile"
                onClick={onOpenNewProduct}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Novo</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar (Desktop/Tablet) */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 whitespace-nowrap">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">Total:</span>
              <strong className="text-slate-900 font-bold">{totalProducts} itens</strong>
            </div>

            <div 
              onClick={() => setActiveTab('products')} 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border whitespace-nowrap cursor-pointer transition-colors ${
                criticalCount > 0 
                  ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
              <span>Estoque Crítico (&lt; 5):</span>
              <strong className={criticalCount > 0 ? 'text-rose-700 font-extrabold' : 'text-slate-800 font-bold'}>
                {criticalCount}
              </strong>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 whitespace-nowrap">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600">Patrimônio:</span>
              <strong className="text-emerald-700 font-bold">{formatCurrency(totalInventoryValue)}</strong>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                id="btn-prompts-top"
                onClick={() => setActiveTab('prompts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  activeTab === 'prompts'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                }`}
                title="Prompts para o Google AI Studio (Gemini)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prompt AI Studio</span>
              </button>

              <button
                id="btn-novo-produto-desktop"
                onClick={onOpenNewProduct}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Produto</span>
              </button>

              <button
                title="Restaurar dados iniciais"
                onClick={onResetData}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center space-x-1 sm:space-x-2 border-t border-slate-100 pt-1 pb-1 overflow-x-auto scrollbar-none">
          <button
            id="tab-produtos"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'products'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos & Estoque</span>
          </button>

          <button
            id="tab-movimentacoes"
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'movements'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Movimentações</span>
          </button>

          <button
            id="tab-relatorios"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'reports'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatório de Posição</span>
          </button>

          <button
            id="tab-requisicoes"
            onClick={() => setActiveTab('requisitions')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'requisitions'
                ? 'bg-emerald-50 text-emerald-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Requisições Internas</span>
          </button>

          <button
            id="tab-prompts"
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border shrink-0 ${
              activeTab === 'prompts'
                ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold shadow-xs'
                : 'text-purple-700 bg-purple-50/70 border-purple-200 hover:bg-purple-100 hover:text-purple-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Prompts AI Studio</span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-200 text-purple-800">
              5
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
