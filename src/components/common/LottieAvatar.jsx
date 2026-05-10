import React, { useEffect, useRef, useMemo } from 'react';
import lottie from 'lottie-web';

const LottieAvatar = ({ src, className = '', style = {}, loop = true }) => {
    const containerRef = useRef(null);
    const animRef = useRef(null);

    const lottieData = useMemo(() => {
        if (!src) return null;
        const check = (obj) => obj && typeof obj === 'object' && ('v' in obj || 'fr' in obj);
        if (check(src)) return src;
        if (src?.default && check(src.default)) return src.default;
        if (typeof src === 'string' && src.trim().startsWith('{')) {
            try { const p = JSON.parse(src); return check(p) ? p : null; } catch { return null; }
        }
        return null;
    }, [src]);

    // Lottie animation — sempre no mesmo container div, lottie-web gerencia o SVG interno
    useEffect(() => {
        if (!containerRef.current) return;

        if (animRef.current) {
            animRef.current.destroy();
            animRef.current = null;
        }

        if (!lottieData) return;

        try {
            animRef.current = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop,
                autoplay: true,
                animationData: lottieData,
            });
            // Recorta o viewBox no personagem e usa slice para preencher o círculo sem distorção
            animRef.current.addEventListener('DOMLoaded', () => {
                const svg = containerRef.current?.querySelector('svg');
                if (svg) {
                    // Crop centrado no personagem (descarta ~25% de cada lado e 15% do topo/base)
                    svg.setAttribute('viewBox', '300 100 400 400');
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                }
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
    }, [lottieData, loop]);

    // Sempre renderiza o mesmo div — lottie-web gerencia os filhos SVG diretamente
    // Nunca colocar filhos React dentro deste div pois causaria conflito de DOM
    if (lottieData) {
        return (
            <div className={`overflow-hidden ${className}`} style={style}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }

    // URL de imagem (base64 ou http)
    const isImageUrl = src && typeof src === 'string' && (src.startsWith('data:') || src.startsWith('http') || (src.startsWith('/') && !src.startsWith('/src/')));
    if (isImageUrl) {
        return (
            <div
                className={`bg-center bg-no-repeat bg-cover ${className}`}
                style={{ backgroundImage: `url("${src}")`, ...style }}
            />
        );
    }

    // Placeholder
    return (
        <div
            className={`flex items-center justify-center bg-surface-raised ${className}`}
            style={style}
        />
    );
};

export default React.memo(LottieAvatar);
