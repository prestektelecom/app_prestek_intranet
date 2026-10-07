import nodemailer from 'nodemailer'

// Destinatários padrão da caixa de sugestões; SUGESTOES_EMAIL_PARA (separados por
// vírgula) sobrescreve sem mexer no código.
const DESTINATARIOS_PADRAO = 'ti@prestek.com.br,felixskmarcio2@gmail.com'

const ROTULO_TIPO = { melhoria: 'Melhoria', ideia: 'Ideia', problema: 'Problema' }

let transporte = null

// Sem SMTP_HOST o envio fica desligado (dev local e produção ainda sem
// configurar): a sugestão continua salva no banco, só não vai por e-mail.
function obterTransporte() {
    if (!process.env.SMTP_HOST) return null
    if (!transporte) {
        const porta = Number(process.env.SMTP_PORT) || 587
        transporte = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: porta,
            secure: porta === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
            connectionTimeout: 10_000,
            socketTimeout: 15_000,
        })
    }
    return transporte
}

// Remove quebras de linha de valores que vão para o assunto (injeção de cabeçalho).
const umaLinha = (t) => String(t ?? '').replace(/[\r\n]+/g, ' ').trim()

/**
 * Avisa a TI de uma sugestão nova. Nunca lança: falha de e-mail não pode
 * derrubar nem desfazer o envio da sugestão. Retorna true se enviou.
 */
export async function enviarEmailSugestao({ sugestao, autorEmail }) {
    const t = obterTransporte()
    if (!t) {
        console.warn('[sugestoes] SMTP_HOST não configurado: e-mail não enviado (sugestão salva no banco).')
        return false
    }
    const para = (process.env.SUGESTOES_EMAIL_PARA || DESTINATARIOS_PADRAO).split(',').map((e) => e.trim()).filter(Boolean)
    const tipo = ROTULO_TIPO[sugestao.tipo] ?? sugestao.tipo
    try {
        await t.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: para,
            // Responder ao e-mail cai no autor; só se o e-mail veio do token.
            replyTo: autorEmail ? umaLinha(autorEmail) : undefined,
            subject: `[Intranet] ${tipo}: ${umaLinha(sugestao.titulo)}`,
            text: [
                `Nova sugestão #${sugestao.id} na intranet`,
                '',
                `Tipo: ${tipo}`,
                `Autor: ${umaLinha(sugestao.usuario_nome)}${autorEmail ? ` <${umaLinha(autorEmail)}>` : ''}`,
                `Título: ${umaLinha(sugestao.titulo)}`,
                '',
                sugestao.descricao,
            ].join('\n'),
        })
        return true
    } catch (err) {
        console.error('[sugestoes] Falha ao enviar e-mail:', err.message)
        return false
    }
}
