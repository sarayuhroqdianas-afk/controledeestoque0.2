export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  minStock: number;
  sku?: string;
  updatedAt: string;
}

export type MovementType = 'ENTRADA' | 'SAIDA';

export type MovementReason = 
  | 'COMPRA' 
  | 'VENDA' 
  | 'AJUSTE' 
  | 'AVARIA' 
  | 'DEVOLUCAO' 
  | 'REQUISICAO'
  | 'OUTRO';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: MovementReason;
  notes?: string;
  createdAt: string;
}

export type RequisitionPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
export type RequisitionStatus = 'PENDENTE' | 'APROVADA' | 'ATENDIDA' | 'CANCELADA';

export interface RequisitionItem {
  productId: string;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  estimatedUnitCost: number;
}

export interface StockRequisition {
  id: string;
  code: string;
  department: string;
  requester: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  justification: string;
  items: RequisitionItem[];
  createdAt: string;
  totalEstimated: number;
}

export interface AIStudioPrompt {
  id: string;
  step: number;
  title: string;
  description: string;
  componentTarget: string;
  promptText: string;
  tags: string[];
}
