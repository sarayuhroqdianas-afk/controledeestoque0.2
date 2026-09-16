export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateShort(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export interface StockStatusInfo {
  label: string;
  status: 'critical' | 'warning' | 'normal';
  badgeClass: string;
  textClass: string;
  isCritical: boolean;
  isLow: boolean;
}

export function getStockStatus(quantity: number, minStock: number = 5): StockStatusInfo {
  if (quantity < minStock || quantity < 5) {
    return {
      label: 'Crítico (< 5 un)',
      status: 'critical',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20',
      textClass: 'text-rose-600 font-bold',
      isCritical: true,
      isLow: true,
    };
  }
  if (quantity < 10) {
    return {
      label: 'Baixo (5-9 un)',
      status: 'warning',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
      textClass: 'text-amber-700 font-semibold',
      isCritical: false,
      isLow: true,
    };
  }
  return {
    label: 'Normal (≥ 10 un)',
    status: 'normal',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    textClass: 'text-emerald-700 font-medium',
    isCritical: false,
    isLow: false,
  };
}
