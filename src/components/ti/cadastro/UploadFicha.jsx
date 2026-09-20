import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CARD, BTN_SECUNDARIO, AVISO_AMBAR, AVISO_ERRO, AVISO_INFO } from './estilos';

const ESTADOS = {
    vazio: { icone: 'upload_file', titulo: 'Arraste a ficha aqui', cor: 'text-faint' },
    arrastando: { icone: 'download', titulo: 'Solte para processar', cor: 'text-[var(--accent)]' },
    lendo: { icone: 'hourglass_top', titulo: 'Lendo ficha…', cor: 'text-faint' },
    ocr: { icone: 'document_scanner', titulo: 'Reconhecendo texto (OCR)…', cor: 'text-amber-600' },
    ok: { icone: 'check_circle', titulo: 'Ficha processada', cor: 'text-emerald-600' },
    escaneado: { icone: 'scanner', titulo: 'Ficha escaneada processada', cor: 'text-amber-600' },
    erro: { icone: 'error', titulo: 'Falha ao processar', cor: 'text-red-600' },
};

/**
 * Upload da ficha de registro em PDF. O arquivo é enviado direto para o
 * backend e nunca persiste — nem no servidor, nem no cliente.
 */
export default function UploadFicha({ user, onCamposExtraidos, onLog }) {
    const [estado, setEstado] = useState('vazio');
    const [mensagem, setMensagem] = useState('');
    const inputRef = useRef(null);

    // Soltar um PDF fora desta zona (em qualquer outro ponto da página) é o
    // comportamento padrão do navegador de ABRIR o arquivo, navegando pra
    // fora da SPA e perdendo o formulário inteiro. A zona de drop já trata
    // seu próprio dragover/drop; esta guarda cobre o resto da página.
    useEffect(() => {
        const bloquear = (e) => e.preventDefault();
        window.addEventListener('dragover', bloquear);
        window.addEventListener('drop', bloquear);
        return () => {
            window.removeEventListener('dragover', bloquear);
            window.removeEventListener('drop', bloquear);
        };
    }, []);

    const processar = useCallback(async (arquivo) => {
        if (!arquivo) return;
        if (arquivo.type !== 'application/pdf') {
            setEstado('erro');
            setMensagem('O arquivo precisa ser um PDF.');
            return;
        }

        setEstado('lendo');
        setMensagem(arquivo.name);
        onLog?.(`Iniciando leitura da ficha "${arquivo.name}"…`, 'info');

        try {
            const res = await fetch('/api/ti/colaborador/extrair-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/pdf',
                },
                body: arquivo,
            });

            const dados = await res.json().catch(() => ({}));

            if (!res.ok || !dados.sucesso) {
                // 503: serviço de banco temporariamente indisponível — orienta o usuário a tentar novamente
                if (res.status === 503) {
                    throw new Error('Serviço indisponível no momento. Aguarde alguns segundos e tente novamente.');
                }
                const msg = dados.erro || 'Não foi possível processar o arquivo. Tente novamente ou avise a TI.';
                throw new Error(msg);
            }

            if (dados.origem === 'nenhum') {
                setEstado('escaneado');
                setMensagem('Não foi possível extrair texto. Preencha manualmente.');
                onLog?.('Ficha não tinha texto recuperável. Formulário liberado para preenchimento manual.', 'info');
            } else {
                setEstado(dados.origem === 'ocr' ? 'escaneado' : 'ok');
                setMensagem(`${arquivo.name} — ${dados.origem === 'ocr' ? 'OCR' : 'texto digital'}`);
                onCamposExtraidos?.(dados);
                onLog?.(`Ficha processada (${dados.origem}). ${Object.values(dados.campos || {}).filter(Boolean).length} campo(s) extraído(s).`, 'sucesso');
            }
        } catch (e) {
            setEstado('erro');
            setMensagem(e.message);
            onLog?.(`Falha ao processar ficha: ${e.message}`, 'erro');
        }
    }, [user, onCamposExtraidos, onLog]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setEstado('vazio');
        const arquivo = e.dataTransfer?.files?.[0];
        processar(arquivo);
    }, [processar]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        if (estado === 'vazio' || estado === 'ok' || estado === 'escaneado' || estado === 'erro') {
            setEstado('arrastando');
        }
    }, [estado]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        if (estado === 'arrastando') setEstado('vazio');
    }, [estado]);

    const meta = ESTADOS[estado];

    return (
        <div className={CARD}>
            <div
                className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background px-6 py-10 text-center transition-colors ${
                    estado === 'arrastando' ? 'border-[var(--accent)] bg-[var(--accent-soft)]/20' : ''
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <span className={`material-symbols-outlined text-4xl ${meta.cor}`} aria-hidden="true">
                    {meta.icone}
                </span>
                <p className="text-sm font-bold text-foreground">{meta.titulo}</p>
                <p className="text-xs text-faint">
                    PDF digital, exportado do Word ou escaneado. O arquivo é descartado após a leitura.
                </p>
                {mensagem && (
                    <p className="text-xs text-faint max-w-md truncate">{mensagem}</p>
                )}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className={BTN_SECUNDARIO}
                >
                    <span className="material-symbols-outlined text-[17px]" aria-hidden="true">folder_open</span>
                    Escolher arquivo
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => {
                        const arquivo = e.target.files?.[0];
                        // Sem isso, escolher o MESMO arquivo de novo depois de uma
                        // falha não dispara onChange (o navegador só dispara quando
                        // o valor muda) — reselecionar a mesma ficha não fazia nada.
                        e.target.value = '';
                        processar(arquivo);
                    }}
                />
            </div>

            {estado === 'escaneado' && (
                <div className={`${AVISO_AMBAR} mt-3 mx-6 mb-4`}>
                    <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden="true">warning</span>
                    <span className="min-w-0">
                        A ficha veio de digitalização. Confira todos os campos com atenção — a confiança de extração é reduzida.
                    </span>
                </div>
            )}

            {estado === 'erro' && (
                <div className={`${AVISO_ERRO} mt-3 mx-6 mb-4`}>
                    <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden="true">error</span>
                    <span className="min-w-0">{mensagem}</span>
                </div>
            )}

            {estado === 'ok' && (
                <div className={`${AVISO_INFO} mt-3 mx-6 mb-4`}>
                    <span className="material-symbols-outlined shrink-0 text-[16px]" aria-hidden="true">info</span>
                    <span className="min-w-0">
                        Campos extraídos foram preenchidos no formulário. Revise os que estão destacados antes de simular.
                    </span>
                </div>
            )}
        </div>
    );
}
