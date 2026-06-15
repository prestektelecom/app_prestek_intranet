import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

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
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#4A9EF5] peer-checked:ring-2 peer-checked:ring-[#4A9EF5] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
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
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#4A9EF5] peer-checked:ring-2 peer-checked:ring-[#4A9EF5] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
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
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#E4ECF5] dark:border-gray-800 peer-checked:border-[#4A9EF5] peer-checked:ring-2 peer-checked:ring-[#4A9EF5] bg-[#F7FAFD] dark:bg-[#0B1B2E] transition-all">
                        <div className="h-20 rounded bg-gradient-to-br from-[#F5F9FF] to-[#0B1B2E] border border-[#E4ECF5] flex items-center justify-center dark:border-[#1E3A5F]">
                            <span className="material-symbols-outlined text-[#8896A8]">settings_brightness</span>
                        </div>
                        <span className="text-sm font-medium text-center text-[#0B1B2E] dark:text-white">Sistema</span>
                    </div>
                </label>
            </div>
        </div>
    );
}
