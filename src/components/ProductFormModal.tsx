import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save, AlertCircle, PlusCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'updatedAt'>, editId?: string) => void;
  productToEdit?: Product | null;
  categories: string[];
  onAddCategory: (category: string) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  categories,
  onAddCategory,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number>(5);
  const [sku, setSku] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setQuantity(productToEdit.quantity);
      setUnitPrice(productToEdit.unitPrice);
      setMinStock(productToEdit.minStock || 5);
      setSku(productToEdit.sku || '');
      setIsCustomCategory(false);
      setCustomCategoryName('');
    } else {
      setName('');
      setCategory(categories[0] || 'Alimentos');
      setQuantity(0);
      setUnitPrice('');
      setMinStock(5);
      setSku('');
      setIsCustomCategory(false);
      setCustomCategoryName('');
    }
    setErrors({});
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'O nome do produto deve ter pelo menos 2 caracteres.';
    }

    const selectedCategory = isCustomCategory ? customCategoryName.trim() : category;
    if (!selectedCategory) {
      newErrors.category = 'Informe ou selecione uma categoria válida.';
    }

    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) < 0) {
      newErrors.quantity = 'A quantidade não pode ser negativa.';
    }

    if (unitPrice === '' || isNaN(Number(unitPrice)) || Number(unitPrice) <= 0) {
      newErrors.unitPrice = 'Informe um preço unitário maior que R$ 0,00.';
    }

    if (isNaN(Number(minStock)) || Number(minStock) < 0) {
      newErrors.minStock = 'O estoque mínimo deve ser zero ou maior.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalCategory = category;
    if (isCustomCategory && customCategoryName.trim()) {
      finalCategory = customCategoryName.trim();
      onAddCategory(finalCategory);
    }

    onSave(
      {
        name: name.trim(),
        category: finalCategory,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        minStock: Number(minStock) || 5,
        sku: sku.trim() || undefined,
      },
      productToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        id="modal-cadastro-produto"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {productToEdit ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <p className="text-xs text-slate-500">
                {productToEdit ? 'Atualize as informações do item selecionado' : 'Preencha os campos abaixo para registrar o item'}
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
          {/* Nome do Produto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Produto <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-produto-nome"
              type="text"
              placeholder="Ex: Arroz Tipo 1 5kg, Cabo USB-C 2m"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 ${
                errors.name 
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900' 
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                {isCustomCategory ? 'Usar existentes' : '+ Nova Categoria'}
              </button>
            </div>

            {isCustomCategory ? (
              <div className="flex gap-2">
                <input
                  id="input-categoria-customizada"
                  type="text"
                  placeholder="Digite a nova categoria..."
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            ) : (
              <select
                id="select-produto-categoria"
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    setIsCustomCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW__">+ Criar categoria personalizada...</option>
              </select>
            )}
            {errors.category && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.category}</span>
              </p>
            )}
          </div>

          {/* Quantidade e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantidade Inicial em Estoque <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-produto-quantidade"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 ${
                  errors.quantity 
                    ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900' 
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              <span className="text-[11px] text-slate-400">Valores &lt; 5 sinalizam estoque crítico</span>
              {errors.quantity && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.quantity}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preço Unitário (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">
                  R$
                </span>
                <input
                  id="input-produto-preco"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 ${
                    errors.unitPrice 
                      ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900' 
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20'
                  }`}
                />
              </div>
              {errors.unitPrice && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.unitPrice}</span>
                </p>
              )}
            </div>
          </div>

          {/* Estoque Mínimo e SKU opcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite para Alerta Crítico (Mínimo)
              </label>
              <input
                id="input-produto-minstock"
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <span className="text-[11px] text-slate-400">Padrão do sistema: 5 unidades</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código / SKU / Código de Barras (Opcional)
              </label>
              <input
                id="input-produto-sku"
                type="text"
                placeholder="Ex: PROD-092"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl shadow-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-salvar-produto"
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{productToEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
