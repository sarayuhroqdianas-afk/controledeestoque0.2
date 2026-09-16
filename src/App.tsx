/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_MOVEMENTS, 
  INITIAL_CATEGORIES, 
  INITIAL_REQUISITIONS 
} from './data/initialData';
import { 
  Product, 
  StockMovement, 
  StockRequisition, 
  MovementType, 
  MovementReason 
} from './types';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { MovementModal } from './components/MovementModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { MovementsView } from './components/MovementsView';
import { ReportsView } from './components/ReportsView';
import { RequisitionsView } from './components/RequisitionsView';
import { PromptsView } from './components/PromptsView';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const STORAGE_KEYS = {
  PRODUCTS: 'estoque_certo_products_v1',
  MOVEMENTS: 'estoque_certo_movements_v1',
  CATEGORIES: 'estoque_certo_categories_v1',
  REQUISITIONS: 'estoque_certo_requisitions_v1',
};

export default function App() {
  // Persistence states
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch (e) {
      return INITIAL_CATEGORIES;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch (e) {
      return INITIAL_MOVEMENTS;
    }
  });

  const [requisitions, setRequisitions] = useState<StockRequisition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUISITIONS);
      return saved ? JSON.parse(saved) : INITIAL_REQUISITIONS;
    } catch (e) {
      return INITIAL_REQUISITIONS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUISITIONS, JSON.stringify(requisitions));
  }, [requisitions]);

  // Tab & UI navigation
  const [activeTab, setActiveTab] = useState<
    'products' | 'movements' | 'reports' | 'requisitions' | 'prompts'
  >('products');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [movementInitialType, setMovementInitialType] = useState<MovementType>('ENTRADA');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Handlers
  const handleSaveProduct = (
    productData: Omit<Product, 'id' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editId
            ? { ...p, ...productData, updatedAt: new Date().toISOString() }
            : p
        )
      );
      showToast(`Produto "${productData.name}" atualizado com sucesso!`);
    } else {
      const newProduct: Product = {
        id: 'prod-' + Date.now(),
        ...productData,
        updatedAt: new Date().toISOString(),
      };
      setProducts(prev => [newProduct, ...prev]);

      // Also record initial stock movement if quantity > 0
      if (newProduct.quantity > 0) {
        const initialMovement: StockMovement = {
          id: 'mov-' + Date.now(),
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'ENTRADA',
          quantity: newProduct.quantity,
          previousStock: 0,
          newStock: newProduct.quantity,
          reason: 'COMPRA',
          notes: 'Cadastro inicial de produto com saldo em estoque',
          createdAt: new Date().toISOString(),
        };
        setMovements(prev => [initialMovement, ...prev]);
      }

      showToast(`Produto "${newProduct.name}" cadastrado com sucesso!`);
    }
  };

  const handleDeleteProductConfirm = () => {
    if (!productToDelete) return;
    const name = productToDelete.name;
    setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    setProductToDelete(null);
    showToast(`Produto "${name}" removido do catálogo.`);
  };

  const handleSaveMovement = (
    productId: string,
    type: MovementType,
    quantity: number,
    reason: MovementReason,
    notes?: string
  ) => {
    const targetProduct = products.find(p => p.id === productId);
    if (!targetProduct) return;

    const previousStock = targetProduct.quantity;
    const newStock = type === 'ENTRADA' ? previousStock + quantity : previousStock - quantity;

    // Update product stock
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: newStock, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Record movement
    const newMovement: StockMovement = {
      id: 'mov-' + Date.now(),
      productId,
      productName: targetProduct.name,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      notes,
      createdAt: new Date().toISOString(),
    };

    setMovements(prev => [newMovement, ...prev]);
    showToast(
      `${type === 'ENTRADA' ? 'Entrada' : 'Saída'} de ${quantity} un de "${targetProduct.name}" registrada!`
    );
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleSaveRequisition = (newReq: StockRequisition) => {
    setRequisitions(prev => [newReq, ...prev]);
    showToast(`Requisição interna ${newReq.code} gerada com sucesso!`);
  };

  const handleDeleteRequisition = (id: string) => {
    setRequisitions(prev => prev.filter(r => r.id !== id));
    showToast('Requisição removida.');
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração originais? Isso resetará produtos, movimentações e requisições.')) {
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setMovements(INITIAL_MOVEMENTS);
      setRequisitions(INITIAL_REQUISITIONS);
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
      localStorage.removeItem(STORAGE_KEYS.REQUISITIONS);
      showToast('Dados de demonstração restaurados com sucesso!');
    }
  };

  // Metrics
  const criticalCount = products.filter(
    p => p.quantity < (p.minStock || 5) || p.quantity < 5
  ).length;

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header with quick metrics and tabs */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewProduct={() => {
          setProductToEdit(null);
          setIsProductModalOpen(true);
        }}
        totalProducts={products.length}
        criticalCount={criticalCount}
        totalInventoryValue={totalInventoryValue}
        onResetData={handleResetData}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Critical Stock Alert Banner if < 5 items exist */}
        {criticalCount > 0 && activeTab === 'products' && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse text-rose-600" />
              </div>
              <div>
                <strong className="text-rose-900 text-sm font-bold block">
                  Atenção: {criticalCount} produto(s) com estoque crítico (&lt; 5 un)
                </strong>
                <span className="text-rose-700">
                  Itens com estoque baixo podem causar ruptura de vendas. Reabasteça ou gere uma Requisição Interna.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('requisitions')}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                Gerar Requisição de Reposição
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Products List & Control */}
        {activeTab === 'products' && (
          <ProductList
            products={products}
            categories={categories}
            onOpenNewProduct={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            onEditProduct={(product) => {
              setProductToEdit(product);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={(product) => {
              setProductToDelete(product);
              setIsDeleteModalOpen(true);
            }}
            onOpenMovement={(product, type) => {
              setMovementProduct(product);
              setMovementInitialType(type);
              setIsMovementModalOpen(true);
            }}
          />
        )}

        {/* Tab 2: Movements History */}
        {activeTab === 'movements' && (
          <MovementsView
            movements={movements}
          />
        )}

        {/* Tab 3: Reports */}
        {activeTab === 'reports' && (
          <ReportsView
            products={products}
            onShowToast={showToast}
          />
        )}

        {/* Tab 4: Internal Requisitions */}
        {activeTab === 'requisitions' && (
          <RequisitionsView
            products={products}
            requisitions={requisitions}
            onSaveRequisition={handleSaveRequisition}
            onDeleteRequisition={handleDeleteRequisition}
            onShowToast={showToast}
          />
        )}

        {/* Tab 5: AI Studio Prompts */}
        {activeTab === 'prompts' && (
          <PromptsView onShowToast={showToast} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Estoque Certo</span>
            <span>— Sistema Simplificado de Gestão de Estoque</span>
          </div>
          <div className="text-slate-400">
            Armazenamento Local Ativo (localStorage) • Pronto para pequenos comércios
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <MovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setMovementProduct(null);
        }}
        product={movementProduct}
        initialType={movementInitialType}
        onSaveMovement={handleSaveMovement}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProductConfirm}
        product={productToDelete}
      />
    </div>
  );
}
