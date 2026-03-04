// Header: barra superior com logo, busca, notificações e perfil do usuário
export default function Header() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#eaddcd] bg-white px-6 py-3 shrink-0 h-16 z-20 shadow-sm">
            {/* Logo + Busca */}
            <div className="flex items-center gap-8">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[20px]">grid_view</span>
                    </div>
                    <h2 className="text-[#1d150c] text-xl font-bold leading-tight tracking-tight">
                        Prestek Intranet
                    </h2>
                </div>

                {/* Campo de busca (visível em md+) */}
                <label className="hidden md:flex flex-col min-w-40 w-96 h-10">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#f4eee6] focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="text-[#a17745] flex items-center justify-center pl-4 rounded-l-lg">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none bg-transparent text-[#1d150c] focus:outline-0 focus:ring-0 h-full placeholder:text-[#a17745] px-3 text-sm font-normal leading-normal"
                            placeholder="Buscar por serviços, pessoas ou documentos..."
                        />
                    </div>
                </label>
            </div>

            {/* Ações + Perfil */}
            <div className="flex items-center gap-4">
                {/* Notificações */}
                <button className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-[#f4eee6] text-[#1d150c] transition-colors relative">
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border border-white"></span>
                </button>

                {/* Configurações */}
                <button className="flex items-center justify-center size-10 rounded-full bg-white hover:bg-[#f4eee6] text-[#1d150c] transition-colors">
                    <span className="material-symbols-outlined text-[24px]">settings</span>
                </button>

                <div className="h-8 w-px bg-[#eaddcd] mx-1"></div>

                {/* Avatar + Nome */}
                <div className="flex items-center gap-3 cursor-pointer group">
                    <div
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-transparent group-hover:border-primary transition-all"
                        style={{
                            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzNpKtesQXtpcYif9ejbbMoZTuuRQGeIXa6m9sfm4J9LKnRIOTD8EBvlEOWFaUx-bXnxSunYjvJgSfs_5y0O7OFYf-e2DXSTBdO9Z9tnSErexUMgREwAScP_3KkTTqWj_FscXKucqmtwla4CUanVTBdz2myIkW2A8YOEBzv7z2WMc-YhFQT7h4amBXMMjREIk28yX2iWzX8a8npYrgt6uJM15Bj5yaEjw2wDoZTNqFBXpRQiiSWATeUxSzclzkzJ3Jt5Zmotuq7Ts")`,
                        }}
                    ></div>
                    <div className="hidden lg:block">
                        <p className="text-sm font-bold leading-none">Alex Morgan</p>
                        <p className="text-xs text-gray-500 mt-1">Líder Comercial</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
