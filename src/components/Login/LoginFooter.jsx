export default function LoginFooter() {
    return (
        <footer className="py-5 px-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md z-10 relative mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500 dark:text-slate-500 text-[11px] font-medium">
                <p>© {new Date().getFullYear()} Prestek Inc. - Todos os direitos reservados</p>
                <div className="flex gap-4">
                    <a href="#" className="hover:text-[#ff8c00] transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-[#ff8c00] transition-colors">Termos</a>
                </div>
            </div>
        </footer>
    )
}
