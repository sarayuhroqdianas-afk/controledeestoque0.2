import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product, MovementType, MovementReason } from '../types';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaveMovement: (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: MovementReason,
    notes?: string
  ) => void;
  initialType?: MovementType;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveMovement,
  initialType = 'ENTRADA',
}) => {
  const [type, setType] = useState<MovementType>(initialType);
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [reason, setReason] = useState<MovementReason>('COMPRA');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(initialType);
    setReason(initialType === 'ENTRADA' ? 'COMPRA' : 'VENDA');
    setQuantity(1);
    setNotes('');
    setError(null);
  }, [initialType, isOpen, product]);

  if (!isOpen || !product) return null;

  const currentStock = product.quantity;
  const numQuantity = Number(quantity) || 0;
  const projectedStock = type === 'ENTRADA' 
    ? currentStock + numQuantity 
    : currentStock - numQuantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!numQuantity || numQuantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    if (type === 'SAIDA' && numQuantity > currentStock) {
      setError(`Estoque insuficiente! Você tentou retirar ${numQuantity} unidades, mas há apenas ${currentStock} em estoque.`);
      return;
    }

    onSaveMovement(product.id, type, numQuantity, reason, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div 
        id="modal-movimentacao-estoque"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${type === 'ENTRADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Movimentação de Estoque
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[240px]">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item details mini badge */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs text-slate-500">Saldo Atual:</span>
              <div className="text-lg font-extrabold text-slate-900">{currentStock} un</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Categoria:</span>
              <div className="text-xs font-semibold text-slate-700">{product.category}</div>
            </div>
          </div>

          {/* Type Toggle: Entrada vs Saída */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tipo de Operação
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-tipo-entrada"
                onClick={() => {
                  setType('ENTRADA');
                  setReason('COMPRA');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'ENTRADA'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>+ ENTRADA</span>
              </button>

              <button
                type="button"
                id="btn-tipo-saida"
                onClick={() => {
                  setType('SAIDA');
                  setReason('VENDA');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  type === 'SAIDA'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>- SAÍDA</span>
              </button>
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantidade a {type === 'ENTRADA' ? 'Adicionar' : 'Retirar'} <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-movimentacao-qtd"
              type="number"
              min="1"
              max={type === 'SAIDA' ? currentStock : undefined}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setQuantity(val);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo da Movimentação
            </label>
            <select
              id="select-movimentacao-motivo"
              value={reason}
              onChange={(e) => setReason(e.target.value as MovementReason)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {type === 'ENTRADA' ? (
                <>
                  <option value="COMPRA">Compra de Fornecedor / Lote</option>
                  <option value="DEVOLUCAO">Devolução de Cliente</option>
                  <option value="AJUSTE">Ajuste de Inventário / Contagem</option>
                  <option value="OUTRO">Outra Entrada</option>
                </>
              ) : (
                <>
                  <option value="VENDA">Venda / Saída de Caixa</option>
                  <option value="AVARIA">Avaria / Vencimento / Estrago</option>
                  <option value="REQUISICAO">Requisição / Uso Interno</option>
                  <option value="AJUSTE">Ajuste de Inventário / Perda</option>
                  <option value="OUTRO">Outra Saída</option>
                </>
              )}
            </select>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Referência (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: NF 1234, Venda para João, Quebra no transporte"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Previsão de Saldo Resultante */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            projectedStock < 5 
              ? 'bg-rose-50/70 border-rose-200 text-rose-800' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span>Novo Saldo Previsto:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 line-through">{currentStock}</span>
              <span className="font-bold">➔</span>
              <span className={`text-sm font-extrabold ${projectedStock < 5 ? 'text-rose-700' : 'text-emerald-700'}`}>
                {projectedStock} unidades
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-movimentacao"
              type="submit"
              className={`flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white rounded-xl shadow-xs transition-all ${
                type === 'ENTRADA' 
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800' 
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar {type === 'ENTRADA' ? 'Entrada (+)' : 'Saída (-)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
