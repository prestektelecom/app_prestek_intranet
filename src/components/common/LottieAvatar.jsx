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
        return src && typeof src === 'object' && 'v' in src && 'fr' in src;
    }, [src]);

    useEffect(() => {
        if (isLottie && containerRef.current) {
            // Clean up old animation
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }

            try {
                animRef.current = lottie.loadAnimation({
                    container: containerRef.current,
                    renderer: 'svg',
                    loop: loop,
                    autoplay: true,
                    animationData: JSON.parse(JSON.stringify(src)), // Clone to ensure stability
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

    // Filter out old internal paths that Vite won't resolve directly in dev mode
    const processedSrc = useMemo(() => {
        if (typeof src === 'string' && src.includes('/image/avatar/') && src.endsWith('.png')) {
            return null; // Fallback for broken dev paths
        }
        return src;
    }, [src]);

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
    return (
        <div 
            className={`bg-center bg-no-repeat bg-cover ${className}`}
            style={{ 
                backgroundImage: processedSrc ? `url("${processedSrc}")` : 'none',
                ...style 
            }}
        />
    );
};

export default React.memo(LottieAvatar);
