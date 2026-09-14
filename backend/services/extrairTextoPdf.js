// Extrai texto de um PDF. Cascata: camada de texto (pdf-parse v2) → OCR
// (tesseract.js). Nenhum ramo retorna erro ao usuário — no máximo
// `origem: 'nenhum'` com aviso.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CACHE_TESSERACT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.cache', 'tesseract');
// tesseract.js não cria o diretório de `cachePath` sozinho — sem isto,
// `writeCache` falha silenciosamente (só loga) e o modelo baixa de novo do
// CDN a cada requisição, achado ao vivo na tarefa 5.6.
fs.mkdirSync(CACHE_TESSERACT, { recursive: true });

const LIMIAR_TEXTO_UTIL = 200;

function textoUtil(texto) {
    return String(texto || '').replace(/\s/g, '').length >= LIMIAR_TEXTO_UTIL;
}

// pdf-parse/tesseract.js não aceitam AbortSignal — um PDF malformado (xref
// quebrado, sem estar corrompido o bastante para lançar) pode deixar
// `getInfo()`/`getScreenshot()` presos indefinidamente, quebrando a garantia
// de "nunca trava" (achado ao vivo na tarefa 9.4, testando um PDF mínimo sem
// texto). A promessa original não é cancelada de verdade — só deixa de ser
// esperada — mas isso já basta para o request do usuário sempre responder.
function comTimeout(promessa, ms, valorQuandoEstourar) {
    let timer;
    const estouro = new Promise(resolve => {
        timer = setTimeout(() => resolve(valorQuandoEstourar), ms);
    });
    return Promise.race([promessa.finally(() => clearTimeout(timer)), estouro]);
}

async function extrairCamadaTexto(buffer) {
    try {
        // Import dinâmico: pdf-parse v2 usa pdfjs-dist + wasm, e isolar o cold
        // start aqui mantém o `npm run dev` leve para quem não abre a aba TI.
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        try {
            const resultado = await parser.getText();
            return String(resultado?.text || '');
        } finally {
            await parser.destroy().catch(() => {});
        }
    } catch (e) {
        console.warn('[extrairTextoPdf] Camada de texto falhou:', e.message);
        return '';
    }
}

async function extrairOCR(buffer, onProgresso) {
    // Import dinâmico pelo mesmo motivo: tesseract.js baixa o modelo de
    // ~2,4MB (medido ao vivo, tarefa 5.6 — não os ~15MB estimados aqui antes
    // de medir) no primeiro uso.
    const { createWorker } = await import('tesseract.js');
    const { PDFParse } = await import('pdf-parse');

    const parser = new PDFParse({ data: buffer });
    let worker = null;
    try {
        const { total } = await parser.getInfo();
        worker = await createWorker('por', 1, {
            // Sem isto, `cachePath` cai no default `.` (cwd) — foi assim que
            // `por.traineddata` acabou dentro de `backend/` e commitado no git
            // (achado ao vivo, tarefa 5.6). Um diretório fixo relativo a este
            // arquivo garante o cache no mesmo lugar não importa de onde o
            // processo é iniciado.
            cachePath: CACHE_TESSERACT,
            logger: m => {
                if (m.status === 'recognizing text' && onProgresso) {
                    onProgresso({ pagina: m.userJobId ?? 1, progresso: m.progress });
                }
            },
        });

        const partes = [];
        for (let i = 1; i <= total; i += 1) {
            // scale:3 (~216 DPI equivalente) — achado ao vivo (tarefa 5.8): no
            // scale padrão (1, ~72 DPI) uma ficha real de formulário denso
            // rendeu só ~100 caracteres de ruído (abaixo do LIMIAR_TEXTO_UTIL de
            // 200), sempre caindo em `origem: 'nenhum'` mesmo com texto legível
            // a olho nu. A 3x, a mesma ficha rendeu >1000 caracteres majoritariamente
            // corretos (nomes, CEP, endereço reais reconhecidos).
            const screenshot = await parser.getScreenshot({ pageNumber: i, scale: 3 });
            const pageData = screenshot?.pages?.[0];
            const imgSource = pageData?.dataUrl || (pageData?.data ? Buffer.from(pageData.data) : null);
            if (!imgSource) continue;
            const { data: { text } } = await worker.recognize(imgSource);
            partes.push(text);
            onProgresso?.({ pagina: i, progresso: 1 });
        }
        return partes.join('\n');
    } catch (e) {
        console.warn('[extrairTextoPdf] Falha no processamento OCR:', e.message);
        return '';
    } finally {
        if (worker) await worker.terminate().catch(() => {});
        await parser.destroy().catch(() => {});
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

    let texto = await comTimeout(extrairCamadaTexto(buffer), 20000, '');
    if (textoUtil(texto)) {
        return { texto, origem: 'texto' };
    }

    try {
        texto = await comTimeout(extrairOCR(buffer, onProgresso), 90000, '');
    } catch (e) {
        console.warn('[extrairTextoPdf] OCR falhou:', e.message);
        texto = '';
    }

    if (textoUtil(texto)) {
        return { texto, origem: 'ocr' };
    }

    return { texto: '', origem: 'nenhum' };
}
