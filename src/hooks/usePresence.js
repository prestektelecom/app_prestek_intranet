import { useEffect } from 'react';

export function usePresence(user) {
    useEffect(() => {
        if (!user || !user.id) return;

        const updatePresence = async () => {
            try {
                await fetch(`/api/presenca/${user.id}`, {
                    method: 'POST'
                });
            } catch (err) {
                console.error('Falha ao atualizar presença:', err);
            }
        };

        updatePresence();

        const interval = setInterval(updatePresence, 2 * 60 * 1000);

        const handleUnload = () => {
            navigator.sendBeacon(`/api/presenca/${user.id}/logout`);
        };
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, [user]);
}
