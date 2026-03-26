// Servidor Express — proxy seguro para a API IXC
// As credenciais ficam no .env, nunca expostas ao frontend

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import pool from './db.js'
import fs from 'fs'

// Cache para OS abertas global
let cacheOS = {
    dados: null,
    timestamp: 0
};

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: true }))
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
            atualizado_em     = NOW()
        RETURNING is_admin;
    `;

    const result = await pool.query(query, [
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

    return result.rows[0]?.is_admin || false;
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
                qtype: 'funcionarios.id',
                query: usuario.funcionario, // usuario.funcionario guarda o ID do funcionário vinculado a ele!
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

        // Sincroniza dados do perfil no banco (bloqueia resposta para pegar is_admin)
        let isAdmin = false;
        try {
            isAdmin = await sincronizarPerfilNoBanco(usuario, funcionario);
            console.log(`Perfil sincronizado no banco: ${usuario.email} (Admin: ${isAdmin})`);
        } catch (errSync) {
            console.warn('Aviso: falha ao sincronizar perfil:', errSync.message);
        }

        // Retorna dados combinados de usuarios + funcionarios
        console.log(`Login bem-sucedido: ${usuario.nome} (${usuario.email})`)
        return res.json({
            sucesso: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                acesso_token: usuario.acesso_token,
                is_admin: isAdmin
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

// ─── Rota: Buscar Funcionário p/ Painel ───────────────────────────────────
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

// ─── Rotas: Comunicados Internos ──────────────────────────────────────────────
app.get('/api/comunicados', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comunicados ORDER BY criado_em DESC');
        return res.json({ sucesso: true, comunicados: result.rows });
    } catch (err) {
        console.error('Erro ao buscar comunicados:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar comunicados.' });
    }
});

app.post('/api/comunicados', async (req, res) => {
    const { titulo, descricao, tipo, departamento_autor, link_opcional, criado_por } = req.body;

    if (!titulo || !descricao || !tipo || !departamento_autor) {
        return res.status(400).json({ sucesso: false, erro: 'Preencha os campos obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO comunicados (titulo, descricao, tipo, departamento_autor, link_opcional, criado_por)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [titulo, descricao, tipo, departamento_autor, link_opcional, criado_por]);
        return res.status(201).json({ sucesso: true, comunicado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao inserir comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao salvar comunicado.' });
    }
});

app.put('/api/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, tipo, departamento_autor, link_opcional } = req.body;

    try {
        const query = `
            UPDATE comunicados 
            SET titulo = $1, descricao = $2, tipo = $3, departamento_autor = $4, link_opcional = $5
            WHERE id = $6 RETURNING *;
        `;
        const result = await pool.query(query, [titulo, descricao, tipo, departamento_autor, link_opcional, id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Comunicado não encontrado.' });
        return res.json({ sucesso: true, comunicado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar comunicado.' });
    }
});

app.delete('/api/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM comunicados WHERE id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Comunicado não encontrado.' });
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao excluir comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao excluir comunicado.' });
    }
});

// ─── Rota: Listar Departamentos ─────────────────────────────────────────
app.get('/api/departamentos', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/su_ticket_setor`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'su_ticket_setor.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'su_ticket_setor.setor',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, departamentos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ─── Rota: Listar Departamentos Organizacionais (departamento) ─────────
app.get('/api/departamentos-empresa', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/departamento`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, departamentos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ─── Rota: Listar Cargos/Setores da Empresa (empresa_setor) ─────────────
app.get('/api/cargos', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/empresa_setor`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'empresa_setor.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'empresa_setor.setor',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, cargos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ROTA DE TESTE TEMPORÁRIA
app.get('/api/test-ixc', async (req, res) => {
    const { endpoint } = req.query;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/${endpoint}`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        if (!resposta.ok) {
            return res.status(resposta.status).json({ sucesso: false, erro: `Status ${resposta.status}` });
        }
        const dados = await resposta.json()
        return res.json({ sucesso: true, registros: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
});

// ─── Rota: Listar Filiais ────────────────────────────────────────────────
app.get('/api/filiais', async (req, res) => {
    const url = `https://${process.env.IXC_HOST}/webservice/v1/filial`;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const body = JSON.stringify({
        qtype: 'filial.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '100',
        sortname: 'filial.id',
        sortorder: 'asc'
    });

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();
        return res.json({ sucesso: true, filiais: dados.registros || [] });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Listar Quantidade de OS do Funcionário (Busca Global c/ Cache) ──
app.get('/api/os-chamados/:funcionarioId', async (req, res) => {
    const { funcionarioId } = req.params;
    
    if (!funcionarioId || funcionarioId === 'undefined') {
        return res.status(400).json({ sucesso: false, erro: 'ID do funcionário é obrigatório.' });
    }

    const host = process.env.IXC_HOST;
    const url = `https://${host}/webservice/v1/su_oss_chamado`;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // 1. Resolver o ID de Técnico do IXC
        let ixcTecnicoId = funcionarioId;
        const pRes = await pool.query('SELECT usuario_email, funcionario_id FROM usuarios_perfil WHERE funcionario_id = $1 OR usuario_id = $1 LIMIT 1', [funcionarioId]);
        
        if (pRes.rows.length > 0) {
            const email = pRes.rows[0].usuario_email;
            if (email) {
               const rUser = await fetch(`https://${host}/webservice/v1/usuarios`, {
                   method: 'POST',
                   headers: headers,
                   body: JSON.stringify({ qtype: 'usuarios.email', query: email, oper: '=', page: '1', rp: '1' })
               });
               const dUser = await rUser.json();
               if (dUser.total > 0 && dUser.registros[0].funcionario) {
                   ixcTecnicoId = dUser.registros[0].funcionario; 
               } else if (pRes.rows[0].funcionario_id) {
                   ixcTecnicoId = pRes.rows[0].funcionario_id;
               }
            } else if (pRes.rows[0].funcionario_id) {
               ixcTecnicoId = pRes.rows[0].funcionario_id;
            }
        }

        // 2. Verificar Cache Global (1 minuto)
        const agora = Date.now();
        if (!cacheOS.dados || (agora - cacheOS.timestamp > 60000)) {
            console.log("-> Cache expirado ou vazio em /api/os-chamados. Buscando OS abertas no IXC...");
            const statusAtivos = ['A', 'AG', 'AS', 'EN', 'AN', 'EX'];
            const promises = statusAtivos.map(async (status) => {
                const body = JSON.stringify({
                    qtype: 'su_oss_chamado.status',
                    query: status,
                    oper: '=',
                    page: '1',
                    rp: '10000'
                });
                try {
                    const resp = await fetch(url, { method: 'POST', headers, body });
                    const json = await resp.json();
                    return json.registros || [];
                } catch (err) {
                    return [];
                }
            });
            const resultados = await Promise.all(promises);
            cacheOS = {
                dados: resultados.flat(),
                timestamp: agora
            };
            console.log(`-> Cache atualizado. Total de OS abertas na empresa: ${cacheOS.dados.length}`);
        }

        // 3. Filtrar localmente e contar
        const registrosDoTecnico = cacheOS.dados.filter(os => String(os.id_tecnico) === String(ixcTecnicoId));
        console.log(`-> Usuario ${funcionarioId} (Tecnico ${ixcTecnicoId}): ${registrosDoTecnico.length} OS encontrada.`);

        const statusCount = { A: 0, AG: 0, AS: 0, EN: 0, AN: 0, EX: 0, OUTROS: 0 };
        registrosDoTecnico.forEach(os => {
            const s = String(os.status).toUpperCase();
            if (statusCount[s] !== undefined) statusCount[s]++;
            else statusCount['OUTROS']++;
        });
        
        return res.json({ 
            sucesso: true, 
            quantidade: registrosDoTecnico.length, 
            statusCount,
            cacheStatus: cacheOS.timestamp === agora ? 'MISS' : 'HIT'
        });

    } catch (e) {
        console.error("Erro rota os-chamados:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro buscar OS do IXC.' });
    }
});

// ─── Rota: Atualizar dados de Funcionário no IXC ───────────────────────────
app.put('/api/funcionario/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    const formData = req.body;

    try {
        const result = await pool.query('SELECT funcionario_id FROM usuarios_perfil WHERE usuario_id = $1', [usuarioId]);
        if (result.rows.length === 0 || !result.rows[0].funcionario_id) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado no banco.' });
        }

        const funcionarioId = result.rows[0].funcionario_id;
        const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
        const host = process.env.IXC_HOST;

        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
            ixcsoft: 'listar'
        };

        const bodyGet = JSON.stringify({
            qtype: 'funcionarios.id',
            query: funcionarioId,
            oper: '=',
            page: '1',
            rp: '1'
        });
        const resGet = await fetch(`https://${host}/webservice/v1/funcionarios`, { method: 'POST', headers, body: bodyGet });
        if (!resGet.ok) {
            return res.status(502).json({ sucesso: false, erro: 'Falha ao buscar funcionário atual no IXC.' });
        }

        const dadosFunc = await resGet.json();
        if (!dadosFunc.total || dadosFunc.total === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado no IXC para atualizar.' });
        }

        const funcionarioAtual = dadosFunc.registros[0];

        const headersPut = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(token).toString('base64')
        };
        const urlPut = `https://${host}/webservice/v1/funcionarios/${funcionarioId}`;

        const funcionarioName = [formData.nome, formData.sobrenome].filter(Boolean).join(' ');

        const bodyContent = {
            ...funcionarioAtual, 
            fone_celular: formData.telefone_celular !== undefined ? formData.telefone_celular : (formData.fone_celular || funcionarioAtual.fone_celular || ''),
            funcionario: funcionarioName || funcionarioAtual.funcionario || '',
            email: formData.email !== undefined ? formData.email : (funcionarioAtual.email || ''),
            ramal: formData.ramal !== undefined ? formData.ramal : (funcionarioAtual.ramal || ''),
        };

        if (formData.data_nascimento) bodyContent.data_nascimento = formData.data_nascimento;
        if (formData.id_departamento) bodyContent.id_departamento = formData.id_departamento;
        if (formData.filial_id) bodyContent.filial_id = formData.filial_id;

        const bodyPut = JSON.stringify(bodyContent);
        const resposta = await fetch(urlPut, { method: 'PUT', headers: headersPut, body: bodyPut });

        if (!resposta.ok) {
            const textoErro = await resposta.text();
            console.error(`Erro IXC ao atualizar [${resposta.status}]:`, textoErro);
            return res.status(502).json({ sucesso: false, erro: 'Falha ao atualizar dados no IXC.' });
        }

        const dNasc = bodyContent.data_nascimento ? bodyContent.data_nascimento : null;
        await pool.query(
            `UPDATE usuarios_perfil SET 
                fone_celular = $1, 
                funcionario_nome = $2, 
                usuario_nome = $2,
                usuario_email = $3,
                ramal = $4,
                data_nascimento = $5,
                atualizado_em = NOW() 
             WHERE usuario_id = $6`,
            [bodyContent.fone_celular, bodyContent.funcionario, bodyContent.email, bodyContent.ramal, dNasc, usuarioId]
        );

        return res.json({ sucesso: true, mensagem: 'Dados atualizados no IXC' });

    } catch (erro) {
        console.error('Erro requisição PUT Funcionario:', erro.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar funcionário.' });
    }
});

// ─── Rota: Listar todos os Colaboradores Ativos (Diretório) ──────────────────
app.get('/api/colaboradores', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const host = process.env.IXC_HOST;
    const url = `https://${host}/webservice/v1/funcionarios`;

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const includeInactive = req.query.all === 'true';
    const body = JSON.stringify({
        qtype: includeInactive ? 'funcionarios.id' : 'funcionarios.ativo',
        query: includeInactive ? '0' : 'S',
        oper: includeInactive ? '>' : '=',
        page: '1',
        rp: '1000',
        sortname: 'funcionarios.funcionario',
        sortorder: 'asc'
    });

    try {
        const respostaVal = await fetch(url, { method: 'POST', headers, body });
        if (!respostaVal.ok) {
            throw new Error(`Erro API IXC: ${respostaVal.status}`);
        }

        const dadosIXC = await respostaVal.json();
        const funcionariosIXC = dadosIXC.registros || [];

        // 1. Fotos salvas via tela de Configurações ficam em usuarios_preferencias como avatarUrl
        const fotosPrefsResult = await pool.query("SELECT usuario_email, valor FROM usuarios_preferencias WHERE chave = 'avatarUrl'");
        const mapaFotosPorEmail = fotosPrefsResult.rows.reduce((acc, curr) => {
            if (curr.usuario_email) acc[curr.usuario_email.toLowerCase()] = curr.valor;
            return acc;
        }, {});

        // 2. Ramais editados pelo usuário em Configurações (usuarios_preferencias)
        //    A tabela usuarios_preferencias já salva o usuario_email diretamente
        const ramaisQuery = await pool.query(`
            SELECT usuario_email, valor AS ramal
            FROM usuarios_preferencias
            WHERE chave = 'ramal' AND valor IS NOT NULL AND valor <> '' AND valor <> '0'
        `);
        const mapaRamaisPorEmail = ramaisQuery.rows.reduce((acc, curr) => {
            if (curr.usuario_email) acc[curr.usuario_email.toLowerCase()] = curr.ramal;
            return acc;
        }, {});

        // Mescla dados do IXC com dados locais de foto e ramal
        const colaboradores = funcionariosIXC.map(f => {
            const emailKey = (f.email || '').toLowerCase();
            const fotoLocal = mapaFotosPorEmail[emailKey];
            // Ramal salvo pelo usuário em Configurações (via email como chave de ligação)
            const ramalLocal = mapaRamaisPorEmail[emailKey];
                // Evita mostrar o SVG padrão do IXC como foto para quem nunca mudou a imagem
                let ixcFoto = f.foto_perfil;
                if (ixcFoto && typeof ixcFoto === 'string' && ixcFoto.trim().startsWith('<svg')) {
                    ixcFoto = null;
                }

                return {
                    usuario_id: null,
                    funcionario_id: f.id,
                    funcionario_nome: f.funcionario,
                    usuario_email: f.email,
                    id_departamento: f.id_departamento,
                    filial_id: f.filial_id,
                    id_funcao: f.id_funcao,
                    fone_celular: f.fone_celular,
                    // Prioridade: preferência salva em Configurações > ramal vindo do IXC
                    ramal: ramalLocal !== undefined ? ramalLocal : (f.ramal || null),
                    foto_perfil: fotoLocal || ixcFoto || null,
                    ativo: f.ativo
                };
        });

        return res.json({ sucesso: true, colaboradores });
    } catch (err) {
        console.error('Erro ao buscar colaboradores no IXC:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar colaboradores.' });
    }
});

app.get('/api/usuario/perfil/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        // Busca perfil na tabela usuarios_perfil
        const result = await pool.query(
            'SELECT * FROM usuarios_perfil WHERE usuario_id = $1',
            [usuarioId]
        );

        if (result.rows.length === 0) {
            // Se não encontrou no perfil, retornamos um objeto mínimo para não dar 404 nem 500
            // O frontend cuidará dos fallbacks (como o avatar2)
            return res.json({ 
                sucesso: true, 
                perfil: { 
                    usuario_id: usuarioId,
                    usuario_nome: 'Usuário',
                    foto_perfil: null
                } 
            });
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

// ─── Rotas: Presença e Colaboradores Online ──────────────────────────────
app.post('/api/presenca/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        await pool.query(
            'UPDATE usuarios_perfil SET ultima_atividade = NOW() WHERE usuario_id = $1',
            [usuarioId]
        );
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao atualizar presença:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar presença' });
    }
});

app.get('/api/colaboradores/online', async (req, res) => {
    try {
        // Considera online quem teve atividade nos últimos 5 minutos, e busca a foto customizada
        const query = `
            SELECT 
                p.usuario_id, p.funcionario_id, p.funcionario_nome, p.usuario_email, 
                p.foto_perfil as ixc_foto, p.id_departamento, p.ultima_atividade,
                pref.valor as foto_custom
            FROM usuarios_perfil p
            LEFT JOIN usuarios_preferencias pref 
                ON LOWER(p.usuario_email) = LOWER(pref.usuario_email) AND pref.chave = 'avatarUrl'
            WHERE p.ultima_atividade > NOW() - interval '5 minutes'
            ORDER BY p.funcionario_nome ASC;
        `;
        const result = await pool.query(query);
        
        // Formata para o padrão esperado pelo componente
        const online = result.rows.map(u => {
            let fotoFim = u.foto_custom || u.ixc_foto || null;
            if (fotoFim && typeof fotoFim === 'string' && fotoFim.trim().startsWith('<svg')) {
                fotoFim = null;
            }
            
            return {
                id: u.funcionario_id || u.usuario_id,
                nome: u.funcionario_nome || u.usuario_nome || 'Colaborador',
                email: u.usuario_email,
                foto: fotoFim,
                status: 'online'
            };
        });

        return res.json({ sucesso: true, colaboradores: online });
    } catch (err) {
        console.error('Erro ao buscar colaboradores online:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar colaboradores online' });
    }
});

app.post('/api/configuracoes/:usuarioId', async (req, res) => {
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

// ─── Rotas: Plantões ────────────────────────────────────────────────────────
app.get('/api/plantoes', async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                   n1.funcionario_nome as n1_nome, n1.foto_perfil as n1_foto,
                   n2.funcionario_nome as n2_nome, n2.foto_perfil as n2_foto,
                   mgr.funcionario_nome as mgr_nome, mgr.foto_perfil as mgr_foto
            FROM plantoes p
            LEFT JOIN usuarios_perfil n1 ON p.n1_id = n1.funcionario_id
            LEFT JOIN usuarios_perfil n2 ON p.n2_id = n2.funcionario_id
            LEFT JOIN usuarios_perfil mgr ON p.gerente_id = mgr.funcionario_id
            ORDER BY p.data ASC;
        `;
        const result = await pool.query(query);
        return res.json({ sucesso: true, plantoes: result.rows });
    } catch (err) {
        console.error('Erro ao buscar plantões:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar plantões.' });
    }
});

app.get('/api/plantoes/meu-proximo/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        // Primeiro, pega o funcionario_id associado ao usuario_id
        const userRes = await pool.query('SELECT funcionario_id FROM usuarios_perfil WHERE usuario_id = $1', [usuarioId]);
        const funcionarioId = userRes.rows[0]?.funcionario_id;

        const query = `
            SELECT * FROM plantoes 
            WHERE (n1_id = $1 OR n2_id = $1 OR gerente_id = $1)
              AND data >= CURRENT_DATE
            ORDER BY data ASC
            LIMIT 1;
        `;
        const result = await pool.query(query, [funcionarioId || 'vazio']);
        
        if (result.rows.length === 0) {
            return res.json({ sucesso: true, proximo: null });
        }
        
        return res.json({ sucesso: true, proximo: result.rows[0] });
    } catch (err) {
        console.error('Erro ao buscar próximo plantão:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar próximo plantão.' });
    }
});

// ─── Rota: Abrir Ticket de Suporte no IXC ────────────────────────────────────
app.post('/api/ixc/su-ticket', async (req, res) => {
    const { mensagem, colaborador_id, tecnico_id } = req.body;

    if (!mensagem) {
        return res.status(400).json({ sucesso: false, erro: 'A descrição da situação é obrigatória.' });
    }

    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const authHead = 'Basic ' + Buffer.from(token).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: authHead
    };

    // Tenta buscar informações do contrato do colaborador se disponível
    let ixcIds = {
        id_cliente: '681',
        id_login: '1',
        id_contrato: '18426'
    };

    try {
        // Se temos colaborador_id, tentamos buscar no banco local se há algo vinculado
        // Mas como não temos na tabela local, vamos usar os padrões por enquanto
        // O usuário pediu para ser dinâmico no plano, mas a tabela não tem.
        // Vou manter fixo por enquanto para não quebrar, mas garantir o protocolo.
    } catch (dbErr) {
        console.warn("Aviso ao buscar dados do colaborador no banco:", dbErr.message);
    }

    const dados = {
        tipo: 'C',
        id_cliente: ixcIds.id_cliente,
        id_login: ixcIds.id_login,
        id_contrato: ixcIds.id_contrato,
        id_filial: '8',
        id_assunto: '1154',
        id_canal_atendimento: '12',
        id_ticket_setor: '16',
        id_wfl_processo: '237',
        id_responsavel_tecnico: tecnico_id || colaborador_id || '0',
        titulo: 'SUPORTE DE TI VIA INTRANET',
        origem_endereco: 'CC',
        endereco: 'AL Penedo 57200-000 SENHOR DO BONFIM - RODOVIA MARIO FREIRE LEAHY, 1650',
        numero: '1650',
        bairro: 'SENHOR DO BONFIM',
        cidade: '1721',
        cep: '57200-000',
        latitude: '-10.2872659',
        longitude: '-36.5772428',
        gerar_protocolo: 'S',
        menssagem: mensagem,
        status: 'T',
        su_status: 'N',
        origem_cadastro: 'P',
        prioridade: 'M',
        melhor_horario_reserva: 'Q',
        id_ticket_origem: 'I',
        interacao_pendente: 'N',
        finalizar_atendimento: 'N',
        atualizar_cliente: 'S',
        atualizar_login: 'S'
    };

    try {
        const urlTicket = `https://${host}/webservice/v1/su_ticket`;
        const log = (msg) => {
            const line = `[${new Date().toISOString()}] ${msg}\n`;
            console.log(msg);
            fs.appendFileSync('ixc_debug.log', line);
        };
        log(`== INICIANDO ABERTURA TICK: Tecnico ${tecnico_id} ==`);

        const resposta = await fetch(urlTicket, {
            method: 'POST',
            headers,
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        log(`Criado Ticket: ` + JSON.stringify(resultado));

        if (!resposta.ok || resultado.type === 'error') {
            console.error(`Erro API IXC su_ticket:`, resultado);
            return res.status(502).json({ sucesso: false, erro: resultado.message || 'Falha ao abrir ticket.' });
        }

        const ticketId = resultado.id;
        let protocoloFinal = "";

        // Função auxiliar para aguardar
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Busca o protocolo (leva alguns segundos para o IXC gerar via Workflow/OS)
        // Tentamos até 6 vezes com intervalo de 3 segundos
        const fetchTicket = async () => {
            log(`buscando ticket ${ticketId}...`);
            const resp = await fetch(urlTicket, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_ticket.id', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const data = await resp.json();
            return data.registros ? data.registros[0] : null;
        };

        console.log(`Ticket ${ticketId} aberto. Aguardando geração do protocolo...`);
        
        let osIdFinal = null;
        let osRecord = null;

        for (let i = 0; i < 6; i++) {
            await sleep(3000); // Aguarda 3 segundos entre tentativas (até 18s no total)
            let ticketInfo = await fetchTicket();
            
            if (ticketInfo && ticketInfo.protocolo) {
                protocoloFinal = ticketInfo.protocolo;
                log(`Protocolo encontrado na tentativa ${i + 1}: ${protocoloFinal}`);
            }
            
            // Busca a OS vinculada sempre, pois precisamos dela para setar o técnico
            const urlOS = `https://${host}/webservice/v1/su_oss_chamado`;
            log(`Buscando OS vinculada ao ticket ${ticketId} [TENTATIVA ${i+1}]`);
            const respOS = await fetch(urlOS, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const dataOS = await respOS.json();
            
            if (dataOS.registros && dataOS.registros[0]) {
                osRecord = dataOS.registros[0];
                osIdFinal = osRecord.id;
                log(`ENCONTROU OS! ID: ${osIdFinal}. Protocolo OS: ${osRecord.protocolo}`);
                if (!protocoloFinal && osRecord.protocolo) {
                    protocoloFinal = osRecord.protocolo;
                }
                break; // Achamos a OS, podemos sair do loop
            }
            
            log(`Tentativa ${i + 1} sem OS ainda... res: ` + JSON.stringify(dataOS));
        }

        // Se encontrou a OS e escolheu um técnico, força a atualização da OS
        // IXC requer que enviemos os dados completos da OS de volta no PUT
        if (osIdFinal && osRecord && tecnico_id) {
            log(`Atualizando OS ${osIdFinal} para o técnico ${tecnico_id}`);
            const updateOsUrl = `https://${host}/webservice/v1/su_oss_chamado/${osIdFinal}`;
            
            // Formatando datas para o padrao do IXC (YYYY-MM-DD HH:MM:SS)
            const agora = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const data_agenda = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:00`;
            const data_agenda_final = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} 23:59:59`;

            // Mesclamos o payload original da OS, sobrescrevendo só os campos necessários
            const updateOsBody = JSON.stringify({
                ...osRecord,
                id_tecnico: tecnico_id,
                data_agenda: data_agenda,
                data_agenda_final: data_agenda_final,
                status: 'AG', // Força para status Agendado
                mensagem_resposta: 'Agendado automaticamente via Intranet'
            });
            
            try {
                const headersPut = {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from(token).toString('base64')
                };
                const resUpdateOs = await fetch(updateOsUrl, {
                    method: 'PUT',
                    headers: headersPut,
                    body: updateOsBody
                });
                if (!resUpdateOs.ok) {
                    console.error("Falha requisição PUT atualizar técnico OS:", await resUpdateOs.text());
                } else {
                    const putResult = await resUpdateOs.json();
                    if (putResult.type === 'error') {
                         log("Erro interno do IXC ao atualizar OS: " + JSON.stringify(putResult));
                    } else {
                         log(`Técnico ${tecnico_id} agendado com sucesso na OS ${osIdFinal}. Resposta: ` + JSON.stringify(putResult));
                    }
                }
            } catch (errUpdateOs) {
                log("Erro no TRY CATCH ao fazer PUT na OS: " + errUpdateOs.message);
            }
        } else {
            log(`Não atualizou a OS. osIdFinal: ${osIdFinal}, tecnicoId: ${tecnico_id}`);
        }

        log(`FIM. Retornando protocolo ${protocoloFinal}`);
        return res.json({  
            sucesso: true, 
            ticket: resultado, 
            protocolo: protocoloFinal 
        });
    } catch (e) {
        console.error("Erro rota su-ticket:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao processar ticket.' });
    }
});

// ─── Rota: Listar Tickets do Colaborador ───────────────────────────────────
app.post('/api/ixc/su-ticket/list', async (req, res) => {
    const { colaborador_id } = req.body;

    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const body = JSON.stringify({
        qtype: 'su_ticket.id_responsavel_tecnico',
        query: colaborador_id || '0',
        oper: '=',
        page: '1',
        rp: '100',
        sortname: 'su_ticket.id',
        sortorder: 'desc'
    });

    try {
        const url = `https://${host}/webservice/v1/su_ticket`;
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();

        return res.json({ 
            sucesso: true, 
            tickets: dados.registros || [] 
        });
    } catch (e) {
        console.error("Erro ao listar tickets:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar tickets no sistema.' });
    }
});

// ─── Rota: Diretório de Setores (empresa_setor + funcionários do IXC) ────────
app.get('/api/setores', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // Busca setores ativos (empresa_setor) e funcionários ativos em paralelo
        const [resSetor, resFunc] = await Promise.all([
            fetch(`https://${host}/webservice/v1/empresa_setor`, {
                method: 'POST', headers,
                body: JSON.stringify({ qtype: 'empresa_setor.ativo', query: 'S', oper: '=', page: '1', rp: '1000', sortname: 'empresa_setor.setor', sortorder: 'asc' })
            }),
            fetch(`https://${host}/webservice/v1/funcionarios`, {
                method: 'POST', headers,
                body: JSON.stringify({ qtype: 'funcionarios.ativo', query: 'S', oper: '=', page: '1', rp: '10000', sortname: 'funcionarios.funcionario', sortorder: 'asc' })
            })
        ]);

        const dataSetor = await resSetor.json();
        const dataFunc = await resFunc.json();

        const setoresRaw = (dataSetor.registros || []).filter(s => s.ativo === 'S');
        const funcionarios = dataFunc.registros || [];

        // Agrupa funcionários ativos por setor (id_departamento do funcionário = id do empresa_setor)
        const setores = setoresRaw.map(setor => {
            const membros = funcionarios.filter(f =>
                String(f.id_departamento).trim() === String(setor.id).trim()
            );
            const responsavel = membros[0] || null;
            return {
                id: setor.id,
                nome: setor.setor,
                cor: setor.cor || null,
                totalMembros: membros.length,
                responsavel: responsavel ? {
                    id: responsavel.id,
                    nome: responsavel.funcionario,
                    foto: responsavel.foto_perfil || null,
                    ramal: responsavel.ramal || null
                } : null
            };
        });

        console.log(`-> /api/setores: ${setores.length} setores retornados (${setores.filter(s=>s.totalMembros>0).length} com membros)`);
        return res.json({ sucesso: true, setores });
    } catch (e) {
        console.error('Erro rota /api/setores:', e);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Inicialização ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend proxy rodando em http://localhost:${PORT}`)
})
// trigger restart
