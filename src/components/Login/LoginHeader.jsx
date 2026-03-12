import logoPrestek from '../../image/logos/Logo.webp'

export default function LoginHeader() {
    return (
        <div className="flex flex-col items-center mb-6">
            <div className="mb-4 relative group cursor-default hover:scale-105 transition-transform duration-300 flex justify-center w-full">
                <img src={logoPrestek} alt="Prestek Telecom" className="w-48 sm:w-56 h-auto mx-auto block drop-shadow-md" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Portal Interno</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Bem-vindo à Prestek Inc.</p>
        </div>
    )
}
