export default function LoginForm({ 
    email, setEmail, 
    senha, setSenha, 
    erro, carregando, 
    mostrarSenha, setMostrarSenha, 
    lembrar, setLembrar, 
    credValida, handleSubmit 
}) {
    return (
        <div className="p-6 sm:p-8 pt-8 relative z-10">
            <div className="mb-6 text-center">
                <h2 className="text-lg font-bold">Acesso ao Sistema</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Insira suas credenciais</p>
            </div>

            {erro && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-3">
                    <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{erro}</span>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors group-focus-within:text-[#ff8c00]">
                        E-mail ou Usuário
                    </label>
                    <div className="relative flex items-center">
                        <svg className="absolute left-4 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#ff8c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-[#ff8c00]/30 focus:border-[#ff8c00] transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium text-sm"
                            placeholder="Seu usuário IXC"
                            disabled={carregando}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 transition-colors group-focus-within:text-[#ff8c00]">
                        Senha
                    </label>
                    <div className="relative flex items-center">
                        <svg className="absolute left-4 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#ff8c00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-[#ff8c00]/30 focus:border-[#ff8c00] transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium text-sm"
                            placeholder="Sua senha"
                            disabled={carregando}
                        />
                        <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-4 text-slate-400 hover:text-[#ff8c00] transition-colors p-1"
                        >
                            {mostrarSenha ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0l-3.29-3.29" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {!credValida ? (
                    <div className="flex items-center justify-between text-xs py-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none w-4.5 h-4.5 border-2 border-slate-300 dark:border-slate-600 rounded-[5px] checked:bg-[#ff8c00] checked:border-[#ff8c00] transition-colors cursor-pointer"
                                    checked={lembrar}
                                    onChange={(e) => setLembrar(e.target.checked)}
                                />
                                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 font-medium transition-colors">
                                Confiar por 7 dias
                            </span>
                        </label>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-xs py-1 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="font-medium">Acesso salvo por 7 dias</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={carregando}
                    className="relative w-full overflow-hidden bg-gradient-to-r from-[#ff8c00] to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#ff8c00]/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait"
                >
                    {carregando ? (
                        <span className="flex items-center justify-center gap-2 text-sm">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Entrando...
                        </span>
                    ) : (
                        <span className="text-sm tracking-wide uppercase">Entrar</span>
                    )}
                </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80 dark:border-slate-700/80"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-extrabold tracking-widest">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 rounded-full">
                        Suporte
                    </span>
                </div>
            </div>

            <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Problemas ao acessar? 
                    <a href="#" className="inline-flex items-center gap-1 text-[#ff8c00] font-bold hover:text-orange-600 transition-colors ml-1.5 hover:underline underline-offset-4">
                        TI Prestek
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </p>
            </div>
        </div>
    )
}
