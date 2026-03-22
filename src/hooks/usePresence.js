import { useEffect } from 'react';

export function usePresence(user) {
    useEffect(() => {
        if (!user || !user.id) return;

        const updatePresence = async () => {
            try {
                await fetch(`http://localhost:3001/api/presenca/${user.id}`, {
                    method: 'POST'
                });
            } catch (err) {
                console.error('Falha ao atualizar presença:', err);
            }
        };

        // Atualiza imediatamente ao carregar
        updatePresence();

        // Atualiza a cada 2 minutos
        const interval = setInterval(updatePresence, 2 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);
}
