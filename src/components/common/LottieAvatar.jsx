import React, { useEffect, useRef, useMemo } from 'react';
import lottie from 'lottie-web';

/**
 * LottieAvatar Component
 * @param {Object} props
 * @param {any} props.src - The source of the avatar (JSON object for Lottie or string for Image)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {boolean} props.loop - Whether the animation should loop (default: true)
 */
const LottieAvatar = ({ src, className = '', style = {}, loop = true }) => {
    const containerRef = useRef(null);
    const animRef = useRef(null);

    // Check if src is a Lottie JSON object (v, fr, ip, op, w, h are common lottie properties)
    const isLottie = useMemo(() => {
        if (!src) return false;
        
        // Helper to check if an object looks like Lottie
        const check = (obj) => {
            if (!obj || typeof obj !== 'object') return false;
            // Lottie files must have 'v' (version), 'fr' (frame rate) and 'layers'
            const hasLottieProps = ('v' in obj || obj.v) && ('fr' in obj || obj.fr);
            return !!hasLottieProps;
        };

        if (check(src)) return true;
        if (src.default && check(src.default)) return true; // Handle potential wrapped imports
        
        // Try parsing if it's a string that looks like JSON
        if (typeof src === 'string' && src.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(src);
                return check(parsed);
            } catch (e) {
                return false;
            }
        }
        
        return false;
    }, [src]);

    useEffect(() => {
        if (isLottie && containerRef.current) {
            // Clean up old animation
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }

            try {
                // Se for string JSON (de um fetch por exemplo)
                let animData = typeof src === 'string' && src.trim().startsWith('{') 
                    ? JSON.parse(src) 
                    : src;

                // Se vier do Vite como módulo (tem .default ou exports diretos)
                if (animData && typeof animData === 'object') {
                    if (animData.default && (animData.default.v || 'v' in animData.default)) {
                        animData = animData.default;
                    }
                }
                
                animRef.current = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop: loop,
                    autoplay: true,
                    animationData: animData, // Removido o clone que quebrava objetos de módulo
                });
            } catch (err) {
                console.error("Lottie error:", err);
            }

            return () => {
                if (animRef.current) {
                    animRef.current.destroy();
                    animRef.current = null;
                }
            };
        }
    }, [isLottie, src, loop]);

    if (isLottie) {
        return (
            <div 
                ref={containerRef} 
                className={`overflow-hidden flex items-center justify-center ${className}`} 
                style={style}
            />
        );
    }

    // Fallback to regular image
    const isString = typeof src === 'string' && src.length > 0;
    const backgroundStyle = isString ? { backgroundImage: `url("${src}")` } : {};

    return (
        <div 
            className={`bg-center bg-no-repeat bg-cover ${className}`}
            style={{ 
                ...backgroundStyle,
                ...style 
            }}
        />
    );
};

export default React.memo(LottieAvatar);
