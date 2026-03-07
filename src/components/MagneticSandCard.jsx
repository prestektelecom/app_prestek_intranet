import { useEffect, useRef } from 'react';

const MagneticSandCard = ({ cardRef }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const container = cardRef?.current;
        if (!container) return;

        let W, H, particles = [], animId;
        let mouse = { x: -9999, y: -9999, vx: 0, vy: 0, px: -9999, py: -9999 };
        let attractMode = false;

        const PARTICLE_COUNT = () => Math.min(Math.floor((W * H) / 600), 3000);
        const RADIUS = 60;
        const ATTRACT_RADIUS = 100;

        class Particle {
            constructor() { this.init(); }

            init() {
                this.ox = Math.random() * W;
                this.oy = Math.random() * H;
                this.x = this.ox;
                this.y = this.oy;
                this.vx = 0;
                this.vy = 0;
                this.size = Math.random() * 1.0 + 0.2;
                this.baseSize = this.size;

                this.hue = 30; // Tom alaranjado/bege para combinar com logo Stitch
                const r = Math.random();
                if (r < 0.3) {
                    this.sat = 60; this.lum = 30 + Math.random() * 10;
                } else if (r < 0.6) {
                    this.sat = 80; this.lum = 45 + Math.random() * 20;
                } else {
                    this.sat = 100; this.lum = 60 + Math.random() * 20;
                }
                this.alpha = 0.3 + Math.random() * 0.5;
                this.mass = this.size * (0.8 + Math.random() * 0.4);
                this.friction = 0.88 + Math.random() * 0.08;
                this.noise = Math.random() * Math.PI * 2;
                this.noiseSpeed = (Math.random() - 0.5) * 0.02;
            }

            update(t) {
                if (mouse.x === -9999) {
                    const springX = (this.ox - this.x) * 0.02;
                    const springY = (this.oy - this.y) * 0.02;
                    this.vx += springX;
                    this.vy += springY;
                } else {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    this.noise += this.noiseSpeed;
                    const breathe = Math.sin(t * 0.001 + this.noise) * 0.15;

                    if (attractMode) {
                        const r = ATTRACT_RADIUS;
                        if (dist < r) {
                            const force = (1 - dist / r) * 12 / this.mass;
                            this.vx += (dx / dist) * force;
                            this.vy += (dy / dist) * force;
                            this.size = this.baseSize * (1 + (1 - dist / r) * 1.5);
                        } else {
                            this.size = this.baseSize;
                        }
                    } else {
                        const r = RADIUS;
                        if (dist < r) {
                            const force = (1 - dist / r) * 10 / this.mass;
                            this.vx -= (dx / dist) * force;
                            this.vy -= (dy / dist) * force;
                            this.vx += mouse.vx * 0.08;
                            this.vy += mouse.vy * 0.08;
                            this.size = this.baseSize * (1 + (1 - dist / r) * 0.8);
                        } else {
                            this.size = this.baseSize;
                        }
                    }

                    const springX = (this.ox - this.x) * 0.035;
                    const springY = (this.oy - this.y) * 0.035;
                    this.vx += springX + Math.sin(this.noise) * breathe;
                    this.vy += springY + Math.cos(this.noise) * breathe;
                }

                this.vx *= this.friction;
                this.vy *= this.friction;
                this.x += this.vx;
                this.y += this.vy;
            }

            draw() {
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const brightBoost = Math.min(speed * 4, 20);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${Math.max(this.lum - brightBoost, 0)}%, ${this.alpha})`;
                ctx.fill();
            }
        }

        function buildParticles() {
            const count = PARTICLE_COUNT();
            particles = [];
            for (let i = 0; i < count; i++) particles.push(new Particle());
        }

        const resize = () => {
            const rect = container.getBoundingClientRect();
            W = ctx.canvas.width = rect.width;
            H = ctx.canvas.height = rect.height;
            buildParticles();
        };

        let t = 0;
        const loop = () => {
            animId = requestAnimationFrame(loop);
            t++;

            ctx.clearRect(0, 0, W, H);

            mouse.vx = mouse.x - mouse.px;
            mouse.vy = mouse.y - mouse.py;
            mouse.px = mouse.x;
            mouse.py = mouse.y;

            for (const p of particles) {
                p.update(t);
                p.draw();
            }

            if (mouse.x > 0) {
                const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, attractMode ? 80 : 50);
                grad.addColorStop(0, attractMode ? 'rgba(255,140,0,0.15)' : 'rgba(255,140,0,0.05)');
                grad.addColorStop(1, 'rgba(255,140,0,0)');
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, attractMode ? 80 : 50, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        };

        setTimeout(resize, 100);
        loop();

        const getMousePos = (e) => {
            const rect = container.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top,
            };
        };

        const handleMouseMove = (e) => {
            const pos = getMousePos(e);
            mouse.px = mouse.x;
            mouse.py = mouse.y;
            mouse.x = pos.x;
            mouse.y = pos.y;
        };

        const handleMouseDown = (e) => {
            if (e.button === 0 || e.touches) {
                attractMode = true;
            }
        };

        const handleMouseUp = () => {
            attractMode = false;
        };

        const handleMouseLeave = () => {
            mouse.x = -9999;
            mouse.y = -9999;
            attractMode = false;
        };

        const ro = new ResizeObserver(() => resize());
        ro.observe(container);

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseLeave);

        container.addEventListener('touchmove', handleMouseMove, { passive: false });
        container.addEventListener('touchstart', handleMouseDown);
        window.addEventListener('touchend', handleMouseUp);

        return () => {
            cancelAnimationFrame(animId);
            ro.disconnect();
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mousedown', handleMouseDown);
                container.removeEventListener('mouseleave', handleMouseLeave);
                container.removeEventListener('touchmove', handleMouseMove);
                container.removeEventListener('touchstart', handleMouseDown);
            }
        };

    }, [cardRef]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-60 mix-blend-multiply dark:opacity-90 dark:mix-blend-screen"
        />
    );
};

export default MagneticSandCard;
