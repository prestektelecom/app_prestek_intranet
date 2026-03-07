import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize handler
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Mouse interaction
        let mouse = { x: null, y: null, radius: 180 };
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        // Particles
        const particlesArray = [];
        const numParticles = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 9000));

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 1.0;
                this.vy = (Math.random() - 0.5) * 1.0;
                this.radius = Math.random() * 2 + 0.5;
                this.baseColor = 'rgba(255, 140, 0, 0.4)'; // cor primária
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Mouse repel/attract magic
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        // Partículas "fogem" sutilmente do cursor
                        this.x -= forceDirectionX * force * 1.5;
                        this.y -= forceDirectionY * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.baseColor;
                ctx.fill();
            }
        }

        for (let i = 0; i < numParticles; i++) {
            particlesArray.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();

                // Conectando as partículas entre si
                for (let j = i; j < particlesArray.length; j++) {
                    const dx = particlesArray[i].x - particlesArray[j].x;
                    const dy = particlesArray[i].y - particlesArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 140, 0, ${0.2 * (1 - distance / 130)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                        ctx.stroke();
                    }
                }

                // Conectando partículas ao mouse (efeito teia)
                if (mouse.x != null && mouse.y != null) {
                    const dmX = particlesArray[i].x - mouse.x;
                    const dmY = particlesArray[i].y - mouse.y;
                    const distanceMouse = Math.sqrt(dmX * dmX + dmY * dmY);

                    if (distanceMouse < mouse.radius) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 140, 0, ${0.4 * (1 - distanceMouse / mouse.radius)})`;
                        ctx.lineWidth = 1.2;
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 opacity-60 dark:opacity-40"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
