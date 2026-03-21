import React, { useEffect, useRef, useMemo, useState } from 'react';
import lottie from 'lottie-web';

/**
 * LottieAvatar Component
 * @param {any} src - Fonte do avatar: objeto JSON (Lottie), string URL ou base64
 * @param {string} className - Classes CSS adicionais
 * @param {Object} style - Estilos inline
 * @param {boolean} loop - Se a animação deve repetir (padrão: true)
 */
const LottieAvatar = ({ src, className = '', style = {}, loop = true }) => {
    const containerRef = useRef(null);
    const animRef = useRef(null);

    // null = verificando | true = válida | false = inválida
    const [imgStatus, setImgStatus] = useState(null);

    // Verifica se src é um objeto Lottie JSON
    const isLottie = useMemo(() => {
        if (!src) return false;

        const check = (obj) => {
            if (!obj || typeof obj !== 'object') return false;
            return !!( ('v' in obj || obj.v) && ('fr' in obj || obj.fr) );
        };

        if (check(src)) return true;
        if (src.default && check(src.default)) return true;

        if (typeof src === 'string' && src.trim().startsWith('{')) {
            try { return check(JSON.parse(src)); }
            catch (e) { return false; }
        }

        return false;
    }, [src]);

    // Pré-valida URL de imagem usando Image() nativo (sem renderizar tag <img>)
    useEffect(() => {
        // Se for Lottie ou sem src, não precisa verificar imagem
        if (isLottie || !src || typeof src !== 'string' || src.length === 0) {
            setImgStatus(null);
            return;
        }

        // Base64 é sempre válido — não precisa de network request
        if (src.startsWith('data:')) {
            setImgStatus(true);
            return;
        }

        setImgStatus(null); // Resetando estado enquanto verifica
        const img = new Image();
        img.onload = () => setImgStatus(true);
        img.onerror = () => setImgStatus(false);
        img.src = src;

        return () => {
            // Cancela verificação se src mudar antes de completar
            img.onload = null;
            img.onerror = null;
        };
    }, [src, isLottie]);

    // Inicializa/atualiza animação Lottie
    useEffect(() => {
        if (!isLottie || !containerRef.current) return;

        if (animRef.current) {
            animRef.current.destroy();
            animRef.current = null;
        }

        try {
            let animData = typeof src === 'string' && src.trim().startsWith('{')
                ? JSON.parse(src)
                : src;

            if (animData?.default && (animData.default.v || 'v' in animData.default)) {
                animData = animData.default;
            }

            animRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop,
                autoplay: true,
                animationData: animData,
            });
        } catch (err) {
            console.error('Lottie error:', err);
        }

        return () => {
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
        };
    }, [isLottie, src, loop]);

    // Renderização: animação Lottie
    if (isLottie) {
        return (
            <div
                ref={containerRef}
                className={`overflow-hidden flex items-center justify-center ${className}`}
                style={style}
            />
        );
    }

    // Renderização: imagem validada com sucesso
    if (imgStatus === true) {
        return (
            <div
                className={`bg-center bg-no-repeat bg-cover ${className}`}
                style={{ backgroundImage: `url("${src}")`, ...style }}
            />
        );
    }

    // Placeholder visual: sem src válido, imagem inválida ou ainda carregando
    return (
        <div
            className={`flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/20 ${className}`}
            style={style}
        >
            <span
                className="material-symbols-outlined text-orange-400 dark:text-orange-300"
                style={{ fontSize: '48px' }}
            >
                person
            </span>
        </div>
    );
};

export default React.memo(LottieAvatar);
