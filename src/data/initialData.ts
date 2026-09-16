import { Product, StockMovement, StockRequisition, AIStudioPrompt } from '../types';

export const INITIAL_CATEGORIES: string[] = [
  'Alimentos',
  'Bebidas',
  'Eletrônicos',
  'Vestuário',
  'Limpeza & Higiene',
  'Papelaria & Escritório',
  'Utilidades'
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Café Torrado Especial 500g',
    category: 'Alimentos',
    quantity: 3, // < 5: Estoque Crítico (Vermelho)
    unitPrice: 22.50,
    minStock: 5,
    sku: 'ALM-001',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Azeite de Oliva Extra Virgem 500ml',
    category: 'Alimentos',
    quantity: 4, // < 5: Estoque Crítico (Vermelho)
    unitPrice: 38.90,
    minStock: 5,
    sku: 'ALM-002',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Cabo USB-C Carregamento Rápido 1.5m',
    category: 'Eletrônicos',
    quantity: 7, // 5 a 9: Estoque Baixo / Alerta (Amarelo)
    unitPrice: 29.90,
    minStock: 5,
    sku: 'ELT-010',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Fone de Ouvido Bluetooth Intra-auricular',
    category: 'Eletrônicos',
    quantity: 2, // < 5: Estoque Crítico (Vermelho)
    unitPrice: 89.00,
    minStock: 5,
    sku: 'ELT-011',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Camiseta Algodão Básica Preta M',
    category: 'Vestuário',
    quantity: 18, // >= 10: Estoque Regular (Verde)
    unitPrice: 45.00,
    minStock: 5,
    sku: 'VES-030',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Calça Jeans Tradicional Masculina 42',
    category: 'Vestuário',
    quantity: 12, // >= 10: Regular (Verde)
    unitPrice: 119.90,
    minStock: 5,
    sku: 'VES-031',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: 'prod-7',
    name: 'Detergente Neutro Concentrado 5L',
    category: 'Limpeza & Higiene',
    quantity: 8, // 5 a 9: Alerta (Amarelo)
    unitPrice: 32.00,
    minStock: 5,
    sku: 'LMP-005',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'prod-8',
    name: 'Água Mineral sem Gás 510ml (Fardo c/ 12)',
    category: 'Bebidas',
    quantity: 25, // Regular (Verde)
    unitPrice: 24.00,
    minStock: 8,
    sku: 'BEB-008',
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  }
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    productName: 'Café Torrado Especial 500g',
    type: 'SAIDA',
    quantity: 5,
    previousStock: 8,
    newStock: 3,
    reason: 'VENDA',
    notes: 'Venda balcão para cliente regular',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'mov-2',
    productId: 'prod-5',
    productName: 'Camiseta Algodão Básica Preta M',
    type: 'ENTRADA',
    quantity: 10,
    previousStock: 8,
    newStock: 18,
    reason: 'COMPRA',
    notes: 'Recebimento lote fornecedor Confecções Brasil NF 4821',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'mov-3',
    productId: 'prod-4',
    productName: 'Fone de Ouvido Bluetooth Intra-auricular',
    type: 'SAIDA',
    quantity: 1,
    previousStock: 3,
    newStock: 2,
    reason: 'AVARIA',
    notes: 'Produto apresentou defeito de fábrica no conector e foi segregado',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  }
];

export const INITIAL_REQUISITIONS: StockRequisition[] = [
  {
    id: 'req-1',
    code: 'REQ-2026-001',
    department: 'Balcão / Atendimento',
    requester: 'Carlos Silva (Gerente de Loja)',
    priority: 'URGENTE',
    status: 'PENDENTE',
    justification: 'Itens em estoque crítico necessários para o movimento de final de semana.',
    items: [
      {
        productId: 'prod-1',
        productName: 'Café Torrado Especial 500g',
        currentStock: 3,
        requestedQuantity: 20,
        estimatedUnitCost: 22.50
      },
      {
        productId: 'prod-2',
        productName: 'Azeite de Oliva Extra Virgem 500ml',
        currentStock: 4,
        requestedQuantity: 15,
        estimatedUnitCost: 38.90
      },
      {
        productId: 'prod-4',
        productName: 'Fone de Ouvido Bluetooth Intra-auricular',
        currentStock: 2,
        requestedQuantity: 10,
        estimatedUnitCost: 89.00
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    totalEstimated: 1923.50
  }
];

export const AI_STUDIO_PROMPTS: AIStudioPrompt[] = [
  {
    id: 'prompt-1',
    step: 1,
    title: 'Prompt 1: Estrutura Base, Layout & Armazenamento Local',
    description: 'Configura o esqueleto visual do app Estoque Certo com Tailwind CSS, layout responsivo (mobile e desktop), navegação fluida e motor de persistência em localStorage.',
    componentTarget: 'Layout Principal & LocalStorage Engine',
    tags: ['Arquitetura', 'Setup', 'LocalStorage', 'Responsivo'],
    promptText: `Você é um desenvolvedor sênior front-end especializado em React, TypeScript e Tailwind CSS.
Crie a estrutura principal de um aplicativo web e mobile chamado "Estoque Certo", focado em pequenos comerciantes para controle ágil de estoque.

Requisitos Técnicos e Arquiteturais:
1. Tecnologias: React 18+, TypeScript, Tailwind CSS, Lucide Icons.
2. Persistência de Dados: O aplicativo deve salvar e sincronizar todo o estado em \`localStorage\` sob a chave \`estoque_certo_data\`, carregando dados iniciais de demonstração (arroz, café, fone, roupas) caso o armazenamento esteja vazio.
3. Tipagem TypeScript obrigatória:
   - \`Product\`: id, name, category, quantity, unitPrice, minStock (padrão 5), sku, updatedAt.
   - \`StockMovement\`: id, productId, productName, type ('ENTRADA' | 'SAIDA'), quantity, previousStock, newStock, reason, notes, createdAt.
   - \`StockRequisition\`: id, code, department, requester, priority, status, justification, items, createdAt, totalEstimated.
4. Header e Navegação:
   - Barra superior moderna com logotipo do Estoque Certo, indicador de data atual e badges com métricas rápidas: Total de Itens Cadastrados, Valor Financeiro do Estoque (R$) e Alerta de Itens Críticos (< 5 un).
   - Abas de navegação responsivas: "Estoque de Produtos", "Movimentações", "Relatórios Financeiros", "Requisições Internas".
5. Design: Cores neutras sofisticadas (slate/zinc) com detalhes em esmeralda/índigo, cantos arredondados equilibrados, total responsividade para smartphones e desktops.`
  },
  {
    id: 'prompt-2',
    step: 2,
    title: 'Prompt 2: Formulário de Cadastro e Edição de Produtos',
    description: 'Gera o modal e formulário validado para inclusão e edição de produtos com categorias pré-definidas e customizáveis, preços e limites de estoque.',
    componentTarget: 'ProductFormModal.tsx & Validações',
    tags: ['Cadastro', 'Validações', 'Categorias', 'Modal'],
    promptText: `Atue como desenvolvedor React/TypeScript. Desenvolva o componente de formulário e modal de Cadastro e Edição de Produtos para o aplicativo "Estoque Certo".

Requisitos Específicos:
1. Campos do Formulário:
   - Nome do Produto (obrigatório, mínimo 3 caracteres).
   - Categoria: select com opções pré-definidas (Alimentos, Bebidas, Eletrônicos, Vestuário, Limpeza & Higiene, Utilidades) e uma opção "+ Criar Nova Categoria" que abre um campo de texto dinâmico para o comerciante criar qualquer categoria personalizada.
   - Quantidade em Estoque Atual (campo numérico, bloqueio absoluto de valores negativos >= 0).
   - Preço Unitário de Venda / Custo em R$ (formatação em moeda brasileira, validação de valor > 0).
   - Estoque Mínimo para Alerta (padrão 5 unidades, customizável por produto).
   - Código / SKU (opcional, gerador automático de código se deixado em branco).
2. Validações e UX:
   - Tratamento de erros em tempo real com mensagens explicativas em português.
   - Botões claros de "Salvar Produto" e "Cancelar".
   - Ao salvar, emitir toast/feedback de sucesso e persistir no \`localStorage\`.
   - Suporte a modo Edição: pré-preenche todos os dados do produto existente e atualiza a data de modificação.`
  },
  {
    id: 'prompt-3',
    step: 3,
    title: 'Prompt 3: Tabela e Lista com Alertas Visuais de Estoque Baixo',
    description: 'Gera a listagem de produtos com badges visuais em vermelho para quantidade < 5 e amarelo para 5 a 9, busca instantânea e filtros por categoria.',
    componentTarget: 'ProductList.tsx & Badges de Alerta',
    tags: ['Listagem', 'Alertas < 5', 'Busca', 'Filtros'],
    promptText: `Como especialista em UI/UX para pequenos negócios, crie o componente de Listagem e Visualização de Produtos do aplicativo "Estoque Certo".

Requisitos de Apresentação e Interação:
1. Indicadores Visuais de Alerta (Obrigatório):
   - Estoque Crítico (< 5 unidades ou <= estoque mínimo): Destaque com badge vermelho vibrante (ex.: bg-red-100 text-red-700 border-red-200), ícone de alerta \`AlertTriangle\` e aviso explícito "Estoque Crítico (Comprar!)".
   - Estoque em Atenção (5 a 9 unidades): Badge amarelo/âmbar (ex.: bg-amber-100 text-amber-800) "Estoque Baixo".
   - Estoque Normal (>= 10 unidades): Badge verde suave (ex.: bg-emerald-100 text-emerald-700) "Estoque Seguro".
2. Barra de Controle:
   - Input de pesquisa rápida com debounce para filtrar por nome do produto ou SKU.
   - Filtro por Categoria e Filtro por Situação de Estoque (Todos, Apenas Críticos < 5, Apenas Baixos, Normais).
   - Alternador de visualização: Tabela detalhada (ideal para desktop) ou Cards táteis (ideal para smartphone).
3. Ações Rápidas por Produto:
   - Botão rápido "+ Entrada" (verde) e "- Saída" (laranja/vermelho) direto no item.
   - Botão de "Editar" e "Excluir" (com diálogo modal de confirmação para prevenir cliques acidentais).
4. Rodapé da Tabela:
   - Exibição de totalizador de produtos visíveis, soma de unidades físicas e valor total monetário em estoque.`
  },
  {
    id: 'prompt-4',
    step: 4,
    title: 'Prompt 4: Controle de Movimentação de Estoque (Entradas e Saídas)',
    description: 'Implementa o modal ágil de movimentação de estoque, cálculo automático, bloqueio de estoque negativo e registro auditável no histórico.',
    componentTarget: 'StockMovementModal.tsx & Histórico',
    tags: ['Movimentação', 'Entrada', 'Saída', 'Auditoria'],
    promptText: `Desenvolva o subsistema completo de Movimentação de Estoque para o aplicativo "Estoque Certo" em React e TypeScript.

Funcionalidades Exigidas:
1. Modal de Movimentação Rápida:
   - Exibe o produto selecionado, foto/ícone da categoria e a quantidade atual em estoque.
   - Seletor de Tipo com botões grandes estilo toggle:
     * [ + ENTRADA DE ESTOQUE ] (verde)
     * [ - SAÍDA DE ESTOQUE ] (vermelho)
   - Campo para "Quantidade a Movimentar" com validação:
     * Impede números menores ou iguais a zero.
     * Na SAÍDA: Validação estrita impedindo subtrair uma quantidade maior do que o estoque disponível (ex.: se tem 3, não permite retirar 4).
   - Campo "Motivo da Movimentação":
     * Se Entrada: Compra de Fornecedor, Devolução de Cliente, Ajuste de Inventário.
     * Se Saída: Venda Balcão, Avaria / Produto Vencido, Uso Interno / Requisição, Ajuste de Inventário.
   - Campo opcional de "Observações / Nota Fiscal / Responsável".
   - Pré-visualização dinâmica: "Estoque Atual: X -> Novo Estoque: Y".
2. Histórico de Movimentações (Aba/Modal):
   - Tabela com data/hora formatada, nome do produto, tipo com badge colorido (+X verde ou -X vermelho), motivo, estoque anterior, novo saldo e notas.
   - Filtro por período, tipo de movimentação e busca por produto.`
  },
  {
    id: 'prompt-5',
    step: 5,
    title: 'Prompt 5: Relatórios de Posição & Emissor de Requisições Internas',
    description: 'Desenvolve os relatórios financeiros/gerenciais de posição do estoque e o gerador de requisições internas de reposição com impressão limpa.',
    componentTarget: 'ReportsView.tsx & RequisitionsView.tsx',
    tags: ['Relatórios', 'Requisições', 'Impressão PDF', 'Exportação CSV'],
    promptText: `Crie os módulos de "Relatórios de Posição de Estoque" e "Emissão de Requisições Internas" para o sistema "Estoque Certo".

Módulo 1: Relatório de Posição do Estoque:
1. Cartões de Resumo Executivo:
   - Valor Total do Estoque a Preço de Custo/Venda (R$).
   - Total de Unidades Físicas em Prateleira.
   - Quantidade de Itens com Estoque Crítico (< 5 unidades).
   - Distribuição do capital investido agrupado por categoria (com percentual e barra de progresso visual).
2. Tabela de Posição do Inventário com Ordenação.
3. Botão "Exportar para Planilha (CSV)" que gera arquivo .csv compatível com Excel e Google Planilhas.
4. Botão "Imprimir Relatório" com regras CSS \`@media print\` formatando o documento perfeitamente em página A4 timbrada para o comerciante.

Módulo 2: Emissão e Gestão de Requisições Internas:
1. Formulário de Nova Requisição:
   - Número automático formatado (ex.: REQ-2026-001).
   - Setor Solicitante (Vendas, Cozinha, Almoxarifado, Manutenção, etc.) e Nome do Solicitante.
   - Nível de Prioridade (Baixa, Média, Alta, Urgente).
   - Botão Mágico inteligente: "Puxar Automaticamente Todos os Itens em Estoque Crítico (< 5)". Ao clicar, analisa a lista de produtos e inclui no pedido todos os itens com estoque baixo sugerindo quantidade para atingir estoque seguro!
   - Tabela dinâmica de itens com cálculo em tempo real do custo estimado da requisição.
2. Visualizador e Impressão de Comprovante de Requisição:
   - Modal com o espelho formal da requisição interna pronto para imprimir ou salvar em PDF, com campos para assinatura de "Solicitante" e "Aprovação do Gerente".
   - Histórico das requisições geradas salvas em \`localStorage\`.`
  }
];
