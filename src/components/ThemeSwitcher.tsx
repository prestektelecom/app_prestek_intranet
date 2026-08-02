import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSwitcher() {
    const { theme, setTheme, darkVariant, setDarkVariant } = useTheme();

    return (
        <div>
            <h4 className="text-sm font-bold text-[#0B1B2E] dark:text-white mb-4">Aparência</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="cursor-pointer group">
                    <input
                        className="peer sr-only"
                        name="theme"
                        type="radio"
                        checked={theme === 'light'}
                        onChange={() => setTheme('light')}
                    />
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#EC7D23] peer-checked:ring-2 peer-checked:ring-[#EC7D23] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
                        <div className="h-20 rounded bg-[#F5F9FF] border border-[#E4ECF5] flex flex-col overflow-hidden">
                            <div className="h-4 w-full bg-white dark:bg-[#0F1724] border-b border-[#E4ECF5] dark:border-[#1E3A5F]"></div>
                            <div className="flex-1 p-2 flex gap-1">
                                <div className="w-1/4 h-full bg-[#F7FAFD] dark:bg-[#162231] rounded-sm"></div>
                                <div className="flex-1 h-full bg-[#EFF4FA] dark:bg-[#0B1B2E] rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-center text-[#0B1B2E] dark:text-white">Claro</span>
                    </div>
                </label>

                <label className="cursor-pointer group">
                    <input
                        className="peer sr-only"
                        name="theme"
                        type="radio"
                        checked={theme === 'dark'}
                        onChange={() => setTheme('dark')}
                    />
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#EC7D23] peer-checked:ring-2 peer-checked:ring-[#EC7D23] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
                        <div className="h-20 rounded bg-[#0B1B2E] border border-[#1E3A5F] flex flex-col overflow-hidden">
                            <div className="h-4 w-full bg-[#0F1724] border-b border-[#1E3A5F]"></div>
                            <div className="flex-1 p-2 flex gap-1">
                                <div className="w-1/4 h-full bg-[#162231] rounded-sm"></div>
                                <div className="flex-1 h-full bg-[#0B1B2E] rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-center text-[#0B1B2E] dark:text-white">Escuro</span>
                    </div>
                </label>

                <label className="cursor-pointer group">
                    <input
                        className="peer sr-only"
                        name="theme"
                        type="radio"
                        checked={theme === 'system'}
                        onChange={() => setTheme('system')}
                    />
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#EC7D23] peer-checked:ring-2 peer-checked:ring-[#EC7D23] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
                        <div className="h-20 rounded bg-gradient-to-br from-[#F5F9FF] to-[#0B1B2E] border border-[#E4ECF5] flex items-center justify-center dark:border-[#1E3A5F]">
                            <span className="material-symbols-outlined text-[#8896A8]">settings_brightness</span>
                        </div>
                        <span className="text-sm font-medium text-center text-[#0B1B2E] dark:text-white">Sistema</span>
                    </div>
                </label>
            </div>

            {/* Dark theme variant switcher */}
            {(theme === 'dark' || theme === 'system') && (
                <div className="mt-6 border-t border-[#E4ECF5] dark:border-gray-800 pt-5 animate-in fade-in duration-200">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Estilo do Tema Escuro</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setDarkVariant('cyber')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                darkVariant === 'cyber'
                                    ? 'border-[#F97316] bg-slate-900/30 dark:bg-orange-950/20 ring-2 ring-[#F97316]/30 text-[#F97316] font-semibold'
                                    : 'border-[#E4ECF5] dark:border-gray-800 bg-[#F7FAFD] dark:bg-[#162231]/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="text-xs">Cyber-Obsidian</span>
                            <div className="flex gap-1.5 mt-1 justify-center">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#070B13] border border-[#1E2E4A]" title="Fundo" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#F97316]" title="Destaque" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00F5D4]" title="Sucesso" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setDarkVariant('aurora')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                darkVariant === 'aurora'
                                    ? 'border-[#8A2BE2] bg-slate-900/30 dark:bg-purple-950/20 ring-2 ring-[#8A2BE2]/30 text-[#8A2BE2] dark:text-[#A04DF0] font-semibold'
                                    : 'border-[#E4ECF5] dark:border-gray-800 bg-[#F7FAFD] dark:bg-[#162231]/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="text-xs">Space Aurora</span>
                            <div className="flex gap-1.5 mt-1 justify-center">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#0F0C20] border border-[#2E2254]" title="Fundo" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#FB923C]" title="Destaque" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00FF87]" title="Sucesso" />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setDarkVariant('amoled')}
                            className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                                darkVariant === 'amoled'
                                    ? 'border-gray-400 dark:border-white bg-[#0A0A0A] ring-2 ring-gray-400/30 dark:ring-white/20 text-slate-900 dark:text-white font-semibold'
                                    : 'border-[#E4ECF5] dark:border-gray-800 bg-[#F7FAFD] dark:bg-[#162231]/30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            <span className="text-xs">AMOLED Pure</span>
                            <div className="flex gap-1.5 mt-1 justify-center">
                                <span className="w-3.5 h-3.5 rounded-full bg-black border border-[#222222]" title="Fundo" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#F97316]" title="Destaque" />
                                <span className="w-3.5 h-3.5 rounded-full bg-[#00C853]" title="Sucesso" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
