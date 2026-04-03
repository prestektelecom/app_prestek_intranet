import fs from 'fs';

const filePath = '../src/components/ServicesDirectory.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Find and clean the tech delete function (removing the verbose "INICIANDO..." alert)
const techRegex = /const\s+handleDeleteTechClick\s*=\s*async\s*\(id\)\s*=>\s*\{[\s\S]*?window\.alert\('INICIANDO EXCLUSÃO[\s\S]*?\}\s* catch\s*\(error\)\s*\{[\s\S]*?\}\s*\}\s*;/;

const cleanTech = `const handleDeleteTechClick = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                const response = await fetch(\`/api/servicos-tecnicos/\${id}\`, { method: 'DELETE' });
                if (response.ok) {
                    setTechServices(prev => prev.filter(s => s.id !== id));
                    alert('Serviço excluído com sucesso!');
                } else {
                    const data = await response.json().catch(() => ({}));
                    alert('Erro ao excluir: ' + (data.erro || 'Falha no servidor'));
                }
            } catch (error) {
                console.error("Error deleting tech:", error);
                alert('Erro de conexão ao servidor.');
            }
        }
    };`;

// Find and clean the streaming delete function
const streamingRegex = /const\s+handleDeleteStreamingClick\s*=\s*async\s*\(id\)\s*=>\s*\{[\s\S]*?window\.alert\('INICIANDO EXCLUSÃO[\s\S]*?\}\s* catch\s*\(error\)\s*\{[\s\S]*?\}\s*\}\s*;/;

const cleanStreaming = `const handleDeleteStreamingClick = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este pacote?')) {
            try {
                const response = await fetch(\`/api/pacotes-streaming/\${id}\`, { method: 'DELETE' });
                if (response.ok) {
                    setStreamingServices(prev => prev.filter(s => s.id !== id));
                    alert('Pacote excluído com sucesso!');
                } else {
                    const data = await response.json().catch(() => ({}));
                    alert('Erro ao excluir: ' + (data.erro || 'Falha no servidor'));
                }
            } catch (error) {
                console.error("Error deleting streaming:", error);
                alert('Erro de conexão ao servidor.');
            }
        }
    };`;

if (techRegex.test(content)) {
    content = content.replace(techRegex, cleanTech);
    console.log('Tech delete cleaned.');
}
if (streamingRegex.test(content)) {
    content = content.replace(streamingRegex, cleanStreaming);
    console.log('Streaming delete cleaned.');
}

fs.writeFileSync(filePath, content);
console.log('Cleanup complete.');
