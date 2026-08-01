import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, Check, ShieldCheck, Zap, Clock, CreditCard, BarChart2 } from 'lucide-react';
import { isTopSeller as calcTopSeller } from '../../utils/planTaxonomy';

export default function ServiceDetailModal({ isOpen, onClose, data, type, formatCurrency, onToggleCompare, isComparing, isAdmin, onEditClick, maxVendas = 0 }) {
  if (!isOpen || !data) return null;

  const isPlan = type === 'plan';
  const isTech = type === 'tech';
  const isStreaming = type === 'streaming';

  const vendas = data.vendas_mes || 0;
  const isTopSeller = calcTopSeller(vendas, maxVendas);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-[#0B1B2E] border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          {/* Header Banner */}
          <div className="relative p-6 bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                {isPlan ? (isTopSeller ? '★ MAIS VENDIDO' : 'PLANO DE INTERNET') : isTech ? 'SERVIÇO TÉCNICO' : 'STREAMING & MÍDIA'}
              </span>
              {data.id && (
                <span className="text-xs font-mono opacity-80">
                  ID: #{data.id}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black leading-tight">
              {data.descricao || data.service || 'Detalhes do Serviço'}
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Pricing Section */}
            <div className="flex items-baseline justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Valor / Mensalidade
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#1F5BA8] dark:text-[#7FD4E8]">
                    {isPlan ? formatCurrency(data.valor_mensal) : (data.value || 'R$ 0,00')}
                  </span>
                  {isPlan && <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/mês</span>}
                </div>
              </div>

              {isPlan && onToggleCompare && (
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isComparing}
                    onChange={() => onToggleCompare(data.id)}
                    className="w-4 h-4 text-[#4A9EF5] rounded border-slate-300 focus:ring-[#4A9EF5]"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Comparar</span>
                </label>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-xs mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#4A9EF5]" />
                  <span>Prazo de Entrega</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {data.prazo_instalacao || data.deadline || 'A consultar'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-semibold text-xs mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-[#4A9EF5]" />
                  <span>Taxa / Pagamento</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                  {isPlan ? (data.taxa_instalacao ? formatCurrency(data.taxa_instalacao) : 'Isento (R$ 0)') : (data.payment || 'À vista / Boleto')}
                </span>
              </div>
            </div>

            {/* Performance Stats (If available) */}
            {typeof data.vendas_mes !== 'undefined' && (
              <div className="p-4 rounded-xl bg-[#EAF4FF] dark:bg-slate-900/80 border border-[#4A9EF5]/20">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-[#4A9EF5]" />
                    Vendas no Mês Vigente
                  </span>
                  <span className="text-sm font-black text-[#1F5BA8] dark:text-[#7FD4E8]">{vendas} contratações</span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Solicitação registrada para: ${data.descricao || data.service}`);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#1F5BA8] to-[#4A9EF5] text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Solicitar Serviço</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {isAdmin && onEditClick && (
                <button
                  onClick={() => {
                    onClose();
                    onEditClick(data);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Editar
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
