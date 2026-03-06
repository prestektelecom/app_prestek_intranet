import React from 'react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    return (
        <div>
            <h4 className="text-sm font-bold text-[#1d150c] dark:text-white mb-4">Aparência</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="cursor-pointer group">
                    <input
                        className="peer sr-only"
                        name="theme"
                        type="radio"
                        checked={theme === 'light'}
                        onChange={() => setTheme('light')}
                    />
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#eaddcd] dark:border-gray-800 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary bg-[#fcfaf8] dark:bg-[#2c2217] transition-all dark:bg-neutral-bg3 dark:border-border-subtle">
                        <div className="h-20 rounded bg-[#f8f7f5] border border-gray-200 flex flex-col overflow-hidden">
                            <div className="h-4 w-full bg-white dark:bg-[#1a130b] border-b border-gray-100"></div>
                            <div className="flex-1 p-2 flex gap-1">
                                <div className="w-1/4 h-full bg-gray-100 rounded-sm"></div>
                                <div className="flex-1 h-full bg-gray-50 rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-center text-[#1d150c] dark:text-text-primary">Claro</span>
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
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#eaddcd] dark:border-gray-800 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary bg-[#fcfaf8] dark:bg-[#2c2217] transition-all dark:bg-neutral-bg3 dark:border-border-subtle">
                        <div className="h-20 rounded bg-[#231a0f] border border-gray-700 flex flex-col overflow-hidden">
                            <div className="h-4 w-full bg-[#2d2418] border-b border-gray-700"></div>
                            <div className="flex-1 p-2 flex gap-1">
                                <div className="w-1/4 h-full bg-[#382e21] rounded-sm"></div>
                                <div className="flex-1 h-full bg-[#2d2418] rounded-sm"></div>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-center text-[#1d150c] dark:text-text-primary">Escuro</span>
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
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-[#eaddcd] dark:border-gray-800 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary bg-[#fcfaf8] dark:bg-[#2c2217] transition-all dark:bg-neutral-bg3 dark:border-border-subtle">
                        <div className="h-20 rounded bg-gradient-to-br from-[#f8f7f5] to-[#231a0f] border border-gray-300 flex items-center justify-center dark:border-gray-600">
                            <span className="material-symbols-outlined text-gray-500">settings_brightness</span>
                        </div>
                        <span className="text-sm font-medium text-center text-[#1d150c] dark:text-text-primary">Sistema</span>
                    </div>
                </label>
            </div>
        </div>
    );
}
