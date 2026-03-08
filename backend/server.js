// Servidor Express — proxy seguro para a API IXC
// As credenciais ficam no .env, nunca expostas ao frontend

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import pool from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// ─── Função auxiliar: sincroniza perfil do usuário no banco após login ────────
/**
 * Salva ou atualiza os dados do usuário IXC na tabela usuarios_perfil.
 * @param {Object} usuario  - Registro da tabela usuarios (API IXC)
 * @param {Object|null} funcionario - Registro da tabela funcionarios (API IXC)
 */
async function sincronizarPerfilNoBanco(usuario, funcionario) {
    const func = funcionario || {};

    // Converte string de data para null se vazia
    const toDate = (val) => (val && val !== '' && val !== 'N/D' ? val : null);

    const query = `
        INSERT INTO usuarios_perfil (
            usuario_id, usuario_email, usuario_nome, acesso_token,
            funcionario_id, funcionario_nome, funcionario_email,
            id_funcao, id_departamento, filial_id,
            fone_celular, fone, ramal,
            data_nascimento, data_admissao, ativo, foto_perfil,
            sincronizado_em, atualizado_em
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),NOW())
        ON CONFLICT (usuario_id) DO UPDATE SET
            usuario_email     = EXCLUDED.usuario_email,
            usuario_nome      = EXCLUDED.usuario_nome,
            acesso_token      = EXCLUDED.acesso_token,
            funcionario_id    = EXCLUDED.funcionario_id,
            funcionario_nome  = EXCLUDED.funcionario_nome,
            funcionario_email = EXCLUDED.funcionario_email,
            id_funcao         = EXCLUDED.id_funcao,
            id_departamento   = EXCLUDED.id_departamento,
            filial_id         = EXCLUDED.filial_id,
            fone_celular      = EXCLUDED.fone_celular,
            fone              = EXCLUDED.fone,
            ramal             = EXCLUDED.ramal,
            data_nascimento   = EXCLUDED.data_nascimento,
            data_admissao     = EXCLUDED.data_admissao,
            ativo             = EXCLUDED.ativo,
            foto_perfil       = EXCLUDED.foto_perfil,
            atualizado_em     = NOW();
    `;

    await pool.query(query, [
        String(usuario.id),
        usuario.email || '',
        usuario.nome || '',
        usuario.acesso_token || '',
        func.id ? String(func.id) : null,
        func.funcionario || null,
        func.email || null,
        func.id_funcao || null,
        func.id_departamento ? String(func.id_departamento) : null,
        func.filial_id ? String(func.filial_id) : null,
        func.fone_celular || null,
        func.fone || null,
        func.ramal || null,
        toDate(func.data_nascimento),
        toDate(func.data_admissao),
        func.ativo || 'S',
        func.foto_perfil || null
    ]);
}

// ─── Rota de Login ───────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body

    if (!email) {
        return res.status(400).json({ sucesso: false, erro: 'Email é obrigatório.' })
    }

    if (!senha) {
        return res.status(400).json({ sucesso: false, erro: 'Senha é obrigatória.' })
    }

    // Monta o token Basic Auth a partir do .env
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/usuarios`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'usuarios.email',
        query: email,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'usuarios.id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })

        if (!resposta.ok) {
            const textoErro = await resposta.text()
            console.error(`Erro API IXC [${resposta.status}]:`, textoErro)
            return res.status(502).json({
                sucesso: false,
                erro: 'Falha ao comunicar com o sistema.'
            })
        }

        const dados = await resposta.json()

        // Nenhum usuário encontrado com esse email
        if (dados.total === 0) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Usuário não encontrado.'
            })
        }

        const usuario = dados.registros[0]

        // Valida a senha — API IXC armazena senha como hash SHA-256
        const senhaHash = crypto.createHash('sha256').update(senha).digest('hex')
        if (usuario.senha !== senhaHash) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Senha incorreta.'
            })
        }

        // Valida se o usuário está ativo
        if (usuario.status !== 'A') {
            return res.status(403).json({
                sucesso: false,
                erro: 'Usuário inativo. Entre em contato com o administrador.'
            })
        }

        // ── Busca dados do funcionário em paralelo ──
        let funcionario = null
        try {
            const urlFunc = `https://${host}/webservice/v1/funcionarios`
            const bodyFunc = JSON.stringify({
                qtype: 'funcionarios.email',
                query: email,
                oper: '=',
                page: '1',
                rp: '1',
                sortname: 'funcionarios.id',
                sortorder: 'asc'
            })
            const resFunc = await fetch(urlFunc, { method: 'POST', headers, body: bodyFunc })
            if (resFunc.ok) {
                const dadosFunc = await resFunc.json()
                if (dadosFunc.total > 0) {
                    funcionario = dadosFunc.registros[0]
                }
            }
        } catch (errFunc) {
            console.warn('Aviso: não foi possível buscar dados de funcionário:', errFunc.message)
        }

        // Sincroniza dados do perfil no banco de forma assíncrona (não bloqueia resposta)
        sincronizarPerfilNoBanco(usuario, funcionario)
            .then(() => console.log(`Perfil sincronizado no banco: ${usuario.email}`))
            .catch(errSync => console.warn('Aviso: falha ao sincronizar perfil:', errSync.message));

        // Retorna dados combinados de usuarios + funcionarios
        console.log(`Login bem-sucedido: ${usuario.nome} (${usuario.email})`)
        return res.json({
            sucesso: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                acesso_token: usuario.acesso_token
            },
            funcionario,
            host
        })

    } catch (erro) {
        console.error('Erro de requisição para API IXC:', erro.message)
        return res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor.'
        })
    }
})

// ─── Rota de Funcionário ───────────────────────────────────────────────
app.post('/api/funcionario', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ sucesso: false, erro: 'Email é obrigatório.' })
    }

    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/funcionarios`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'funcionarios.email',
        query: email,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'funcionarios.id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })

        if (!resposta.ok) {
            const textoErro = await resposta.text()
            console.error(`Erro API IXC Funcionarios [${resposta.status}]:`, textoErro)
            return res.status(502).json({ sucesso: false, erro: 'Falha ao comunicar com API de funcionários.' })
        }

        const dados = await resposta.json()

        if (dados.total === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado com este e-mail.' })
        }

        const funcionario = dados.registros[0]

        return res.json({ sucesso: true, funcionario })

    } catch (erro) {
        console.error('Erro requisição Funcionarios:', erro.message)
        return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' })
    }
})

// ─── Rota: buscar perfil salvo no banco ──────────────────────────────────────
app.get('/api/usuario/perfil/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM usuarios_perfil WHERE usuario_id = $1',
            [usuarioId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Perfil não encontrado.' });
        }
        return res.json({ sucesso: true, perfil: result.rows[0] });
    } catch (err) {
        console.error('Erro ao buscar perfil do banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar perfil.' });
    }
});

// ─── Rota de Configurações ───────────────────────────────────────────────
app.get('/api/configuracoes/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const result = await pool.query('SELECT chave, valor FROM usuarios_preferencias WHERE usuario_id = $1', [usuarioId]);
        // Converter de array [{chave: 'tema', valor: 'dark'}] para objeto {tema: 'dark'}
        const preferencias = result.rows.reduce((acc, curr) => {
            acc[curr.chave] = curr.valor;
            return acc;
        }, {});
        return res.json({ sucesso: true, preferencias });
    } catch (err) {
        console.error('Erro ao buscar configurações do banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro buscar configuracoes do banco' });
    }
});

app.put('/api/configuracoes/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    const { email, chave, valor } = req.body;

    if (!chave) {
        return res.status(400).json({ sucesso: false, erro: 'Chave é obrigatória.' });
    }

    try {
        const query = `
            INSERT INTO usuarios_preferencias (usuario_id, usuario_email, chave, valor, atualizado_em)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (usuario_id, chave) 
            DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW();
        `;
        await pool.query(query, [String(usuarioId), email || 'desconhecido', chave, valor]);
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao salvar configuração no banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao salvar no banco' });
    }
});

// ─── Inicialização ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend proxy rodando em http://localhost:${PORT}`)
})
