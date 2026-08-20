// Extrai texto de um PDF. Cascata: camada de texto (pdf-parse v2) → OCR
// (tesseract.js). Nenhum ramo retorna erro ao usuário — no máximo
// `origem: 'nenhum'` com aviso.

const LIMIAR_TEXTO_UTIL = 200;

function textoUtil(texto) {
    return String(texto || '').replace(/\s/g, '').length >= LIMIAR_TEXTO_UTIL;
}

async function extrairCamadaTexto(buffer) {
    // Import dinâmico: pdf-parse v2 usa pdfjs-dist + wasm, e isolar o cold
    // start aqui mantém o `npm run dev` leve para quem não abre a aba TI.
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    try {
        const resultado = await parser.getText();
        return String(resultado?.text || '');
    } finally {
        await parser.destroy();
    }
}

async function extrairOCR(buffer, onProgresso) {
    // Import dinâmico pelo mesmo motivo: tesseract.js baixa o modelo de ~15MB
    // no primeiro uso.
    const { createWorker } = await import('tesseract.js');
    const { PDFParse } = await import('pdf-parse');

    const parser = new PDFParse({ data: buffer });
    let worker = null;
    try {
        const { total } = await parser.getInfo();
        worker = await createWorker('por', 1, {
            logger: m => {
                if (m.status === 'recognizing text' && onProgresso) {
                    onProgresso({ pagina: m.userJobId ?? 1, progresso: m.progress });
                }
            },
        });

        const partes = [];
        for (let i = 1; i <= total; i += 1) {
            const screenshot = await parser.getScreenshot({ pageNumber: i });
            if (!screenshot) continue;
            const { data: { text } } = await worker.recognize(screenshot);
            partes.push(text);
            onProgresso?.({ pagina: i, progresso: 1 });
        }
        return partes.join('\n');
    } finally {
        if (worker) await worker.terminate();
        await parser.destroy();
    }
}

/**
 * @param {Buffer} buffer
 * @param {Object} opcoes
 * @param {(info: {pagina: number, progresso: number}) => void} opcoes.onProgresso
 * @returns {Promise<{texto: string, origem: 'texto'|'ocr'|'nenhum'}>}
 */
export async function extrairTextoPdf(buffer, { onProgresso } = {}) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Buffer inválido.');
    }

    const assinatura = buffer.slice(0, 5).toString('ascii');
    if (assinatura !== '%PDF-') {
        const erro = new Error('O arquivo enviado não é um PDF.');
        erro.status = 400;
        throw erro;
    }

    let texto = await extrairCamadaTexto(buffer);
    if (textoUtil(texto)) {
        return { texto, origem: 'texto' };
    }

    try {
        texto = await extrairOCR(buffer, onProgresso);
    } catch (e) {
        console.warn('[extrairTextoPdf] OCR falhou:', e.message);
        texto = '';
    }

    if (textoUtil(texto)) {
        return { texto, origem: 'ocr' };
    }

    return { texto: '', origem: 'nenhum' };
}
