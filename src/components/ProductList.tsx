import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight, 
  Layers, 
  LayoutList, 
  LayoutGrid, 
  PackageSearch,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Product, MovementType } from '../types';
import { formatCurrency, getStockStatus, formatDateShort } from '../utils/formatters';

interface ProductListProps {
  products: Product[];
  categories: string[];
  onOpenNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onOpenMovement: (product: Product, type: MovementType) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  onOpenNewProduct,
  onEditProduct,
  onDeleteProduct,
  onOpenMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NORMAL'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

      const status = getStockStatus(p.quantity, p.minStock);
      const matchesStock = 
        stockFilter === 'ALL' ||
        (stockFilter === 'CRITICAL' && status.status === 'critical') ||
        (stockFilter === 'WARNING' && status.status === 'warning') ||
        (stockFilter === 'NORMAL' && status.status === 'normal');

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const criticalTotal = products.filter(p => p.quantity < (p.minStock || 5) || p.quantity < 5).length;
  const warningTotal = products.filter(p => p.quantity >= 5 && p.quantity < 10).length;

  const totalVisibleQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalVisibleValue = filteredProducts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  return (
    <div className="space-y-4">
      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="input-busca-produtos"
              type="text"
              placeholder="Buscar por nome do produto, SKU ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              id="filtro-categoria"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas as Categorias ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                title="Visualização em Tabela"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                title="Visualização em Cards"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stock Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none pt-1 border-t border-slate-100">
          <span className="text-slate-500 font-semibold flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Situação:
          </span>

          <button
            onClick={() => setStockFilter('ALL')}
            className={`px-3 py-1 rounded-lg border font-medium transition-all whitespace-nowrap ${
              stockFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todos ({products.length})
          </button>

          <button
            onClick={() => setStockFilter('CRITICAL')}
            className={`px-3 py-1 rounded-lg border font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stockFilter === 'CRITICAL'
                ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Crítico &lt; 5 un ({criticalTotal})</span>
          </button>

          <button
            onClick={() => setStockFilter('WARNING')}
            className={`px-3 py-1 rounded-lg border font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              stockFilter === 'WARNING'
                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Atenção 5-9 un ({warningTotal})</span>
          </button>

          <button
            onClick={() => setStockFilter('NORMAL')}
            className={`px-3 py-1 rounded-lg border font-medium transition-all whitespace-nowrap ${
              stockFilter === 'NORMAL'
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            Regular ≥ 10 un ({products.length - criticalTotal - warningTotal})
          </button>
        </div>
      </div>

      {/* Product List Content */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <PackageSearch className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Nenhum produto encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Não localizamos itens com os filtros ou termo de busca selecionados. Tente limpar os filtros ou cadastre um novo produto.
          </p>
          <div className="flex items-center justify-center gap-3">
            {(searchTerm || selectedCategory !== 'ALL' || stockFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                  setStockFilter('ALL');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Limpar Filtros
              </button>
            )}
            <button
              onClick={onOpenNewProduct}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW (Default Desktop) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Produto & Categoria</th>
                  <th className="py-3 px-4">SKU / Cód.</th>
                  <th className="py-3 px-4 text-center">Estoque Atual</th>
                  <th className="py-3 px-4">Indicador de Situação</th>
                  <th className="py-3 px-4 text-right">Preço Unitário</th>
                  <th className="py-3 px-4 text-right">Valor em Estoque</th>
                  <th className="py-3 px-4 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.quantity, product.minStock);
                  const isCrit = status.isCritical;

                  return (
                    <tr 
                      key={product.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isCrit ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Name & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          {isCrit && (
                            <div className="mt-0.5" title="Estoque Crítico (< 5 itens)">
                              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">
                              {product.name}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                              <Tag className="w-3 h-3 text-slate-400" />
                              {product.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {product.sku || '-'}
                      </td>

                      {/* Quantity in stock */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-base font-extrabold ${status.textClass}`}>
                          {product.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          mín: {product.minStock || 5}
                        </span>
                      </td>

                      {/* Visual Alert Badge (< 5 un etc) */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.badgeClass}`}>
                          {status.status === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                          {status.status === 'warning' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>}
                          {status.status === 'normal' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                          {status.label}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(product.unitPrice)}
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(product.quantity * product.unitPrice)}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Entrada */}
                          <button
                            id={`btn-entrada-${product.id}`}
                            title="Adicionar Estoque (+ Entrada)"
                            onClick={() => onOpenMovement(product, 'ENTRADA')}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">+ Entrada</span>
                          </button>

                          {/* Saída */}
                          <button
                            id={`btn-saida-${product.id}`}
                            title="Remover Estoque (- Saída)"
                            disabled={product.quantity <= 0}
                            onClick={() => onOpenMovement(product, 'SAIDA')}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              product.quantity <= 0 
                                ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">- Saída</span>
                          </button>

                          {/* Edit */}
                          <button
                            id={`btn-edit-${product.id}`}
                            title="Editar Dados do Produto"
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            id={`btn-delete-${product.id}`}
                            title="Excluir Produto"
                            onClick={() => onDeleteProduct(product)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table summary bar */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Exibindo <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> de {products.length} produtos
            </div>
            <div className="flex items-center gap-4 font-medium">
              <span>Unidades Físicas: <strong className="text-slate-900 font-bold">{totalVisibleQuantity}</strong></span>
              <span className="text-slate-300">|</span>
              <span>Valor Total Visível: <strong className="text-emerald-700 font-bold text-sm">{formatCurrency(totalVisibleValue)}</strong></span>
            </div>
          </div>
        </div>
      ) : (
        /* CARDS / MOBILE GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const status = getStockStatus(product.quantity, product.minStock);
            const isCrit = status.isCritical;

            return (
              <div
                key={product.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  isCrit ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="inline-block text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-1">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                        {product.name}
                      </h4>
                      {product.sku && (
                        <span className="text-[10px] font-mono text-slate-400">SKU: {product.sku}</span>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Stock metric card */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Estoque Atual:</span>
                      <span className={`text-base font-extrabold ${status.textClass}`}>
                        {product.quantity} un
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 block">Preço Unit.:</span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(product.unitPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex justify-between items-center py-1">
                    <span>Subtotal em estoque:</span>
                    <strong className="text-slate-900 font-bold">
                      {formatCurrency(product.quantity * product.unitPrice)}
                    </strong>
                  </div>
                </div>

                {/* Card actions */}
                <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenMovement(product, 'ENTRADA')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Entrada</span>
                    </button>
                    <button
                      disabled={product.quantity <= 0}
                      onClick={() => onOpenMovement(product, 'SAIDA')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                        product.quantity <= 0
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Saída</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
