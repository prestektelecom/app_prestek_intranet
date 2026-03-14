import React from 'react';

const NotFound = ({ setCurrentView }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-background-dark transition-colors duration-200 font-display">
            <div className="w-full max-w-4xl text-center">
                {/* 404 Header with Animated Background */}
                <div 
                    className="h-[400px] bg-center bg-no-repeat flex items-center justify-center mb-[-50px]"
                    style={{ 
                        backgroundImage: 'url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)',
                        backgroundSize: 'contain'
                    }}
                >
                    <h1 className="text-7xl md:text-8xl font-black text-[#1d150c] dark:text-[#f8f7f5] opacity-90 tracking-tighter">
                        404
                    </h1>
                </div>

                {/* Content Box */}
                <div className="space-y-6 relative z-10">
                    <h3 className="text-3xl md:text-5xl font-bold text-[#1d150c] dark:text-[#f8f7f5] leading-tight">
                        Hur dur! <br /> 
                        <span className="text-primary">Eita...</span> Esse lugar é antigo demais ou não existe mais.
                    </h3>
                    
                    <p className="text-lg md:text-xl text-[#1d150c] dark:text-[#f8f7f5] opacity-70 max-w-2xl mx-auto">
                        Talvez seja melhor você sair daqui e voltar para um local conhecido.
                    </p>
                    
                    <div className="pt-8">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className="inline-block px-10 py-4 bg-primary hover:bg-opacity-90 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-primary/30 text-lg uppercase tracking-wide"
                        >
                            Ok, quero ir
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Subtle Divider like the reference */}
            <div className="w-full max-w-4xl mt-16">
                <hr className="border-gray-100 dark:border-gray-800" />
            </div>

            {/* Custom Aesthetic Anchor: Grainy texture overlay for "Retro" feel */}
            <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-multiply dark:mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
    );
};

export default NotFound;
