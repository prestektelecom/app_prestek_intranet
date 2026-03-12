import { useRef } from 'react'
import { useLogin } from '../hooks/useLogin'
import ParticlesBackground from './ParticlesBackground'
import MagneticSandCard from './MagneticSandCard'
import LoginHeader from './Login/LoginHeader'
import LoginForm from './Login/LoginForm'
import LoginFooter from './Login/LoginFooter'

export default function Login({ onLogin }) {
    const cardRef = useRef(null)
    const loginProps = useLogin(onLogin)

    return (
        <div className="min-h-screen flex flex-col font-display bg-[#f8f7f5] dark:bg-[#231a0f] text-slate-900 dark:text-slate-100 transition-colors duration-300">
            <main className="flex-grow flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                {/* Interactive Particle Network Background */}
                <ParticlesBackground />

                {/* Animated Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff8c00]/10 dark:bg-[#ff8c00]/5 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="w-full max-w-[400px] z-10 relative">
                    {/* Header: Logo & Title */}
                    <LoginHeader />

                    {/* Login Card */}
                    <div ref={cardRef} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl overflow-hidden border border-white/50 dark:border-slate-700/50 relative">
                        {/* Magnetic Sand Effect Area */}
                        <MagneticSandCard cardRef={cardRef} />

                        {/* Form: Inputs & Actions */}
                        <LoginForm {...loginProps} />
                    </div>
                </div>
            </main>

            {/* Footer: Rights & Links */}
            <LoginFooter />
        </div>
    )
}
