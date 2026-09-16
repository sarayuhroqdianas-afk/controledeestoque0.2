import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Layers, 
  Code2, 
  CheckCircle2, 
  Zap,
  HelpCircle
} from 'lucide-react';
import { AI_STUDIO_PROMPTS } from '../data/initialData';
import { AIStudioPrompt } from '../types';
import { copyToClipboard } from '../utils/printHelpers';
import { Download, FileCode, CheckCircle } from 'lucide-react';

interface PromptsViewProps {
  onShowToast?: (text: string) => void;
}

export const PromptsView: React.FC<PromptsViewProps> = ({ onShowToast }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<AIStudioPrompt>(AI_STUDIO_PROMPTS[0]);
  const [showRawModal, setShowRawModal] = useState(false);

  const handleCopy = async (prompt: AIStudioPrompt) => {
    const success = await copyToClipboard(prompt.promptText);
    setCopiedId(prompt.id);
    if (onShowToast) {
      onShowToast(`Prompt do Passo ${prompt.step} copiado com sucesso!`);
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const handleCopyAll = async () => {
    const fullBundle = AI_STUDIO_PROMPTS.map(p => 
      `// ==========================================\n// PASSO ${p.step}: ${p.title}\n// Componente Alvo: ${p.componentTarget}\n// ==========================================\n\n${p.promptText}\n`
    ).join('\n\n');

    const success = await copyToClipboard(fullBundle);
    setCopiedId('ALL');
    if (onShowToast) {
      onShowToast('Todos os 5 Prompts copiados para a área de transferência!');
    }
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  const handleDownloadPrompts = () => {
    const fullBundle = `# ROTEIRO COMPLETO DE PROMPTS - ESTOQUE CERTO (GOOGLE AI STUDIO / GEMINI)
# Data de Exportação: ${new Date().toLocaleDateString('pt-BR')}
# Modelo Recomendado: Gemini 2.0 Flash ou Gemini 1.5 Pro
# Temperatura Recomendada: 0.2 a 0.4

` + AI_STUDIO_PROMPTS.map(p => 
      `## PASSO ${p.step}: ${p.title}\n### Componente Alvo: ${p.componentTarget}\n### Descrição: ${p.description}\n\n\`\`\`text\n${p.promptText}\n\`\`\`\n`
    ).join('\n---\n\n');

    const blob = new Blob([fullBundle], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `estoque_certo_prompts_ai_studio_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);

    if (onShowToast) {
      onShowToast('Arquivo de prompts baixado com sucesso!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Prompts Estruturados para o Google AI Studio (Gemini)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Gerador Modular do "Estoque Certo"
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 max-w-2xl leading-relaxed">
              Aqui está a sequência pronta de prompts otimizados para o modelo Gemini. Você pode copiá-los passo a passo para construir a aplicação modularmente no Google AI Studio.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 shrink-0">
            <button
              id="btn-copiar-todos-prompts"
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 rounded-xl shadow-md transition-all active:scale-98"
            >
              {copiedId === 'ALL' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-extrabold">Todos Copiados!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-purple-800" />
                  <span>Copiar Todos os Prompts</span>
                </>
              )}
            </button>

            <button
              id="btn-baixar-prompts"
              onClick={handleDownloadPrompts}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-purple-100 bg-purple-800/80 hover:bg-purple-700/90 border border-purple-600/50 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Baixar Roteiro (.md)</span>
            </button>
          </div>
        </div>

        {/* AI Studio Best Practices Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-purple-700/60 text-xs text-purple-200">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <span><strong>Modelo Sugerido:</strong> Gemini 2.0 Flash ou Gemini 1.5 Pro no Google AI Studio.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <span><strong>Temperatura:</strong> Ajuste entre 0.2 e 0.4 para garantir aderência ao código e validações estritas.</span>
          </div>
          <div className="flex items-start gap-2">
            <Code2 className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
            <span><strong>Execução Sequencial:</strong> Execute do Passo 1 ao 5 na mesma sessão ou thread de conversa.</span>
          </div>
        </div>
      </div>

      {/* Prompts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Step Navigator */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block px-1">
            Roteiro Sequencial de Prompts
          </span>

          <div className="space-y-2">
            {AI_STUDIO_PROMPTS.map((prompt) => {
              const isSelected = selectedPrompt.id === prompt.id;
              return (
                <button
                  key={prompt.id}
                  onClick={() => setSelectedPrompt(prompt)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {prompt.step}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-purple-900' : 'text-slate-900'}`}>
                      Passo {prompt.step}: {prompt.componentTarget}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {prompt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Prompt Viewer */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          {/* Prompt Header */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase">
                  Passo {selectedPrompt.step} de 5
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedPrompt.componentTarget}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedPrompt.title}
              </h3>
            </div>

            <button
              onClick={() => handleCopy(selectedPrompt)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-xs transition-all shrink-0"
            >
              {copiedId === selectedPrompt.id ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Este Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Tags */}
          <div className="px-5 py-2.5 bg-slate-50/30 border-b border-slate-100 flex flex-wrap gap-1.5 text-[11px]">
            <span className="text-slate-400 font-medium mr-1">Tópicos:</span>
            {selectedPrompt.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                #{t}
              </span>
            ))}
          </div>

          {/* Prompt Content Box */}
          <div className="p-5 flex-1 bg-slate-900 text-slate-100 overflow-x-auto">
            <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-200 selection:bg-purple-500 selection:text-white">
              {selectedPrompt.promptText}
            </pre>
          </div>

          {/* Usage tip footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Cole diretamente no chat do Google AI Studio com o modelo Gemini selecionado.</span>
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowRawModal(true)}
                className="text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                title="Abrir caixa de texto para seleção manual"
              >
                Caixa de Seleção
              </button>
              <button
                onClick={() => handleCopy(selectedPrompt)}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold rounded-lg transition-colors"
              >
                {copiedId === selectedPrompt.id ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Selection Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Passo {selectedPrompt.step}: Texto do Prompt (Selecionável)
                </h3>
              </div>
              <button
                onClick={() => setShowRawModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-hidden flex flex-col gap-2">
              <p className="text-xs text-slate-500">
                Caso sua política de navegador restrinja a área de transferência automática, você pode selecionar todo o texto abaixo (Ctrl+A / Cmd+A) e copiar manualmente (Ctrl+C / Cmd+C):
              </p>
              <textarea
                readOnly
                value={selectedPrompt.promptText}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                className="w-full flex-1 min-h-[250px] p-3 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Clique na caixa acima para selecionar tudo</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedPrompt)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {copiedId === selectedPrompt.id ? 'Copiado!' : 'Copiar para Clipboard'}
                </button>
                <button
                  onClick={() => setShowRawModal(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
