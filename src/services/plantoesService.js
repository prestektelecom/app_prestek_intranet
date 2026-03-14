const API_URL = 'http://localhost:3001/api';

export const plantoesService = {
    async getPlantoes() {
        const response = await fetch(`${API_URL}/plantoes`);
        return await response.json();
    },

    async getMeuProximoPlantao(usuarioId) {
        if (!usuarioId) return { sucesso: false, erro: 'ID do usuário não fornecido' };
        const response = await fetch(`${API_URL}/plantoes/meu-proximo/${usuarioId}`);
        return await response.json();
    }
};
